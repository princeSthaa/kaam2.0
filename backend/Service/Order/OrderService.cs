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
            return await _context.Database
                .SqlQuery<OrderDto>($@"
                    EXEC sp_GetOrders

                        @Id = {id},
                        @OrderNumber = {orderNumber},
                        @Status = {status},
                        @TotalAmount = {totalAmount},
                        @DueDate = {dueDate},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @CustomerId = {customerId}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(OrderDto orderDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertOrder

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

