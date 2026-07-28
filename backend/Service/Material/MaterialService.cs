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
using backend.Dto.MaterialType;
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

        public async Task<List<MaterialGetDto>> GetAllAsync(
            Guid? id = null,
            string? materialCode = null,
            string? name = null,
            decimal? availableQty = null,
            string? unit = null,
            string? imagePath = null,
            decimal? costPerUnit = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
            )
        {
            var query = _context.Materials
                .Include(m => m.MaterialType)
                .Include(m => m.MaterialCategory)
                .AsNoTracking()
                .AsQueryable();

            if (id.HasValue)
                query = query.Where(m => m.Id == id.Value);

            if (!string.IsNullOrWhiteSpace(materialCode))
                query = query.Where(m => m.MaterialCode == materialCode);

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(m => m.Name.Contains(name));

            if (availableQty.HasValue)
                query = query.Where(m => m.AvailableQty == availableQty.Value);

            if (!string.IsNullOrWhiteSpace(unit))
                query = query.Where(m => m.Unit == unit);

            if (!string.IsNullOrWhiteSpace(imagePath))
                query = query.Where(m => m.ImagePath == imagePath);

            if (costPerUnit.HasValue)
                query = query.Where(m => m.CostPerUnit == costPerUnit.Value);

            if (createdAt.HasValue)
                query = query.Where(m => m.CreatedAt == createdAt.Value);

            if (!string.IsNullOrWhiteSpace(createdBy))
                query = query.Where(m => m.CreatedBy == createdBy);

            if (updatedAt.HasValue)
                query = query.Where(m => m.UpdatedAt == updatedAt.Value);

            if (!string.IsNullOrWhiteSpace(updatedBy))
                query = query.Where(m => m.UpdatedBy == updatedBy);


            var materials = await query.ToListAsync();


            return materials.Select(m => new MaterialGetDto
            {
                Id = m.Id,

                MaterialCode = m.MaterialCode,
                Name = m.Name,

                MaterialTypeId = m.MaterialTypeId,
                MaterialTypeName = m.MaterialType?.Name ?? string.Empty,

                MaterialCategoryId = m.MaterialCategoryId,
                MaterialCategoryName = m.MaterialCategory?.Name ?? string.Empty,
                
                AvailableQty = m.AvailableQty,
                Unit = m.Unit,

                ImagePath = m.ImagePath,

                CostPerUnit = m.CostPerUnit,

                CreatedAt = m.CreatedAt,
                CreatedBy = m.CreatedBy,

                UpdatedAt = m.UpdatedAt,
                UpdatedBy = m.UpdatedBy

            }).ToList();
        }

        // <crudgen:methods>
        public async Task<bool> CreateAsync(MaterialDto materialDto)
        {
            if (materialDto.Id == Guid.Empty)
            {
                materialDto.Id = Guid.NewGuid();
            }

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
                    @CreatedBy = {materialDto.CreatedBy},
                    @UpdatedAt = {materialDto.UpdatedAt},
                    @UpdatedBy = {materialDto.UpdatedBy},
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
                    @CreatedBy = {materialDto.CreatedBy},
                    @UpdatedAt = {materialDto.UpdatedAt},
                    @UpdatedBy = {materialDto.UpdatedBy},
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

        // </crudgen:methods>
    }
}
