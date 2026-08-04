using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Product;
using backend.Dto.ProductMaterialRequirement;
using backend.Dto.MaterialType;
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
            var query = _context.Products
                .AsNoTracking()
                .Include(p => p.ProductCategory)
                .Include(p => p.MaterialRequirements)
                    .ThenInclude(m => m.MaterialType)
                .Include(p => p.ProductionStages)
                    .ThenInclude(s => s.ProductionStage)
                .AsQueryable();

            if (id.HasValue && id != Guid.Empty)
                query = query.Where(x => x.Id == id);

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(x => x.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(imagePath))
                query = query.Where(x => x.ImagePath.Contains(imagePath));

            var products = await query.ToListAsync();

            return products.Select(product => new ProductDto
            {
                Id = product.Id,
                SKU = product.SKU,
                Name = product.Name,
                ImagePath = product.ImagePath,
                isActive = product.isActive,
                ProductCategoryId = product.ProductCategoryId,

                MaterialRequirements = product.MaterialRequirements
                    .OrderBy(x => x.ProductSize)
                    .Select(x => new ProductMaterialRequirementDto
                    {
                        Id = x.Id,
                        ProductId = x.ProductId,
                        MaterialTypeId = x.MaterialTypeId,
                        ProductSize = x.ProductSize,
                        Quantity = x.Quantity,

                        MaterialType = new MaterialTypeDto
                        {
                            Id = x.MaterialType.Id,
                            Name = x.MaterialType.Name,
                            CreatedAt = x.MaterialType.CreatedAt,
                            UpdatedAt = x.MaterialType.UpdatedAt
                        }

                    }).ToList(),

                ProductionStages = product.ProductionStages
                    .OrderBy(x => x.Sequence)
                    .Select(x => new ProductProductionStageDto
                    {
                        Id = x.Id,
                        ProductId = x.ProductId,
                        ProductionStageId = x.ProductionStageId,
                        Sequence = x.Sequence,

                        ProductionStage = new ProductionStageDto
                        {
                            Id = x.ProductionStage.Id,
                            Name = x.ProductionStage.Name,
                            Description = x.ProductionStage.Description,
                            isActive = x.ProductionStage.isActive
                        }

                    }).ToList()

            }).ToList();
        }


        public async Task<ProductDto?> GetByIdAsync(Guid id)
        {
            var product = await _context.Products
                .AsNoTracking()
                .Include(p => p.ProductCategory)
                .Include(p => p.MaterialRequirements)
                    .ThenInclude(m => m.MaterialType)
                .Include(p => p.ProductionStages)
                    .ThenInclude(s => s.ProductionStage)
                .FirstOrDefaultAsync(x => x.Id == id);

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
                    .OrderBy(x => x.ProductSize)
                    .Select(x => new ProductMaterialRequirementDto
                    {
                        Id = x.Id,
                        ProductId = x.ProductId,
                        MaterialTypeId = x.MaterialTypeId,
                        ProductSize = x.ProductSize,
                        Quantity = x.Quantity,

                        MaterialType = new MaterialTypeDto
                        {
                            Id = x.MaterialType.Id,
                            Name = x.MaterialType.Name,
                            CreatedAt = x.MaterialType.CreatedAt,
                            UpdatedAt = x.MaterialType.UpdatedAt
                        }

                    }).ToList(),

                ProductionStages = product.ProductionStages
                    .OrderBy(x => x.Sequence)
                    .Select(x => new ProductProductionStageDto
                    {
                        Id = x.Id,
                        ProductId = x.ProductId,
                        ProductionStageId = x.ProductionStageId,
                        Sequence = x.Sequence,

                        ProductionStage = new ProductionStageDto
                        {
                            Id = x.ProductionStage.Id,
                            Name = x.ProductionStage.Name,
                            Description = x.ProductionStage.Description,
                            isActive = x.ProductionStage.isActive
                        }

                    }).ToList()
            };
        }



        public async Task<bool> CreateAsync(ProductDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                dto.Id = Guid.NewGuid();

                foreach (var requirement in dto.MaterialRequirements)
                {
                    requirement.Id = Guid.NewGuid();
                    requirement.ProductId = dto.Id;
                }

                foreach (var stage in dto.ProductionStages)
                {
                    stage.Id = Guid.NewGuid();
                    stage.ProductId = dto.Id;
                }
                
                var now = DateTime.UtcNow;

                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_InsertProduct
                        @Id = {dto.Id},
                        @SKU = {dto.SKU},
                        @Name = {dto.Name},
                        @ProductCategoryId = {dto.ProductCategoryId},
                        @isActive = {dto.isActive},
                        @ImagePath = {dto.ImagePath},
                        @CreatedAt = {now},
                        @UpdatedAt = {now}
                ");

                if (dto.MaterialRequirements != null && dto.MaterialRequirements.Any())
                {
                    foreach (var requirement in dto.MaterialRequirements)
                    {
                        requirement.Id = Guid.NewGuid();

                        await _context.Database.ExecuteSqlInterpolatedAsync($@"
                            EXEC sp_InsertProductMaterialRequirement
                                @Id = {requirement.Id},
                                @ProductId = {requirement.ProductId},
                                @MaterialTypeId = {requirement.MaterialTypeId},
                                @ProductSize = {(int)requirement.ProductSize},
                                @Quantity = {requirement.Quantity}
                        ");
                    }
                }

                if (dto.ProductionStages != null && dto.ProductionStages.Any())
                {
                    foreach (var stage in dto.ProductionStages.OrderBy(x => x.Sequence))
                    {
                        stage.Id = Guid.NewGuid();

                        await _context.Database.ExecuteSqlInterpolatedAsync($@"
                            EXEC sp_InsertProductProductionStage
                                @Id = {stage.Id},
                                @ProductId = {stage.ProductId},
                                @ProductionStageId = {stage.ProductionStageId},
                                @Sequence = {stage.Sequence}
                        ");
                    }
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // break

        
        // public async Task<List<ProductDto>> GetAllAsync(
        //     Guid? id = null,
        //     string? name = null,
        //     string? imagePath = null,
        //     DateTime? createdAt = null,
        //     string? createdBy = null,
        //     DateTime? updatedAt = null,
        //     string? updatedBy = null
        // )
        // {
        //     var query = _context.Products.AsNoTracking();

        //     if (id.HasValue && id.Value != Guid.Empty)
        //         query = query.Where(p => p.Id == id.Value);

        //     if (!string.IsNullOrWhiteSpace(name))
        //         query = query.Where(p => p.Name.Contains(name));

        //     return await query.Select(p => new ProductDto
        //     {
        //         Id = p.Id,
        //         SKU = p.SKU,
        //         Name = p.Name,
        //         ImagePath = p.ImagePath,
        //         isActive = p.isActive,
        //         ProductCategoryId = p.ProductCategoryId,
        //     }).ToListAsync();
        // }

        // public async Task<ProductDto?> GetByIdAsync(Guid id)
        // {
        //     var product = await _context.Products
        //         .AsNoTracking()
        //         .Include(p => p.MaterialRequirements)
        //             .ThenInclude(pm => pm.Material)
        //         .Include(p => p.ProductionStages)
        //             .ThenInclude(ps => ps.ProductionStage)
        //         .FirstOrDefaultAsync(p => p.Id == id);

        //     if (product == null)
        //         return null;

        //     return new ProductDto
        //     {
        //         Id = product.Id,
        //         SKU = product.SKU,
        //         Name = product.Name,
        //         ImagePath = product.ImagePath,
        //         isActive = product.isActive,
        //         ProductCategoryId = product.ProductCategoryId,

        //         MaterialRequirements = product.MaterialRequirements
        //             .Select(m => new ProductMaterialRequirementDto
        //             {
        //                 Id = m.Id,
        //                 ProductId = m.ProductId,
        //                 MaterialId = m.MaterialId,
        //                 ProductSize = m.ProductSize,
        //                 Quantity = m.Quantity,

        //                 Material = new MaterialDto
        //                 {
        //                     Id = m.Material.Id,
        //                     MaterialCode = m.Material.MaterialCode,
        //                     Name = m.Material.Name,
        //                     Unit = m.Material.Unit,
        //                     AvailableQty = m.Material.AvailableQty,
        //                     CostPerUnit = m.Material.CostPerUnit,
        //                     ImagePath = m.Material.ImagePath
        //                 }
        //             }).ToList(),

        //         ProductionStages = product.ProductionStages
        //             .OrderBy(s => s.Sequence)
        //             .Select(s => new ProductProductionStageDto
        //             {
        //                 Id = s.Id,
        //                 ProductId = s.ProductId,
        //                 ProductionStageId = s.ProductionStageId,
        //                 Sequence = s.Sequence,

        //                 ProductionStage = new ProductionStageDto
        //                 {
        //                     Id = s.ProductionStage.Id,
        //                     Name = s.ProductionStage.Name,
        //                     isActive = s.ProductionStage.isActive
        //                 }
        //             }).ToList()
        //     };
        // }
        // public async Task<bool> CreateAsync(ProductDto dto)
        // {
        //     var now = DateTime.UtcNow;
        //     var entity = new backend.Model.Product
        //     {
        //         Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
        //         SKU = string.IsNullOrWhiteSpace(dto.SKU) ? $"SKU-{Guid.NewGuid().ToString()[..8]}" : dto.SKU,
        //         Name = dto.Name,
        //         ImagePath = backend.Helpers.ImagePathHelper.ToRelativePath(dto.ImagePath),
        //         isActive = dto.isActive,
        //         ProductCategoryId = dto.ProductCategoryId ?? Guid.Empty,
        //         // CreatedAt = dto.CreatedAt == default ? now : dto.CreatedAt,
        //         UpdatedAt = now
        //     };

        //     _context.Products.Add(entity);
        //     await _context.SaveChangesAsync();
        //     return true;
        // }

        public async Task<bool> UpdateAsync(Guid id, ProductDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var existing = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (existing == null)
                    return false;

                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_UpdateProduct
                        @Id = {id},
                        @SKU = {dto.SKU},
                        @Name = {dto.Name},
                        @ProductCategoryId = {dto.ProductCategoryId},
                        @isActive = {dto.isActive},
                        @ImagePath = {dto.ImagePath},
                        @CreatedAt = {existing.CreatedAt},
                        @UpdatedAt = {DateTime.UtcNow}
                ");

                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_DeleteProductMaterialRequirementsByProductId
                        @ProductId = {id}
                ");

                if (dto.MaterialRequirements != null)
                {
                    foreach (var requirement in dto.MaterialRequirements)
                    {
                        await _context.Database.ExecuteSqlInterpolatedAsync($@"
                            EXEC sp_InsertProductMaterialRequirement
                                @Id = {Guid.NewGuid()},
                                @ProductId = {id},
                                @MaterialTypeId = {requirement.MaterialTypeId},
                                @ProductSize = {(int)requirement.ProductSize},
                                @Quantity = {requirement.Quantity}
                        ");
                    }
                }

                await _context.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC sp_DeleteProductProductionStagesByProductId
                        @ProductId = {id}
                ");

                if (dto.ProductionStages != null)
                {
                    foreach (var stage in dto.ProductionStages.OrderBy(x => x.Sequence))
                    {
                        await _context.Database.ExecuteSqlInterpolatedAsync($@"
                            EXEC sp_InsertProductProductionStage
                                @Id = {Guid.NewGuid()},
                                @ProductId = {id},
                                @ProductionStageId = {stage.ProductionStageId},
                                @Sequence = {stage.Sequence}
                        ");
                    }
                }

                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // public async Task<bool> UpdateAsync(Guid id, ProductDto dto)
        // {
        //     var entity = await _context.Products.FindAsync(id);
        //     if (entity == null) return false;

        //     entity.Name = dto.Name;
        //     if (!string.IsNullOrWhiteSpace(dto.SKU)) entity.SKU = dto.SKU;
        //     entity.ImagePath = backend.Helpers.ImagePathHelper.ToRelativePath(dto.ImagePath);
        //     entity.isActive = dto.isActive;
        //     if (dto.ProductCategoryId.HasValue) entity.ProductCategoryId = dto.ProductCategoryId.Value;
        //     entity.UpdatedAt = DateTime.UtcNow;

        //     _context.Products.Update(entity);
        //     await _context.SaveChangesAsync();
        //     return true;
        // }


        public async Task<bool> DeleteAsync(Guid id)
        {
            var exists = await _context.Products
                .AnyAsync(p => p.Id == id);

            if (!exists)
                return false;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteProduct
                    @Id = {id}
            ");

            return true;
        }

        // public async Task<bool> DeleteAsync(Guid id)
        // {
        //     var entity = await _context.Products.FindAsync(id);
        //     if (entity == null) return false;

        //     _context.Products.Remove(entity);
        //     await _context.SaveChangesAsync();
        //     return true;
        // }
    
    
    
    }
}
