using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialType;
using backend.Model;

namespace backend.Service.MaterialType
{
    public class MaterialTypeService : IMaterialTypeService
    {
        private readonly AppDbContext _context;

        public MaterialTypeService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<MaterialTypeGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialTypeGetDto>($@"
                    EXEC sp_GetMaterialTypes

                        @Id = {id},
                        @Name = {name},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<MaterialTypeGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(MaterialTypeDto materialTypeDto)
        {
            if (materialTypeDto.Id == Guid.Empty)
            {
                materialTypeDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialType

                    @Id = {materialTypeDto.Id},
                    @Name = {materialTypeDto.Name},
                    @CreatedAt = {materialTypeDto.CreatedAt},
                    @CreatedBy = {materialTypeDto.CreatedBy},
                    @UpdatedAt = {materialTypeDto.UpdatedAt},
                    @UpdatedBy = {materialTypeDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, MaterialTypeDto materialTypeDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterialType

                    @Id = {materialTypeDto.Id},
                    @Name = {materialTypeDto.Name},
                    @CreatedAt = {materialTypeDto.CreatedAt},
                    @CreatedBy = {materialTypeDto.CreatedBy},
                    @UpdatedAt = {materialTypeDto.UpdatedAt},
                    @UpdatedBy = {materialTypeDto.UpdatedBy}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteMaterialType
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
