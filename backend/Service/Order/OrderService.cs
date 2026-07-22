using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Order;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.Order
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<OrderDto>> GetAllAsync(
            string? id = null,
            string? orderNumber = null,
            OrderStatus? status = null,
            decimal? totalAmount = null,
            DateTime? dueDate = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? customerId = null
        )
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .AsQueryable();

            if (!string.IsNullOrEmpty(id)) query = query.Where(q => q.Id == id);
            if (!string.IsNullOrEmpty(orderNumber)) query = query.Where(q => q.OrderNumber == orderNumber);
            if (status.HasValue) query = query.Where(q => q.Status == status.Value);
            if (totalAmount.HasValue) query = query.Where(q => q.TotalAmount == totalAmount.Value);
            if (dueDate.HasValue) query = query.Where(q => q.DueDate == dueDate.Value);
            if (createdAt.HasValue) query = query.Where(q => q.CreatedAt == createdAt.Value);
            if (!string.IsNullOrEmpty(createdBy)) query = query.Where(q => q.CreatedBy == createdBy);
            if (updatedAt.HasValue) query = query.Where(q => q.UpdatedAt == updatedAt.Value);
            if (!string.IsNullOrEmpty(updatedBy)) query = query.Where(q => q.UpdatedBy == updatedBy);
            if (!string.IsNullOrEmpty(customerId)) query = query.Where(q => q.CustomerId == customerId);

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
                OrderItems = o.OrderItems.Select(oi => new backend.Dto.OrderItem.OrderItemDto
                {
                    Id = oi.Id,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    ProductId = oi.ProductId,
                    FabricId = oi.FabricId,
                    TotalPrice = oi.TotalPrice,
                    Discount = oi.Discount,
                    CreatedAt = oi.CreatedAt,
                    CreatedBy = oi.CreatedBy,
                    UpdatedAt = oi.UpdatedAt,
                    UpdatedBy = oi.UpdatedBy,
                    OrderId = oi.OrderId,
                    Product = oi.Product != null ? new backend.Dto.Product.ProductDto
                    {
                        Id = oi.Product.Id,
                        Name = oi.Product.Name,
                        ImagePath = oi.Product.ImagePath,
                        CreatedAt = oi.Product.CreatedAt,
                        CreatedBy = oi.Product.CreatedBy,
                        UpdatedAt = oi.Product.UpdatedAt,
                        UpdatedBy = oi.Product.UpdatedBy
                    } : null
                }).ToList()
            }).ToList();
        }


        public async Task<bool> CreateAsync(OrderDto orderDto)
        {

            if (string.IsNullOrEmpty(orderDto.Id)) {
                orderDto.Id = Guid.NewGuid().ToString();
            }

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

            if (orderDto.OrderItems != null)
            {
                foreach (var item in orderDto.OrderItems)
                {
                    item.Id = Guid.NewGuid().ToString();
                    await _context.Database.ExecuteSqlInterpolatedAsync($@"
                        EXEC sp_InsertOrderItem
                            @Id = {item.Id},
                            @Quantity = {item.Quantity},
                            @UnitPrice = {item.UnitPrice},
                            @ProductId = {item.ProductId},
                            @FabricId = {item.FabricId},
                            @TotalPrice = {item.TotalPrice},
                            @Discount = {item.Discount},
                            @CreatedAt = {item.CreatedAt},
                            @CreatedBy = {item.CreatedBy},
                            @UpdatedAt = {item.UpdatedAt},
                            @UpdatedBy = {item.UpdatedBy},
                            @OrderId = {orderDto.Id}
                    ");
                }
            }

            return true;
        }

        public async Task<bool> UpdateAsync(string id, OrderDto orderDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateOrder

                    @Id = {id},
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

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteOrder
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}

