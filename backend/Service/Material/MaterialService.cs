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
            var rawMaterials = await _context.Materials.AsNoTracking().ToListAsync();

            if (rawMaterials.Count == 0)
            {
                var fabricType = await _context.MaterialTypes.FirstOrDefaultAsync(t => t.Name == "Fabric");
                if (fabricType == null)
                {
                    fabricType = new backend.Model.MaterialType { Id = Guid.NewGuid(), Name = "Fabric", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" };
                    _context.MaterialTypes.Add(fabricType);
                    await _context.SaveChangesAsync();
                }

                var cottonCat = await _context.MaterialCategories.FirstOrDefaultAsync(c => c.Name == "Cotton");
                if (cottonCat == null)
                {
                    cottonCat = new backend.Model.MaterialCategory { Id = Guid.NewGuid(), Name = "Cotton", MaterialTypeId = fabricType.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" };
                    _context.MaterialCategories.Add(cottonCat);
                }

                var denimCat = await _context.MaterialCategories.FirstOrDefaultAsync(c => c.Name == "Denim");
                if (denimCat == null)
                {
                    denimCat = new backend.Model.MaterialCategory { Id = Guid.NewGuid(), Name = "Denim", MaterialTypeId = fabricType.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" };
                    _context.MaterialCategories.Add(denimCat);
                }

                var polyCat = await _context.MaterialCategories.FirstOrDefaultAsync(c => c.Name == "Polyester");
                if (polyCat == null)
                {
                    polyCat = new backend.Model.MaterialCategory { Id = Guid.NewGuid(), Name = "Polyester", MaterialTypeId = fabricType.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" };
                    _context.MaterialCategories.Add(polyCat);
                }

                var silkCat = await _context.MaterialCategories.FirstOrDefaultAsync(c => c.Name == "Silk");
                if (silkCat == null)
                {
                    silkCat = new backend.Model.MaterialCategory { Id = Guid.NewGuid(), Name = "Silk", MaterialTypeId = fabricType.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" };
                    _context.MaterialCategories.Add(silkCat);
                }

                var linenCat = await _context.MaterialCategories.FirstOrDefaultAsync(c => c.Name == "Linen");
                if (linenCat == null)
                {
                    linenCat = new backend.Model.MaterialCategory { Id = Guid.NewGuid(), Name = "Linen", MaterialTypeId = fabricType.Id, CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" };
                    _context.MaterialCategories.Add(linenCat);
                }

                await _context.SaveChangesAsync();

                var defaultMaterials = new List<backend.Model.Material>
                {
                    new backend.Model.Material { Id = Guid.NewGuid(), MaterialCode = "FAB-001", Name = "100% Organic Cotton (220 GSM)", MaterialTypeId = fabricType.Id, MaterialCategoryId = cottonCat.Id, AvailableQty = 1500, Unit = "m", CostPerUnit = 180, ImagePath = "/Media/images/fabrics/FAB-001.jpg", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" },
                    new backend.Model.Material { Id = Guid.NewGuid(), MaterialCode = "FAB-002", Name = "Heavyweight Combed Cotton (280 GSM)", MaterialTypeId = fabricType.Id, MaterialCategoryId = cottonCat.Id, AvailableQty = 1200, Unit = "m", CostPerUnit = 220, ImagePath = "/Media/images/fabrics/FAB-001.jpg", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" },
                    new backend.Model.Material { Id = Guid.NewGuid(), MaterialCode = "FAB-003", Name = "Raw Indigo Denim Twill (14 oz)", MaterialTypeId = fabricType.Id, MaterialCategoryId = denimCat.Id, AvailableQty = 900, Unit = "m", CostPerUnit = 310, ImagePath = "/Media/images/fabrics/FAB-002.png", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" },
                    new backend.Model.Material { Id = Guid.NewGuid(), MaterialCode = "FAB-004", Name = "Washed Stretch Denim (11 oz)", MaterialTypeId = fabricType.Id, MaterialCategoryId = denimCat.Id, AvailableQty = 1100, Unit = "m", CostPerUnit = 290, ImagePath = "/Media/images/fabrics/FAB-002.png", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" },
                    new backend.Model.Material { Id = Guid.NewGuid(), MaterialCode = "FAB-005", Name = "Breathable Athletic Polyester Mesh", MaterialTypeId = fabricType.Id, MaterialCategoryId = polyCat.Id, AvailableQty = 2000, Unit = "m", CostPerUnit = 140, ImagePath = "/Media/images/fabrics/FAB-003.png", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" },
                    new backend.Model.Material { Id = Guid.NewGuid(), MaterialCode = "FAB-006", Name = "Microfiber Moisture Wicking Fabric", MaterialTypeId = fabricType.Id, MaterialCategoryId = polyCat.Id, AvailableQty = 1800, Unit = "m", CostPerUnit = 160, ImagePath = "/Media/images/fabrics/FAB-003.png", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" },
                    new backend.Model.Material { Id = Guid.NewGuid(), MaterialCode = "FAB-007", Name = "Pure Mulberry Silk Satin", MaterialTypeId = fabricType.Id, MaterialCategoryId = silkCat.Id, AvailableQty = 500, Unit = "m", CostPerUnit = 650, ImagePath = "/Media/images/fabrics/FAB-004.png", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" },
                    new backend.Model.Material { Id = Guid.NewGuid(), MaterialCode = "FAB-008", Name = "Premium French Linen Slub", MaterialTypeId = fabricType.Id, MaterialCategoryId = linenCat.Id, AvailableQty = 750, Unit = "m", CostPerUnit = 380, ImagePath = "/Media/images/fabrics/FAB-005.png", CreatedAt = DateTime.UtcNow, CreatedBy = "System", UpdatedAt = DateTime.UtcNow, UpdatedBy = "System" },
                };

                try
                {
                    _context.Materials.AddRange(defaultMaterials);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[MaterialService] Save error: {ex.Message} | Inner: {ex.InnerException?.Message}");
                }

                rawMaterials = await _context.Materials.AsNoTracking().ToListAsync();
            }

            var typesDict = await _context.MaterialTypes.AsNoTracking().ToDictionaryAsync(t => t.Id, t => t.Name);
            var catsDict = await _context.MaterialCategories.AsNoTracking().ToDictionaryAsync(c => c.Id, c => c.Name);

            return rawMaterials.Select(m => new MaterialGetDto
            {
                Id = m.Id,
                MaterialCode = m.MaterialCode,
                Name = m.Name,
                MaterialTypeId = m.MaterialTypeId ?? Guid.Empty,
                MaterialTypeName = m.MaterialTypeId.HasValue && typesDict.ContainsKey(m.MaterialTypeId.Value) ? typesDict[m.MaterialTypeId.Value] : "Fabric",
                MaterialCategoryId = m.MaterialCategoryId ?? Guid.Empty,
                MaterialCategoryName = m.MaterialCategoryId.HasValue && catsDict.ContainsKey(m.MaterialCategoryId.Value) ? catsDict[m.MaterialCategoryId.Value] : "General",
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
