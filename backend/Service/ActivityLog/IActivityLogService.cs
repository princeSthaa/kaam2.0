using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dto.ActivityLog;
using backend.Model;

namespace backend.Service.ActivityLog
{
    public interface IActivityLogService
    {
        // <crudgen:method-signatures>
        Task<List<ActivityLogDto>> GetAllAsync(
            Guid? id = null,
            string? title = null,
            string? text = null,
            DateTime? timestamp = null,
            string? entityId = null,
            string? entityType = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        );

        Task<ActivityLogDto?> GetByIdAsync(Guid id);

        Task<bool> CreateAsync(ActivityLogDto activityLogDto);

        Task<bool> UpdateAsync(Guid id, ActivityLogDto activityLogDto);

        Task<bool> DeleteAsync(Guid id);

        // </crudgen:method-signatures>
    }
}
