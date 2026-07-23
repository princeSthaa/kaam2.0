using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dto.OrderItem;
using backend.Dto.OrderItemSize;
using backend.Dto.Order;
using backend.Model.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Service.Order
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<OrderDto>> GetAllAsync(
            Guid? id = null,
            string? orderNumber = null,
            OrderStatus? status = null,
            decimal? totalAmount = null,
            DateTime? dueDate = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? customerId = null
        )
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.OrderItemSizes)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Product)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Fabric)
                .AsNoTracking()
                .AsQueryable();

            if (id.HasValue) query = query.Where(o => o.Id == id.Value);
            if (!string.IsNullOrWhiteSpace(orderNumber)) query = query.Where(o => o.OrderNumber == orderNumber);
            if (status.HasValue) query = query.Where(o => o.Status == status.Value);
            if (totalAmount.HasValue) query = query.Where(o => o.TotalAmount == totalAmount.Value);
            if (dueDate.HasValue) query = query.Where(o => o.DueDate == dueDate.Value);
            if (createdAt.HasValue) query = query.Where(o => o.CreatedAt == createdAt.Value);
            if (!string.IsNullOrWhiteSpace(createdBy)) query = query.Where(o => o.CreatedBy == createdBy);
            if (updatedAt.HasValue) query = query.Where(o => o.UpdatedAt == updatedAt.Value);
            if (!string.IsNullOrWhiteSpace(updatedBy)) query = query.Where(o => o.UpdatedBy == updatedBy);
            if (customerId.HasValue) query = query.Where(o => o.CustomerId == customerId.Value);

            var orders = await query.ToListAsync();

            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                DueDate = o.DueDate,
                CreatedAt = o.CreatedAt,
                CreatedBy = o.CreatedBy,
                UpdatedAt = o.UpdatedAt,
                UpdatedBy = o.UpdatedBy,
                CustomerId = o.CustomerId,
                OrderItems = o.OrderItems.Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    Discount = i.Discount,
                    ProductId = i.ProductId,
                    FabricId = i.FabricId,
                    CreatedAt = i.CreatedAt,
                    CreatedBy = i.CreatedBy,
                    UpdatedAt = i.UpdatedAt,
                    UpdatedBy = i.UpdatedBy,
                    OrderId = i.OrderId,
                    Sizes = i.OrderItemSizes.Select(s => new OrderItemSizeDto
                    {
                        Id = s.Id,
                        Size = s.Size,
                        Quantity = s.Quantity,
                        CreatedAt = s.CreatedAt,
                        CreatedBy = s.CreatedBy,
                        UpdatedAt = s.UpdatedAt,
                        UpdatedBy = s.UpdatedBy,
                        OrderItemId = s.OrderItemId
                    }).ToList()
                }).ToList()
            }).ToList();
        }

        public async Task<OrderDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(OrderDto orderDto)
        {
            if (orderDto.Id == Guid.Empty)
            {
                orderDto.Id = Guid.NewGuid();
            }

            if (orderDto.CreatedAt == default) orderDto.CreatedAt = DateTime.UtcNow;
            if (orderDto.UpdatedAt == default) orderDto.UpdatedAt = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertOrder
                    @Id = {orderDto.Id},
                    @OrderNumber = {orderDto.OrderNumber},
                    @Status = {orderDto.Status},
                    @TotalAmount = {orderDto.TotalAmount},
                    @DueDate = {orderDto.DueDate},
                    @CreatedAt = {orderDto.CreatedAt},
                    @CreatedBy = {orderDto.CreatedBy},
                    @UpdatedAt = {orderDto.UpdatedAt},
                    @UpdatedBy = {orderDto.UpdatedBy},
                    @CustomerId = {orderDto.CustomerId}
            ");

            if (orderDto.OrderItems != null && orderDto.OrderItems.Count > 0)
            {
                foreach (var item in orderDto.OrderItems)
                {
                    if (item.Id == Guid.Empty) item.Id = Guid.NewGuid();
                    item.OrderId = orderDto.Id;
                    if (item.CreatedAt == default) item.CreatedAt = DateTime.UtcNow;
                    if (item.UpdatedAt == default) item.UpdatedAt = DateTime.UtcNow;

                    // Calculate total quantity from sizes if sizes are provided
                    if (item.Sizes != null && item.Sizes.Count > 0)
                    {
                        item.Quantity = item.Sizes.Sum(s => s.Quantity);
                    }

                    await _context.Database.ExecuteSqlInterpolatedAsync($@"
                        EXEC sp_InsertOrderItem
                            @Id = {item.Id},
                            @Quantity = {item.Quantity},
                            @UnitPrice = {item.UnitPrice},
                            @TotalPrice = {item.TotalPrice},
                            @Discount = {item.Discount},
                            @CreatedAt = {item.CreatedAt},
                            @CreatedBy = {item.CreatedBy},
                            @UpdatedAt = {item.UpdatedAt},
                            @UpdatedBy = {item.UpdatedBy},
                            @ProductId = {item.ProductId},
                            @FabricId = {item.FabricId},
                            @OrderId = {item.OrderId}
                    ");

                    if (item.Sizes != null && item.Sizes.Count > 0)
                    {
                        foreach (var size in item.Sizes)
                        {
                            if (size.Id == Guid.Empty) size.Id = Guid.NewGuid();
                            size.OrderItemId = item.Id;
                            if (size.CreatedAt == default) size.CreatedAt = DateTime.UtcNow;
                            if (size.UpdatedAt == default) size.UpdatedAt = DateTime.UtcNow;

                            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                                EXEC sp_InsertOrderItemSize
                                    @Id = {size.Id},
                                    @Size = {size.Size},
                                    @Quantity = {size.Quantity},
                                    @CreatedAt = {size.CreatedAt},
                                    @CreatedBy = {size.CreatedBy},
                                    @UpdatedAt = {size.UpdatedAt},
                                    @UpdatedBy = {size.UpdatedBy},
                                    @OrderItemId = {size.OrderItemId}
                            ");
                        }
                    }
                }
            }

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, OrderDto orderDto)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateOrder
                    @Id = {orderDto.Id},
                    @OrderNumber = {orderDto.OrderNumber},
                    @Status = {orderDto.Status},
                    @TotalAmount = {orderDto.TotalAmount},
                    @DueDate = {orderDto.DueDate},
                    @CreatedAt = {orderDto.CreatedAt},
                    @CreatedBy = {orderDto.CreatedBy},
                    @UpdatedAt = {orderDto.UpdatedAt},
                    @UpdatedBy = {orderDto.UpdatedBy},
                    @CustomerId = {orderDto.CustomerId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteOrder
                    @Id = {id}
            ");

            return true;
        }
    }
}
