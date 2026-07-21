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
            string? id = null,
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

        Task<bool> CreateAsync(ActivityLogDto activityLogDto);

        Task<bool> UpdateAsync(string id, ActivityLogDto activityLogDto);

        Task<bool> DeleteAsync(string id);

        // </crudgen:method-signatures>
    }
}
