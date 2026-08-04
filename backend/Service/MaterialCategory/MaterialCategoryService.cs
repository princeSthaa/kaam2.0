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
            string? materialCode = null,
            string? description = null,
            bool? isActive = null,
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
                        @MaterialCode = {materialCode},
                        @Description = {description},
                        @IsActive = {isActive},
                        @CreatedAt = {createdAt},
                        @UpdatedAt = {updatedAt},
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
            materialCategoryDto.Id = Guid.NewGuid();
            materialCategoryDto.CreatedAt = DateTime.UtcNow;
            materialCategoryDto.UpdatedAt = DateTime.UtcNow;
            materialCategoryDto.IsActive = true;
            
            var count = await _context.MaterialTypes.CountAsync();
            materialCategoryDto.MaterialCode = $"MAT-CAT-{(count + 1):D5}";

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialCategory

                    @Id = {materialCategoryDto.Id},
                    @Name = {materialCategoryDto.Name},
                    @MaterialCode = {materialCategoryDto.MaterialCode},
                    @Description = {materialCategoryDto.Description},
                    @IsActive = {materialCategoryDto.IsActive},
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
                    @MaterialCode = {materialCategoryDto.MaterialCode},
                    @Description = {materialCategoryDto.Description},
                    @IsActive = {materialCategoryDto.IsActive},
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
