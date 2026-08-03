using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialCategory;

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
            DateTime? updatedAt = null,
            Guid? materialTypeId = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialCategoryGetDto>($@"
                    EXEC sp_GetMaterialCategories

                        @Id = {id},
                        @Name = {name},
                        @CreatedAt = {createdAt},
                        @UpdatedAt = {updatedAt},
                        @MaterialTypeId = {materialTypeId}
                ")
                .ToListAsync();
        }

        public async Task<MaterialCategoryGetDto?> GetByIdAsync(Guid id)
        {
            return await GetByIdAsync(id: id);
        }

        public async Task<bool> CreateAsync(MaterialCategoryDto materialCategoryDto)
        {
            materialCategoryDto.Id = Guid.NewGuid();
            materialCategoryDto.CreatedAt = DateTime.UtcNow;
            materialCategoryDto.UpdatedAt = DateTime.UtcNow;
            
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialCategory

                    @Id = {materialCategoryDto.Id},
                    @Name = {materialCategoryDto.Name},
                    @CreatedAt = {materialCategoryDto.CreatedAt},
                    @UpdatedAt = {materialCategoryDto.UpdatedAt},
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
                    @UpdatedAt = {materialCategoryDto.UpdatedAt},
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
