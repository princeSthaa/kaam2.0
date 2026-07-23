using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.CustomerReturn;
using backend.Model;

namespace backend.Service.CustomerReturn
{
    public interface ICustomerReturnService
    {
        // <crudgen:method-signatures>
        Task<List<CustomerReturnDto>> GetAllAsync(
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
        );

        Task<CustomerReturnDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(CustomerReturnDto customerReturnDto);

        Task<bool> UpdateAsync(Guid id, CustomerReturnDto customerReturnDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
