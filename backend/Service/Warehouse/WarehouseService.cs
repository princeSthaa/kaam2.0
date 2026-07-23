using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Warehouse;
using backend.Model;

namespace backend.Service.Warehouse
{
    public class WarehouseService : IWarehouseService
    {
        private readonly AppDbContext _context;

        public WarehouseService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<WarehouseDto>> GetAllAsync(
            Guid? id = null,
            string? code = null,
            string? name = null,
            string? location = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<WarehouseDto>($@"
                    EXEC sp_GetWarehouses

                        @Id = {id},
                        @Code = {code},
                        @Name = {name},
                        @Location = {location},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<WarehouseDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(WarehouseDto warehouseDto)
        {
            if (warehouseDto.Id == Guid.Empty)
            {
                warehouseDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertWarehouse

                    @Id = {warehouseDto.Id},
                    @Code = {warehouseDto.Code},
                    @Name = {warehouseDto.Name},
                    @Location = {warehouseDto.Location},
                    @CreatedAt = {warehouseDto.CreatedAt},
                    @CreatedBy = {warehouseDto.CreatedBy},
                    @UpdatedAt = {warehouseDto.UpdatedAt},
                    @UpdatedBy = {warehouseDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, WarehouseDto warehouseDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateWarehouse

                    @Id = {warehouseDto.Id},
                    @Code = {warehouseDto.Code},
                    @Name = {warehouseDto.Name},
                    @Location = {warehouseDto.Location},
                    @CreatedAt = {warehouseDto.CreatedAt},
                    @CreatedBy = {warehouseDto.CreatedBy},
                    @UpdatedAt = {warehouseDto.UpdatedAt},
                    @UpdatedBy = {warehouseDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteWarehouse
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
