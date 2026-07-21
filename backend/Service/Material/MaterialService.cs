using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Material;
using backend.Model;

namespace backend.Service.Material
{
    public class MaterialService : IMaterialService
    {
        private readonly AppDbContext _context;

        public MaterialService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<MaterialDto>> GetAllAsync(
            string? id = null,
            string? materialCode = null,
            string? name = null,
            string? type = null,
            decimal? availableQty = null,
            string? unit = null,
            decimal? costPerUnit = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialDto>($@"
                    EXEC sp_GetMaterials

                        @Id = {id},
                        @MaterialCode = {materialCode},
                        @Name = {name},
                        @Type = {type},
                        @AvailableQty = {availableQty},
                        @Unit = {unit},
                        @CostPerUnit = {costPerUnit},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(MaterialDto materialDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterial

                    @MaterialCode = {materialDto.MaterialCode},
                    @Name = {materialDto.Name},
                    @Type = {materialDto.Type},
                    @AvailableQty = {materialDto.AvailableQty},
                    @Unit = {materialDto.Unit},
                    @CostPerUnit = {materialDto.CostPerUnit},
                    @CreatedAt = {materialDto.CreatedAt},
                    @CreatedBy = {materialDto.CreatedBy},
                    @UpdatedAt = {materialDto.UpdatedAt},
                    @UpdatedBy = {materialDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(string id, MaterialDto materialDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterial

                    @Id = {id},
                    @MaterialCode = {materialDto.MaterialCode},
                    @Name = {materialDto.Name},
                    @Type = {materialDto.Type},
                    @AvailableQty = {materialDto.AvailableQty},
                    @Unit = {materialDto.Unit},
                    @CostPerUnit = {materialDto.CostPerUnit},
                    @CreatedAt = {materialDto.CreatedAt},
                    @CreatedBy = {materialDto.CreatedBy},
                    @UpdatedAt = {materialDto.UpdatedAt},
                    @UpdatedBy = {materialDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteMaterial
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
