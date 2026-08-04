using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.MaterialType;

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
            string? unit = null,
            string? description = null,
            bool? isActive = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialTypeGetDto>($@"
                    EXEC sp_GetMaterialTypes

                        @Id = {id},
                        @Name = {name},
                        @Unit = {unit},
                        @Description = {description},
                        @IsActive = {isActive},
                        @CreatedAt = {createdAt},
                        @UpdatedAt = {updatedAt}
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
            materialTypeDto.Id = Guid.NewGuid();
            materialTypeDto.CreatedAt = DateTime.UtcNow;
            materialTypeDto.UpdatedAt = DateTime.UtcNow;
            materialTypeDto.IsActive = true;

            var count = await _context.MaterialTypes.CountAsync();
            materialTypeDto.MaterialCode = $"MAT-TY-{(count + 1):D5}";

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterialType

                    @Id = {materialTypeDto.Id},
                    @Name = {materialTypeDto.Name},
                    @MaterialCode = {materialTypeDto.MaterialCode},
                    @Description = {materialTypeDto.Description},
                    @IsActive = {materialTypeDto.IsActive},
                    @Unit = {materialTypeDto.Unit},
                    @CreatedAt = {materialTypeDto.CreatedAt},
                    @UpdatedAt = {materialTypeDto.UpdatedAt}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, MaterialTypeDto materialTypeDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterialType

                    @Id = {materialTypeDto.Id},
                    @Name = {materialTypeDto.Name},
                    @Description = {materialTypeDto.Description},
                    @IsActive = {materialTypeDto.IsActive},
                    @Unit = {materialTypeDto.Unit},
                    @CreatedAt = {materialTypeDto.CreatedAt},
                    @UpdatedAt = {materialTypeDto.UpdatedAt}
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
