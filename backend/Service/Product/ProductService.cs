using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dto.Product;
using backend.Model;
using backend.Model.Enums;

namespace backend.Service.Product
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(ProductDto productDto)
        {
            productDto.ImagePath = backend.Helpers.ImagePathHelper.ToRelativePath(productDto.ImagePath);
            var sizesJson = JsonSerializer.Serialize(productDto.Sizes.Select(s => s.ToString()).ToList());

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProduct
                    @Id = {productDto.Id},
                    @Name = {productDto.Name},
                    @ImagePath = {productDto.ImagePath},
                    @CreatedAt = {productDto.CreatedAt},
                    @CreatedBy = {productDto.CreatedBy},
                    @UpdatedAt = {productDto.UpdatedAt},
                    @UpdatedBy = {productDto.UpdatedBy},
                    @SizesJson = {sizesJson}
            ");

            return true;
        }

        // <crudgen:methods>
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
            var products = await _context.Products
                .FromSqlInterpolated($@"
                    EXEC sp_GetProducts
                        @Id = {id},
                        @Name = {name},
                        @ImagePath = {imagePath},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .AsNoTracking()
                .ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                ImagePath = p.ImagePath,
                Sizes = p.Sizes ?? new List<ProductSize>(),
                CreatedAt = p.CreatedAt,
                CreatedBy = p.CreatedBy,
                UpdatedAt = p.UpdatedAt,
                UpdatedBy = p.UpdatedBy
            }).ToList();
        }

        public async Task<ProductDto?> GetByIdAsync(Guid id)
        {
            var results = await GetAllAsync(id: id);
            return results.FirstOrDefault();
        }

        public async Task<bool> UpdateAsync(Guid id, ProductDto productDto)
        {
            var sizesJson = JsonSerializer.Serialize(productDto.Sizes.Select(s => s.ToString()).ToList());

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProduct
                    @Id = {productDto.Id},
                    @Name = {productDto.Name},
                    @ImagePath = {productDto.ImagePath},
                    @CreatedAt = {productDto.CreatedAt},
                    @CreatedBy = {productDto.CreatedBy},
                    @UpdatedAt = {productDto.UpdatedAt},
                    @UpdatedBy = {productDto.UpdatedBy},
                    @SizesJson = {sizesJson}
            ");

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_DeleteProduct
                    @Id = {id}
            ");

            return true;
        }

        // </crudgen:methods>
    }
}
