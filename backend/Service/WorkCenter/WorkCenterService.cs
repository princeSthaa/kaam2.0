using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.WorkCenter;
using backend.Model;

namespace backend.Service.WorkCenter
{
    public class WorkCenterService : IWorkCenterService
    {
        private readonly AppDbContext _context;

        public WorkCenterService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<WorkCenterDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? type = null,
            string? status = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<WorkCenterDto>($@"
                    EXEC sp_GetWorkCenters

                        @Id = {id},
                        @Name = {name},
                        @Type = {type},
                        @Status = {status},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<WorkCenterDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(WorkCenterDto workCenterDto)
        {
            if (workCenterDto.Id == Guid.Empty)
            {
                workCenterDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWorkCenter

                    @Id = {workCenterDto.Id},
                    @Name = {workCenterDto.Name},
                    @Type = {workCenterDto.Type},
                    @Status = {workCenterDto.Status},
                    @CreatedAt = {workCenterDto.CreatedAt},
                    @CreatedBy = {workCenterDto.CreatedBy},
                    @UpdatedAt = {workCenterDto.UpdatedAt},
                    @UpdatedBy = {workCenterDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, WorkCenterDto workCenterDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWorkCenter

                    @Id = {workCenterDto.Id},
                    @Name = {workCenterDto.Name},
                    @Type = {workCenterDto.Type},
                    @Status = {workCenterDto.Status},
                    @CreatedAt = {workCenterDto.CreatedAt},
                    @CreatedBy = {workCenterDto.CreatedBy},
                    @UpdatedAt = {workCenterDto.UpdatedAt},
                    @UpdatedBy = {workCenterDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteWorkCenter
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
