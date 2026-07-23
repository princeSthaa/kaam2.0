using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.Outlet;
using backend.Model;

namespace backend.Service.Outlet
{
    public interface IOutletService
    {
        // <crudgen:method-signatures>
        Task<List<OutletDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? location = null,
            string? code = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<OutletDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(OutletDto outletDto);

        Task<bool> UpdateAsync(Guid id, OutletDto outletDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
