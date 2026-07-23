using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Fabric;
using backend.Model;

namespace backend.Service.Fabric
{
    public class FabricService : IFabricService
    {
        private readonly AppDbContext _context;

        public FabricService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<FabricDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? category = null,
            string? imagePath = null,
            decimal? unitPrice = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<FabricDto>($@"
                    EXEC sp_GetFabrics

                        @Id = {id},
                        @Name = {name},
                        @Category = {category},
                        @ImagePath = {imagePath},
                        @UnitPrice = {unitPrice},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<FabricDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(FabricDto fabricDto)
        {
            if (fabricDto.Id == Guid.Empty)
            {
                fabricDto.Id = Guid.NewGuid();
            }

            fabricDto.ImagePath = backend.Helpers.ImagePathHelper.ToRelativePath(fabricDto.ImagePath);

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertFabric
                    @Id = {fabricDto.Id},
                    @Name = {fabricDto.Name},
                    @Category = {fabricDto.Category},
                    @ImagePath = {fabricDto.ImagePath},
                    @UnitPrice = {fabricDto.UnitPrice},
                    @CreatedAt = {fabricDto.CreatedAt},
                    @CreatedBy = {fabricDto.CreatedBy},
                    @UpdatedAt = {fabricDto.UpdatedAt},
                    @UpdatedBy = {fabricDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, FabricDto fabricDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateFabric

                    @Id = {fabricDto.Id},
                    @Name = {fabricDto.Name},
                    @Category = {fabricDto.Category},
                    @ImagePath = {fabricDto.ImagePath},
                    @UnitPrice = {fabricDto.UnitPrice},
                    @CreatedAt = {fabricDto.CreatedAt},
                    @CreatedBy = {fabricDto.CreatedBy},
                    @UpdatedAt = {fabricDto.UpdatedAt},
                    @UpdatedBy = {fabricDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteFabric
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
