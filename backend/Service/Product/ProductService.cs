using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Product;
using backend.Dto.ProductMaterialRequirement;
using backend.Dto.Material;
using backend.Dto.ProductProductionStage;
using backend.Dto.ProductionStage;

namespace backend.Service.Product
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? imagePath = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            var query = _context.Products.AsNoTracking();

            if (id.HasValue && id.Value != Guid.Empty)
                query = query.Where(p => p.Id == id.Value);

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(p => p.Name.Contains(name));

            return await query.Select(p => new ProductDto
            {
                Id = p.Id,
                SKU = p.SKU,
                Name = p.Name,
                ImagePath = p.ImagePath,
                isActive = p.isActive,
                ProductCategoryId = p.ProductCategoryId,
            }).ToListAsync();
        }

        public async Task<ProductDto?> GetByIdAsync(Guid id)
        {
            var product = await _context.Products
                .AsNoTracking()
                .Include(p => p.MaterialRequirements)
                    .ThenInclude(pm => pm.Material)
                .Include(p => p.ProductionStages)
                    .ThenInclude(ps => ps.ProductionStage)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return null;

            return new ProductDto
            {
                Id = product.Id,
                SKU = product.SKU,
                Name = product.Name,
                ImagePath = product.ImagePath,
                isActive = product.isActive,
                ProductCategoryId = product.ProductCategoryId,

                MaterialRequirements = product.MaterialRequirements
                    .Select(m => new ProductMaterialRequirementDto
                    {
                        Id = m.Id,
                        ProductId = m.ProductId,
                        MaterialId = m.MaterialId,
                        ProductSize = m.ProductSize,
                        Quantity = m.Quantity,

                        Material = new MaterialDto
                        {
                            Id = m.Material.Id,
                            MaterialCode = m.Material.MaterialCode,
                            Name = m.Material.Name,
                            Unit = m.Material.Unit,
                            AvailableQty = m.Material.AvailableQty,
                            CostPerUnit = m.Material.CostPerUnit,
                            ImagePath = m.Material.ImagePath
                        }
                    }).ToList(),

                ProductionStages = product.ProductionStages
                    .OrderBy(s => s.Sequence)
                    .Select(s => new ProductProductionStageDto
                    {
                        Id = s.Id,
                        ProductId = s.ProductId,
                        ProductionStageId = s.ProductionStageId,
                        Sequence = s.Sequence,

                        ProductionStage = new ProductionStageDto
                        {
                            Id = s.ProductionStage.Id,
                            Name = s.ProductionStage.Name,
                            isActive = s.ProductionStage.isActive
                        }
                    }).ToList()
            };
        }
        public async Task<bool> CreateAsync(ProductDto dto)
        {
            var now = DateTime.UtcNow;
            var entity = new backend.Model.Product
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                SKU = string.IsNullOrWhiteSpace(dto.SKU) ? $"SKU-{Guid.NewGuid().ToString()[..8]}" : dto.SKU,
                Name = dto.Name,
                ImagePath = backend.Helpers.ImagePathHelper.ToRelativePath(dto.ImagePath),
                isActive = dto.isActive,
                ProductCategoryId = dto.ProductCategoryId ?? Guid.Empty,
                // CreatedAt = dto.CreatedAt == default ? now : dto.CreatedAt,
                UpdatedAt = now
            };

            _context.Products.Add(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, ProductDto dto)
        {
            var entity = await _context.Products.FindAsync(id);
            if (entity == null) return false;

            entity.Name = dto.Name;
            if (!string.IsNullOrWhiteSpace(dto.SKU)) entity.SKU = dto.SKU;
            entity.ImagePath = backend.Helpers.ImagePathHelper.ToRelativePath(dto.ImagePath);
            entity.isActive = dto.isActive;
            if (dto.ProductCategoryId.HasValue) entity.ProductCategoryId = dto.ProductCategoryId.Value;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Products.Update(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.Products.FindAsync(id);
            if (entity == null) return false;

            _context.Products.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
