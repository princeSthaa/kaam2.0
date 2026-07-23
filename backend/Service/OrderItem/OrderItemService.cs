using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.OrderItem;
using backend.Model;

namespace backend.Service.OrderItem
{
    public class OrderItemService : IOrderItemService
    {
        private readonly AppDbContext _context;

        public OrderItemService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<OrderItemDto>> GetAllAsync(
            Guid? id = null,
            int? quantity = null,
            decimal? unitPrice = null,
            decimal? totalPrice = null,
            decimal? discount = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? orderId = null
        )
        {
            return await _context.Database
                .SqlQuery<OrderItemDto>($@"
                    EXEC sp_GetOrderItems

                        @Id = {id},
                        @Quantity = {quantity},
                        @UnitPrice = {unitPrice},
                        @TotalPrice = {totalPrice},
                        @Discount = {discount},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @OrderId = {orderId}
                ")
                .ToListAsync();
        }

        public async Task<OrderItemDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(OrderItemDto orderItemDto)
        {
            if (orderItemDto.Id == Guid.Empty)
            {
                orderItemDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertOrderItem

                    @Id = {orderItemDto.Id},
                    @Quantity = {orderItemDto.Quantity},
                    @UnitPrice = {orderItemDto.UnitPrice},
                    @TotalPrice = {orderItemDto.TotalPrice},
                    @Discount = {orderItemDto.Discount},
                    @CreatedAt = {orderItemDto.CreatedAt},
                    @CreatedBy = {orderItemDto.CreatedBy},
                    @UpdatedAt = {orderItemDto.UpdatedAt},
                    @UpdatedBy = {orderItemDto.UpdatedBy},
                    @ProductId = {orderItemDto.ProductId},
                    @FabricId = {orderItemDto.FabricId},
                    @OrderId = {orderItemDto.OrderId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, OrderItemDto orderItemDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateOrderItem

                    @Id = {orderItemDto.Id},
                    @Quantity = {orderItemDto.Quantity},
                    @UnitPrice = {orderItemDto.UnitPrice},
                    @TotalPrice = {orderItemDto.TotalPrice},
                    @Discount = {orderItemDto.Discount},
                    @CreatedAt = {orderItemDto.CreatedAt},
                    @CreatedBy = {orderItemDto.CreatedBy},
                    @UpdatedAt = {orderItemDto.UpdatedAt},
                    @UpdatedBy = {orderItemDto.UpdatedBy},
                    @ProductId = {orderItemDto.ProductId},
                    @FabricId = {orderItemDto.FabricId},
                    @OrderId = {orderItemDto.OrderId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteOrderItem
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}

