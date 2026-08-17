using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Customer;

namespace backend.Service.Customer
{
    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(CustomerDto dto)
        {
            dto.Id = Guid.NewGuid();
            var now = DateTime.UtcNow;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertCustomer

                    @Id = {dto.Id},
                    @Name = {dto.Name},
                    @Email = {dto.Email},
                    @Phone = {dto.Phone},
                    @Address = {dto.Address},
                    @Type = {dto.Type},
                    @Company = {dto.Company},
                    @PanVat = {dto.PanVat},
                    @CreatedAt = {now},
                    @UpdatedAt = {now}
            ");

            return true;
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
            DateTime? updatedAt = null
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
                        @UpdatedAt = {updatedAt}
                ")
                .ToListAsync();
        }

        public async Task<CustomerDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
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
                    @UpdatedAt = {DateTime.UtcNow},
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
