using backend.Data;
using backend.Dto.ProductIssue;
using Microsoft.EntityFrameworkCore;

namespace backend.Service.ProductIssue;

public class ProductIssueService : IProductIssueService
{
    private readonly AppDbContext _context;
    
    public ProductIssueService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductIssueGetDto>> GetAllAsync(
        Guid? id = null,
        Guid? productDemandId = null,
        decimal? quantity = null,
        string? issuedBy = null,
        bool? isReceived = null,
        DateTime? createdAt = null,
        DateTime? updatedAt = null
    )
    {
        return await _context.Database.SqlQuery<ProductIssueGetDto>($@"
        EXEC sp_GetProductIssue
            @Id = {id},
            @ProductDemandId = {productDemandId},
            @Quantity= {quantity},
            @IssuedBy = {issuedBy},
            @isReceived = {isReceived},
            @CreatedAt = {createdAt},
            @UpdatedAt = {updatedAt}
        ").ToListAsync();
    }

    public async  Task<ProductIssueGetDto?> GetByIdAsync(Guid id)
    {
        var result = await GetAllAsync(id: id);
        return result.FirstOrDefault();
    }

    public async Task<ProductIssueDto> CreateAsync(ProductIssueDto productIssueDto)
    {   
        var demand = await _context.ProductDemands.FirstOrDefaultAsync(x => x.Id == productIssueDto.ProductDemandId);
        
        if (demand == null)
            throw new InvalidOperationException("Product demand not found ");

        if (demand.isIssued)
            throw new InvalidOperationException("Product demand has already been issued.");

        if (productIssueDto.Quantity != demand.Quantity)
            throw new InvalidOperationException($"Issue quantity must equal the demand quantity ({demand.Quantity}).");

        productIssueDto.Id = Guid.NewGuid();
        productIssueDto.CreatedAt = DateTime.UtcNow;
        productIssueDto.UpdatedAt = DateTime.UtcNow;
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_InsertProductIssue
                    @Id = {productIssueDto.Id},
                    @ProductDemandId = {productIssueDto.ProductDemandId},
                    @Quantity = {productIssueDto.Quantity},
                    @IssuedBy = {productIssueDto.IssuedBy},
                    @isReceived = {false},
                    @CreatedAt = {productIssueDto.CreatedAt},
                    @UpdatedAt = {productIssueDto.UpdatedAt}
            ");

            await _context.Database.ExecuteSqlInterpolatedAsync($@"
                EXEC sp_UpdateProductDemand
                    @Id = {productIssueDto.ProductDemandId},
                    @isIssued = {true}
            ");
            await transaction.CommitAsync();
            return productIssueDto;
        } catch
        {
            await transaction.RollbackAsync();
            throw;
        }

    }

    public async Task<bool> UpdateAsync(Guid id, ProductIssueDto productIssueDto)
    {
        await _context.Database.ExecuteSqlInterpolatedAsync($@"
            EXEC sp_UpdateProductIssue
                @Id = {id},
                @Quantity = {productIssueDto.Quantity},
                @IssuedBy = {productIssueDto.IssuedBy},
                @isReceived = {productIssueDto.isReceived},
                @UpdatedAt = {productIssueDto.UpdatedAt}
        ");

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _context.Database.ExecuteSqlInterpolatedAsync($@"
            EXEC sp_DeleteProductIssue
                @Id = {id}
        ") > 0 ;
    }
}