using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.ProductionStage;

namespace backend.Service.ProductionStage
{
    public class ProductionStageService : IProductionStageService
    {
        private readonly AppDbContext _context;

        public ProductionStageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductionStageDto>> GetAllAsync(
            Guid? id = null,
            string? productionStageCode = null,
            bool? isActive = null
        )
        {
            return await _context.Database
                .SqlQuery<ProductionStageDto>($@"
                    EXEC sp_GetProductionStages

                        @Id = {id},
                        @ProductionStageCode = {productionStageCode},
                        @IsActive = {isActive}
                ")
                .ToListAsync();
        }

        public async Task<ProductionStageDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<ProductionStageDto> CreateAsync(ProductionStageDto dto)
        {
            var count = await _context.ProductionStages.CountAsync();
            dto.ProductionStageCode = $"PRO-STA-{(count + 1):D5}";

            dto.Id = Guid.NewGuid();

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProductionStage
                    @Id={dto.Id},
                    @ProductionStageCode={dto.ProductionStageCode},
                    @Name={dto.Name},
                    @Description={dto.Description},
                    @Duration={dto.Duration},
                    @IsActive={true}"
                );

            return dto;
        }

        public async Task<bool> UpdateAsync(Guid id, ProductionStageDto dto)
        {
            var exists = await _context.ProductionStages.AnyAsync(x => x.Id == id);

            if (!exists)
                return false;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProductionStage
                    @Id={id},
                    @Name={dto.Name},
                    @Description={dto.Description},
                    @Duration={dto.Duration},
                    @IsActive={dto.IsActive}");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var exists = await _context.ProductionStages.AnyAsync(x => x.Id == id);

            if (!exists)
                return false;

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteProductionStage
                    @Id={id}");

            return true;
        }
    }
}