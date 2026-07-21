using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.ActivityLog;
using backend.Model;

namespace backend.Service.ActivityLog
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly AppDbContext _context;

        public ActivityLogService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<ActivityLogDto>> GetAllAsync(
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
        )
        {
            return await _context.Database
                .SqlQuery<ActivityLogDto>($@"
                    EXEC sp_GetActivityLogs

                        @Id = {id},
                        @Title = {title},
                        @Text = {text},
                        @Timestamp = {timestamp},
                        @EntityId = {entityId},
                        @EntityType = {entityType},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(ActivityLogDto activityLogDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertActivityLog

                    @Title = {activityLogDto.Title},
                    @Text = {activityLogDto.Text},
                    @Timestamp = {activityLogDto.Timestamp},
                    @EntityId = {activityLogDto.EntityId},
                    @EntityType = {activityLogDto.EntityType},
                    @CreatedAt = {activityLogDto.CreatedAt},
                    @CreatedBy = {activityLogDto.CreatedBy},
                    @UpdatedAt = {activityLogDto.UpdatedAt},
                    @UpdatedBy = {activityLogDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(string id, ActivityLogDto activityLogDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateActivityLog

                    @Id = {id},
                    @Title = {activityLogDto.Title},
                    @Text = {activityLogDto.Text},
                    @Timestamp = {activityLogDto.Timestamp},
                    @EntityId = {activityLogDto.EntityId},
                    @EntityType = {activityLogDto.EntityType},
                    @CreatedAt = {activityLogDto.CreatedAt},
                    @CreatedBy = {activityLogDto.CreatedBy},
                    @UpdatedAt = {activityLogDto.UpdatedAt},
                    @UpdatedBy = {activityLogDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteActivityLog
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
