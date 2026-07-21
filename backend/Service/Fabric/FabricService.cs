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
            string? id = null,
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

        public async Task<bool> CreateAsync(FabricDto fabricDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertFabric

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

        public async Task<bool> UpdateAsync(string id, FabricDto fabricDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateFabric

                    @Id = {id},
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

        public async Task<bool> DeleteAsync(string id)
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
