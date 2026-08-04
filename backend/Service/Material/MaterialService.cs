using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Material;

namespace backend.Service.Material
{
    public class MaterialService : IMaterialService
    {
        private readonly AppDbContext _context;

        public MaterialService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MaterialGetDto>> GetAllAsync(
            Guid? id = null,
            string? materialCode = null,
            string? name = null,
            Guid? materialTypeId = null,
            Guid? materialCategoryId = null,
            decimal? availableQty = null,
            string? unit = null,
            string? imagePath = null,
            decimal? costPerUnit = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            return await _context.Database
                .SqlQuery<MaterialGetDto>($@"
                    EXEC sp_GetMaterials
                        @Id = {id},
                        @MaterialCode = {materialCode},
                        @Name = {name},
                        @MaterialTypeId = {materialTypeId},
                        @MaterialCategoryId = {materialCategoryId},
                        @AvailableQty = {availableQty},
                        @Unit = {unit},
                        @ImagePath = {imagePath},
                        @CostPerUnit = {costPerUnit}
                ")
                .ToListAsync();
        }
        public async Task<bool> CreateAsync(MaterialDto materialDto)
        {
            materialDto.Id = Guid.NewGuid();
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertMaterial
                    @Id = {materialDto.Id},
                    @MaterialCode = {materialDto.MaterialCode},
                    @Name = {materialDto.Name},
                    @AvailableQty = {materialDto.AvailableQty},
                    @Unit = {materialDto.Unit},
                    @ImagePath = {materialDto.ImagePath},
                    @CostPerUnit = {materialDto.CostPerUnit},
                    @CreatedAt = {materialDto.CreatedAt},
                    @UpdatedAt = {materialDto.UpdatedAt},
                    @MaterialTypeId = {materialDto.MaterialTypeId},
                    @MaterialCategoryId = {materialDto.MaterialCategoryId}
            ");

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, MaterialDto materialDto)
        {

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateMaterial

                    @Id = {materialDto.Id},
                    @MaterialCode = {materialDto.MaterialCode},
                    @Name = {materialDto.Name},
                    @AvailableQty = {materialDto.AvailableQty},
                    @Unit = {materialDto.Unit},
                    @ImagePath = {materialDto.ImagePath},
                    @CostPerUnit = {materialDto.CostPerUnit},
                    @CreatedAt = {materialDto.CreatedAt},
                    @UpdatedAt = {materialDto.UpdatedAt},
                    @MaterialTypeId = {materialDto.MaterialTypeId},
                    @MaterialCategoryId = {materialDto.MaterialCategoryId}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteMaterial
                    @Id = {id}
            ");

            return true;
        }
    }
}
