using backend.Data;
using backend.Dto.ProductDemand;
using Microsoft.EntityFrameworkCore;

namespace backend.Service.ProductDemand;

public class ProductDemandService : IProductDemandService
{
    private readonly AppDbContext _context;
    
    public ProductDemandService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDemandGetDto>> GetAllAsync(
        Guid? id = null,
        string? requestId = null,
        decimal? quantity = null,
        string? approvedBy = null,
        bool? isIssued = null,
        DateTime? createdAt = null,
        DateTime? updatedAt = null
    )
    {
        return await _context.Database.SqlQuery<ProductDemandGetDto>($@"
        EXEC sp_GetProductDemand 
            @Id = {id},
            @RequestId = {requestId},
            @Quantity= {quantity},
            @ApprovedBy = {approvedBy},
            @isIssued = {isIssued},
            @CreatedAt = {createdAt},
            @UpdatedAt = {updatedAt}
        ").ToListAsync();
    }

    public async  Task<ProductDemandGetDto?> GetByIdAsync(Guid id)
    {
        var result = await GetAllAsync(id: id);
        return result.FirstOrDefault();
    }

    public async Task<ProductDemandDto> CreateAsync(ProductDemandDto productDemandDto)
    {
        productDemandDto.Id = Guid.NewGuid();
        productDemandDto.CreatedAt = DateTime.UtcNow;
        productDemandDto.UpdatedAt = DateTime.UtcNow;
        
        var count = await _context.Materials.CountAsync();
        productDemandDto.RequestId = $"PRO-DEM-{(count + 1):D5}";

        await _context.Database.ExecuteSqlInterpolatedAsync($@"
            EXEC sp_InsertProductDemand
                @Id = {productDemandDto.Id},
                @RequestId = {productDemandDto.RequestId},
                @MaterialId = {productDemandDto.MaterialId},
                @Quantity = {productDemandDto.Quantity},
                @ApprovedBy = {productDemandDto.ApprovedBy},
                @isIssued = {false},
                @CreatedAt = {productDemandDto.CreatedAt},
                @UpdatedAt = {productDemandDto.UpdatedAt}
        ");

        return productDemandDto;
    }

    public async Task<bool> UpdateAsync(Guid id, ProductDemandDto productDemandDto)
    {
        await _context.Database.ExecuteSqlInterpolatedAsync($@"
            EXEC sp_UpdateProductDemand
                @Id = {id},
                @RequestId = {productDemandDto.RequestId},
                @MaterialId = {productDemandDto.MaterialId},
                @Quantity = {productDemandDto.Quantity},
                @ApprovedBy = {productDemandDto.ApprovedBy},
                @isIssued = {productDemandDto.isIssued},
                @UpdatedAt = {productDemandDto.UpdatedAt}
        ");

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _context.Database.ExecuteSqlInterpolatedAsync($@"
            EXEC sp_DeleteProductDemand
                @Id = {id}
        ") > 0 ;
    }
}