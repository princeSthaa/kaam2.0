using Dapper;
using System.Data;
using backend.Data;
using backend.Dto.OrderItem;
using backend.Dto.OrderItemSize;
using backend.Dto.Order;
using Microsoft.EntityFrameworkCore;
using backend.Dto.OrderItemMaterial;

namespace backend.Service.Order
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<OrderGetDto>> GetAllAsync(
            Guid? id = null,
            string? orderNumber = null,
            backend.Model.Enums.OrderStatus? status = null,
            decimal? totalAmount = null,
            DateTime? dueDate = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? customerId = null
        )
        {
            var connection = _context.Database.GetDbConnection();
            var parameters = new Dapper.DynamicParameters();
            parameters.Add("@Id", id);

            
            using var multi = await connection.QueryMultipleAsync(
                "sp_GetOrders",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            var orders = (await multi.ReadAsync<OrderGetDto>()).ToList();
            var items = (await multi.ReadAsync<backend.Dto.OrderItem.OrderItemGetDto>()).ToList();
            var sizes = (await multi.ReadAsync<backend.Dto.OrderItemSize.OrderItemSizeGetDto>()).ToList();
            var materials = (await multi.ReadAsync<backend.Dto.OrderItemMaterial.OrderItemMaterialGetDto>()).ToList();

            foreach (var item in items)
            {
                item.OrderItemSizes = sizes.Where(s => s.OrderItemId == item.Id).ToList();
                item.OrderItemMaterials = materials.Where(m => m.OrderItemId == item.Id).ToList();
            }

            foreach (var order in orders)
            {
                order.OrderItems = items.Where(i => i.OrderId == order.Id).ToList();
            }

            // Filtering done in memory

            if (!string.IsNullOrWhiteSpace(orderNumber)) orders = orders.Where(o => o.OrderNumber == orderNumber).ToList();
            if (status.HasValue) orders = orders.Where(o => o.Status == status.Value).ToList();
            if (customerId.HasValue) orders = orders.Where(o => o.CustomerId == customerId.Value).ToList();
            return orders;
        }

        public static OrderGetDto MapOrderToDto(backend.Model.Order order)
        {
            return new OrderGetDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                DueDate = order.DueDate,
                CustomerId = order.CustomerId,
                ProductionPlanId = order.ProductionPlanId,
                OrderItems = order.OrderItems.Select(i => new OrderItemGetDto
                {
                    Id = i.Id,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    Discount = i.Discount,
                    ProductId = i.ProductId,
                    Product = i.Product == null ? null : new OrderProductGetDto
                    {
                        Id = i.Product.Id,
                        Name = i.Product.Name,
                        ImagePath = i.Product.ImagePath
                    },
                    OrderItemMaterials = i.OrderItemMaterials.Select(m => new OrderItemMaterialGetDto
                    {
                        Id = m.Id,
                        MaterialId = m.MaterialId,
                        RequiredQuantity = m.RequiredQuantity,
                        Unit = m.Unit,

                        Material = m.Material == null ? null : new OrderMaterialGetDto
                        {
                            Id = m.Material.Id,
                            Name = m.Material.Name,
                            ImagePath = m.Material.ImagePath,
                            MaterialCategoryName = m.Material.MaterialCategory?.Name
                        },

                        OrderItemId = m.OrderItemId
                    }).ToList(),

                    OrderId = i.OrderId,
                    OrderItemSizes = i.OrderItemSizes.Select(s => new OrderItemSizeGetDto
                    {
                        Id = s.Id,
                        Size = s.Size,
                        Quantity = s.Quantity
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<OrderGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(OrderDto orderDto)
        {
            orderDto.Id = Guid.NewGuid();
            var now = DateTime.UtcNow;


            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertOrder
                    @Id = {orderDto.Id},
                    @OrderNumber = {orderDto.OrderNumber},
                    @Status = {orderDto.Status},
                    @TotalAmount = {orderDto.TotalAmount},
                    @DueDate = {orderDto.DueDate},
                    @CreatedAt = {orderDto.CreatedAt},
                    @CreatedBy = {orderDto.CreatedBy},
                    @UpdatedAt = {now},
                    @UpdatedBy = {now},
                    @CustomerId = {orderDto.CustomerId}
            ");

            if (orderDto.OrderItems != null && orderDto.OrderItems.Any())
            {
                foreach (var item in orderDto.OrderItems)
                {
                    if (item.Id == Guid.Empty)
                        item.Id = Guid.NewGuid();

                    item.OrderId = orderDto.Id;

                    if (item.CreatedAt == default)
                        item.CreatedAt = DateTime.UtcNow;

                    if (item.UpdatedAt == default)
                        item.UpdatedAt = DateTime.UtcNow;

                    // Calculate total quantity from sizes
                    if (item.OrderItemSizes != null && item.OrderItemSizes.Any())
                    {
                        item.Quantity = item.OrderItemSizes.Sum(s => s.Quantity);
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
                            @OrderId = {item.OrderId}
                    ");

                    // Insert Sizes
                    if (item.OrderItemSizes != null && item.OrderItemSizes.Any())
                    {
                        foreach (var size in item.OrderItemSizes)
                        {
                            if (size.Id == Guid.Empty)
                                size.Id = Guid.NewGuid();

                            size.OrderItemId = item.Id;

                            if (size.CreatedAt == default)
                                size.CreatedAt = DateTime.UtcNow;

                            if (size.UpdatedAt == default)
                                size.UpdatedAt = DateTime.UtcNow;

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

                    // Insert Materials
                    if (item.OrderItemMaterials != null && item.OrderItemMaterials.Any())
                    {
                        foreach (var material in item.OrderItemMaterials)
                        {
                            if (material.Id == Guid.Empty)
                                material.Id = Guid.NewGuid();

                            material.OrderItemId = item.Id;

                            if (material.CreatedAt == default)
                                material.CreatedAt = DateTime.UtcNow;

                            if (material.UpdatedAt == default)
                                material.UpdatedAt = DateTime.UtcNow;

                            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                                EXEC sp_InsertOrderItemMaterial
                                    @Id = {material.Id},
                                    @RequiredQuantity = {material.RequiredQuantity},
                                    @Unit = {material.Unit},
                                    @CreatedAt = {material.CreatedAt},
                                    @CreatedBy = {material.CreatedBy},
                                    @UpdatedAt = {material.UpdatedAt},
                                    @UpdatedBy = {material.UpdatedBy},
                                    @MaterialId = {material.MaterialId},
                                    @OrderItemId = {material.OrderItemId}
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
