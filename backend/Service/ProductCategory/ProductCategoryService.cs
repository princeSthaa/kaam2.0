using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.ProductCategory;

namespace backend.Service.ProductCategory
{
    public class ProductCategoryService : IProductCategoryService
    {
        private readonly AppDbContext _context;

        public ProductCategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductCategoryDto>> GetAllAsync()
        {
            return await _context.ProductCategories
                .AsNoTracking()
                .Select(c => new ProductCategoryDto
                {
                    Id = c.Id,
                    CategoryCode = c.CategoryCode,
                    Name = c.Name,
                    isActive = c.isActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<ProductCategoryDto?> GetByIdAsync(Guid id)
        {
            var c = await _context.ProductCategories.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (c == null) return null;

            return new ProductCategoryDto
            {
                Id = c.Id,
                CategoryCode = c.CategoryCode,
                Name = c.Name,
                isActive = c.isActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            };
        }

        public async Task<ProductCategoryCreateDto> CreateAsync(ProductCategoryCreateDto dto)
        {
            var now = DateTime.UtcNow;
            var count = await _context.ProductCategories.CountAsync();
            var entity = new backend.Model.ProductCategory
            {
                Id =Guid.NewGuid(),
                CategoryCode = $"CAT-{(count + 1):D5}",
                Name = dto.Name,
                isActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.ProductCategories.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            dto.CreatedAt = entity.CreatedAt;
            dto.UpdatedAt = entity.UpdatedAt;
            return dto;
        }

        public async Task<bool> UpdateAsync(Guid id, ProductCategoryDto dto)
        {
            var entity = await _context.ProductCategories.FindAsync(id);
            if (entity == null) return false;

            entity.CategoryCode = dto.CategoryCode;
            entity.Name = dto.Name;
            entity.isActive = dto.isActive;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.ProductCategories.Update(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.ProductCategories.FindAsync(id);
            if (entity == null) return false;

            _context.ProductCategories.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
