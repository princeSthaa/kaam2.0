using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Customer;
using backend.Model;

namespace backend.Service.Customer
{
    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<CustomerDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? email = null,
            string? phone = null,
            string? address = null,
            string? type = null,
            string? company = null,
            string? panVat = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<CustomerDto>($@"
                    EXEC sp_GetCustomers

                        @Id = {id},
                        @Name = {name},
                        @Email = {email},
                        @Phone = {phone},
                        @Address = {address},
                        @Type = {type},
                        @Company = {company},
                        @PanVat = {panVat},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<CustomerDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(CustomerDto customerDto)
        {
            if (customerDto.Id == Guid.Empty)
            {
                customerDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertCustomer

                    @Id = {customerDto.Id},
                    @Name = {customerDto.Name},
                    @Email = {customerDto.Email},
                    @Phone = {customerDto.Phone},
                    @Address = {customerDto.Address},
                    @Type = {customerDto.Type},
                    @Company = {customerDto.Company},
                    @PanVat = {customerDto.PanVat},
                    @CreatedAt = {customerDto.CreatedAt},
                    @CreatedBy = {customerDto.CreatedBy},
                    @UpdatedAt = {customerDto.UpdatedAt},
                    @UpdatedBy = {customerDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, CustomerDto customerDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateCustomer

                    @Id = {customerDto.Id},
                    @Name = {customerDto.Name},
                    @Email = {customerDto.Email},
                    @Phone = {customerDto.Phone},
                    @Address = {customerDto.Address},
                    @Type = {customerDto.Type},
                    @Company = {customerDto.Company},
                    @PanVat = {customerDto.PanVat},
                    @CreatedAt = {customerDto.CreatedAt},
                    @CreatedBy = {customerDto.CreatedBy},
                    @UpdatedAt = {customerDto.UpdatedAt},
                    @UpdatedBy = {customerDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteCustomer
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
