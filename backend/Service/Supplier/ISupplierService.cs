using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Supplier;

namespace backend.Service.Supplier
{
    public interface ISupplierService
    {
        Task<List<SupplierDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? status = null
        );

        Task<SupplierDto?> GetByIdAsync(Guid id);

        Task<SupplierDto> CreateAsync(SupplierDto supplierDto);

        Task<bool> UpdateAsync(Guid id, SupplierDto supplierDto);

        Task<bool> DeleteAsync(Guid id);

        Task<SupplierDto?> RecalculateMetricsAsync(Guid id);
    }
}
