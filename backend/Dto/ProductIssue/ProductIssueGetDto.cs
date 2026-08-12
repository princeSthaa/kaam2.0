
namespace backend.Dto.ProductIssue;

public class ProductIssueGetDto
{
    public Guid Id { get; set; }
    public Guid ProductDemandId { get; set; }
    public string RequestID { get; set; } = string.Empty;
    public decimal RequestedQuantity { get; set; }
    public decimal Quantity { get; set; }
    public string IssuedBy { get; set; } = string.Empty;
    public bool isReceived { get; set; } = false;
}