
namespace backend.Dto.ProductDemand;
public class ProductDemandGetDto
{
    public Guid Id { get; set; }

    public string RequestId { get; set;} = string.Empty;
    
    public Guid MaterialId { get; set; }

    public string MaterialCode { get; set; } = string.Empty;

    public string MaterialTypeName { get; set; } = string.Empty;

    public string MaterialTypeCode { get; set; } = string.Empty;

    public string MaterialCategoryName { get; set; } = string.Empty;

    public string MaterialCategoryCode { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public string ApprovedBy { get; set; } = string.Empty;

    public bool isIssued { get; set; } = false; 
}