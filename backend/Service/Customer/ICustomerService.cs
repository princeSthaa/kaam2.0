using backend.Dto.Customer;

namespace backend.Service.Customer
{
    public interface ICustomerService
    {
        Task<bool> CreateAsync(CustomerDto customerDto);
        Task<List<CustomerDto>> GetAllAsync(
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
        );

        Task<CustomerDto?> GetByIdAsync(Guid id);


        Task<bool> UpdateAsync(Guid id, CustomerDto customerDto);

        Task<bool> DeleteAsync(Guid id);
    }
}
