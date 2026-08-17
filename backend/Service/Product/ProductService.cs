using Microsoft.EntityFrameworkCore;
using Dapper;
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

        public async Task<List<ProductGetDto>> GetAllAsync(
            Guid? id = null,
            string? name = null,
            string? imagePath = null,
            DateTime? createdAt = null,
            DateTime? updatedAt = null
        )
        {
            var connection = _context.Database.GetDbConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@Id", id);
            parameters.Add("@Name", name);

            using var multi = await connection.QueryMultipleAsync(
                "sp_GetProducts",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            var products = !multi.IsConsumed ? multi.Read<ProductGetDto>().ToList() : new List<ProductGetDto>();
            var materialReqs = !multi.IsConsumed ? multi.Read<ProductMaterialRequirementGetDto>().ToList() : new List<ProductMaterialRequirementGetDto>();

            foreach (var p in products)
            {
                p.MaterialRequirements = materialReqs
                    .Where(m => m.ProductId == p.Id)
                    .OrderBy(x => x.ProductSize)
                    .ToList();
            }

            // Filter by imagePath in memory if needed
            if (!string.IsNullOrWhiteSpace(imagePath))
            {
                products = products.Where(p => p.ImagePath != null && p.ImagePath.Contains(imagePath)).ToList();
            }

            return products;
        }

        public async Task<ProductGetDto?> GetByIdAsync(Guid id)
        {
            var products = await GetAllAsync(id: id);
            return products.FirstOrDefault();
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
    
    }
}
