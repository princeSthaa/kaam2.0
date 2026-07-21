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

        // <crudgen:methods>
        public async Task<List<ProductDto>> GetAllAsync(
            string? id = null,
            string? name = null,
            string? imagePath = null,
            DateTime? createdAt = null,
            string? createdBy = null,
            DateTime? updatedAt = null,
            string? updatedBy = null
        )
        {
            return await _context.Database
                .SqlQuery<ProductDto>($@"
                    EXEC sp_GetProducts

                        @Id = {id},
                        @Name = {name},
                        @ImagePath = {imagePath},
                        @CreatedAt = {createdAt},
                        @CreatedBy = {createdBy},
                        @UpdatedAt = {updatedAt},
                        @UpdatedBy = {updatedBy}
                ")
                .ToListAsync();
        }

        public async Task<bool> CreateAsync(ProductDto productDto)
        {
            var sizesJson = JsonSerializer.Serialize(productDto.Sizes);

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProduct

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

        public async Task<bool> UpdateAsync(string id, ProductDto productDto)
        {
            var sizesJson = JsonSerializer.Serialize(productDto.Sizes);

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProduct

                    @Id = {id},
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

        public async Task<bool> DeleteAsync(string id)
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
