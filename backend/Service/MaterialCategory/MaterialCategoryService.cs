using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialCategory;
using backend.Model;

namespace backend.Service.MaterialCategory
{
    public class MaterialCategoryService : IMaterialCategoryService
    {
        private readonly AppDbContext _context;

        public MaterialCategoryService(AppDbContext context)
        {
            _context = context;
        }

        // <crudgen:methods>
        public async Task<List<MaterialCategoryGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null,
            Guid? materialTypeId = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialCategoryGetDto>($@"
                    EXEC sp_GetMaterialCategories

                        @Id = {id},
                        @Name = {name},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy},
                        @MaterialTypeId = {materialTypeId}
                ")
                .ToListAsync();
        }

        public async Task<MaterialCategoryGetDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> CreateAsync(MaterialCategoryDto materialCategoryDto)
        {
            if (materialCategoryDto.Id == Guid.Empty)
            {
                materialCategoryDto.Id = Guid.NewGuid();
            }

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialCategory

                    @Id = {materialCategoryDto.Id},
                    @Name = {materialCategoryDto.Name},
                    @CreatedAt = {materialCategoryDto.CreatedAt},
                    @CreatedBy = {materialCategoryDto.CreatedBy},
                    @UpdatedAt = {materialCategoryDto.UpdatedAt},
                    @UpdatedBy = {materialCategoryDto.UpdatedBy},
                    @MaterialTypeId = {materialCategoryDto.MaterialTypeId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, MaterialCategoryDto materialCategoryDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterialCategory

                    @Id = {materialCategoryDto.Id},
                    @Name = {materialCategoryDto.Name},
                    @CreatedAt = {materialCategoryDto.CreatedAt},
                    @CreatedBy = {materialCategoryDto.CreatedBy},
                    @UpdatedAt = {materialCategoryDto.UpdatedAt},
                    @UpdatedBy = {materialCategoryDto.UpdatedBy},
                    @MaterialTypeId = {materialCategoryDto.MaterialTypeId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteMaterialCategory
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
