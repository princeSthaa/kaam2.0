using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.OrderItemSize;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.OrderItemSize
{
    public class OrderItemSizeService : IOrderItemSizeService
    {
        private readonly AppDbContext _context;

        public OrderItemSizeService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<OrderItemSizeGetDto>> GetAllAsync(
            Guid? id = null,
            ProductSize? size = null,
            int? quantity = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? orderItemId = null
        )
        {
            return await _context.Database
                .SqlQuery<OrderItemSizeGetDto>($@"
                    EXEC sp_GetOrderItemSizes

                        @Id = {id},
                        @Size = {size},
                        @Quantity = {quantity},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @OrderItemId = {orderItemId}
                ")
                .ToListAsync();
        }

        public async Task<OrderItemSizeGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(OrderItemSizeDto orderItemSizeDto)
        {
            if (orderItemSizeDto.Id == Guid.Empty)
            {
                orderItemSizeDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertOrderItemSize

                    @Id = {orderItemSizeDto.Id},
                    @Size = {orderItemSizeDto.Size},
                    @Quantity = {orderItemSizeDto.Quantity},
                    @CreatedAt = {orderItemSizeDto.CreatedAt},
                    @CreatedBy = {orderItemSizeDto.CreatedBy},
                    @UpdatedAt = {orderItemSizeDto.UpdatedAt},
                    @UpdatedBy = {orderItemSizeDto.UpdatedBy},
                    @OrderItemId = {orderItemSizeDto.OrderItemId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, OrderItemSizeDto orderItemSizeDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateOrderItemSize

                    @Id = {orderItemSizeDto.Id},
                    @Size = {orderItemSizeDto.Size},
                    @Quantity = {orderItemSizeDto.Quantity},
                    @CreatedAt = {orderItemSizeDto.CreatedAt},
                    @CreatedBy = {orderItemSizeDto.CreatedBy},
                    @UpdatedAt = {orderItemSizeDto.UpdatedAt},
                    @UpdatedBy = {orderItemSizeDto.UpdatedBy},
                    @OrderItemId = {orderItemSizeDto.OrderItemId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteOrderItemSize
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
