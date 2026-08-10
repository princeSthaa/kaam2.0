

namespace backend.Dto.ProductDemand;
public class ProductDemandDto
{
    public Guid Id { get; set; }

    public string RequestId { get; set;} = string.Empty;
    
    public Guid MaterialId { get; set; }
    
    public decimal Quantity { get; set; }

    public string ApprovedBy { get; set; } = string.Empty;

    public bool isIssued { get; set; } = false; 
    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}