
namespace backend.Model;

public class ProductIssue
{
    public Guid Id { get; set; }
    public Guid ProductDemandId { get; set; }
    public string RequestID { get; set; } = string.Empty;
    public decimal RequestedQuantity { get; set; }
    public decimal Qunatity { get; set; }
    public string IssuedBy { get; set; } = string.Empty;
    public bool isReceived { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}