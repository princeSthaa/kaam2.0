using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.CustomerReturn;
using backend.Model;

namespace backend.Service.CustomerReturn
{
    public class CustomerReturnService : ICustomerReturnService
    {
        private readonly AppDbContext _context;

        public CustomerReturnService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<CustomerReturnDto>> GetAllAsync(
            Guid? id = null,
            string? orderNumber = null,
            string? customerName = null,
            string? productId = null,
            int? returnedQuantity = null,
            string? reason = null,
            string? notes = null,
            string? processedBy = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<CustomerReturnDto>($@"
                    EXEC sp_GetCustomerReturns

                        @Id = {id},
                        @OrderNumber = {orderNumber},
                        @CustomerName = {customerName},
                        @ProductId = {productId},
                        @ReturnedQuantity = {returnedQuantity},
                        @Reason = {reason},
                        @Notes = {notes},
                        @ProcessedBy = {processedBy},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<CustomerReturnDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(CustomerReturnDto customerReturnDto)
        {
            if (customerReturnDto.Id == Guid.Empty)
            {
                customerReturnDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertCustomerReturn

                    @Id = {customerReturnDto.Id},
                    @OrderNumber = {customerReturnDto.OrderNumber},
                    @CustomerName = {customerReturnDto.CustomerName},
                    @ProductId = {customerReturnDto.ProductId},
                    @ReturnedQuantity = {customerReturnDto.ReturnedQuantity},
                    @Reason = {customerReturnDto.Reason},
                    @Notes = {customerReturnDto.Notes},
                    @ProcessedBy = {customerReturnDto.ProcessedBy},
                    @CreatedAt = {customerReturnDto.CreatedAt},
                    @CreatedBy = {customerReturnDto.CreatedBy},
                    @UpdatedAt = {customerReturnDto.UpdatedAt},
                    @UpdatedBy = {customerReturnDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, CustomerReturnDto customerReturnDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateCustomerReturn

                    @Id = {customerReturnDto.Id},
                    @OrderNumber = {customerReturnDto.OrderNumber},
                    @CustomerName = {customerReturnDto.CustomerName},
                    @ProductId = {customerReturnDto.ProductId},
                    @ReturnedQuantity = {customerReturnDto.ReturnedQuantity},
                    @Reason = {customerReturnDto.Reason},
                    @Notes = {customerReturnDto.Notes},
                    @ProcessedBy = {customerReturnDto.ProcessedBy},
                    @CreatedAt = {customerReturnDto.CreatedAt},
                    @CreatedBy = {customerReturnDto.CreatedBy},
                    @UpdatedAt = {customerReturnDto.UpdatedAt},
                    @UpdatedBy = {customerReturnDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteCustomerReturn
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
