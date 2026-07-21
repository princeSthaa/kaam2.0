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
            string? id = null,
            string? demandNumber = null,
            string? status = null,
            DateTime? dueDate = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            string? outletId = null
        );

        Task<bool> CreateAsync(OutletDemandDto outletDemandDto);

        Task<bool> UpdateAsync(string id, OutletDemandDto outletDemandDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}

