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

        public async Task<List<ProductionStageDto>> GetAllAsync()
        {
            return await _context.ProductionStages
                .AsNoTracking()
                .Select(s => new ProductionStageDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    isActive = s.isActive
                })
                .ToListAsync();
        }

        public async Task<ProductionStageDto?> GetByIdAsync(Guid id)
        {
            var s = await _context.ProductionStages.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (s == null) return null;

            return new ProductionStageDto
            {
                Id = s.Id,
                Name = s.Name,
                isActive = s.isActive
            };
        }

        public async Task<ProductionStageDto> CreateAsync(ProductionStageDto dto)
        {
            var entity = new backend.Model.ProductionStage
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                isActive = true
            };

            _context.ProductionStages.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(Guid id, ProductionStageDto dto)
        {
            var entity = await _context.ProductionStages.FindAsync(id);
            if (entity == null) return false;

            entity.Name = dto.Name;
            entity.isActive = dto.isActive;

            _context.ProductionStages.Update(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.ProductionStages.FindAsync(id);
            if (entity == null) return false;

            _context.ProductionStages.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
