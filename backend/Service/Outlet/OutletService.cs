using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Outlet;
using backend.Model;

namespace backend.Service.Outlet
{
    public class OutletService : IOutletService
    {
        private readonly AppDbContext _context;

        public OutletService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<OutletDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? location = null,
            string? code = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<OutletDto>($@"
                    EXEC sp_GetOutlets

                        @Id = {id},
                        @Name = {name},
                        @Location = {location},
                        @Code = {code},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<OutletDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(OutletDto outletDto)
        {
            if (outletDto.Id == Guid.Empty)
            {
                outletDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertOutlet

                    @Id = {outletDto.Id},
                    @Name = {outletDto.Name},
                    @Location = {outletDto.Location},
                    @Code = {outletDto.Code},
                    @CreatedAt = {outletDto.CreatedAt},
                    @CreatedBy = {outletDto.CreatedBy},
                    @UpdatedAt = {outletDto.UpdatedAt},
                    @UpdatedBy = {outletDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, OutletDto outletDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateOutlet

                    @Id = {outletDto.Id},
                    @Name = {outletDto.Name},
                    @Location = {outletDto.Location},
                    @Code = {outletDto.Code},
                    @CreatedAt = {outletDto.CreatedAt},
                    @CreatedBy = {outletDto.CreatedBy},
                    @UpdatedAt = {outletDto.UpdatedAt},
                    @UpdatedBy = {outletDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteOutlet
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
