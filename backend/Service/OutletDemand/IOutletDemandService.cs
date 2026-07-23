using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.OutletDemand;
using backend.Model;

namespace backend.Service.OutletDemand
{
    public interface IOutletDemandService
    {
        // <crudgen:method-signatures>
        Task<List<OutletDemandDto>> GetAllAsync(
            Guid? id = null,
            string? demandNumber = null,
            string? status = null,
            DateTime? dueDate = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? outletId = null
        );

        Task<OutletDemandDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(OutletDemandDto outletDemandDto);

        Task<bool> UpdateAsync(Guid id, OutletDemandDto outletDemandDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}

