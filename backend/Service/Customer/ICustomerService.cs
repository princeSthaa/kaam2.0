using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Customer;
using backend.Model;

namespace backend.Service.Customer
{
    public interface ICustomerService
    {
        // <crudgen:method-signatures>
        Task<List<CustomerDto>> GetAllAsync(
            string? id = null,
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
        );

        Task<bool> CreateAsync(CustomerDto customerDto);

        Task<bool> UpdateAsync(string id, CustomerDto customerDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
