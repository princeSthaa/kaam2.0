using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Supplier;
using backend.Model.Enums;

namespace backend.Service.Supplier
{
    public interface ISupplierService
    {
        Task<List<SupplierDto>> GetAllAsync(
            Guid? id = null,
            string? supplierCode = null,
            string? name = null,
            UserStatus? status = null,
            bool includeDeleted = false
        );

        Task<SupplierDto?> GetByIdAsync(Guid id);

        Task<SupplierDto> CreateAsync(SupplierCreateDto createDto);

        Task<bool> UpdateAsync(Guid id, SupplierUpdateDto updateDto);

        Task<bool> DeleteAsync(Guid id);

        Task<SupplierDto?> RecalculateMetricsAsync(Guid id);
    }
}
