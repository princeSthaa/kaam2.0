using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.WorkCenter;
using backend.Model;

namespace backend.Service.WorkCenter
{
    public interface IWorkCenterService
    {
        // <crudgen:method-signatures>
        Task<List<WorkCenterDto>> GetAllAsync(
            string? id = null,
            string? name = null,
            string? type = null,
            string? status = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<bool> CreateAsync(WorkCenterDto workCenterDto);

        Task<bool> UpdateAsync(string id, WorkCenterDto workCenterDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
