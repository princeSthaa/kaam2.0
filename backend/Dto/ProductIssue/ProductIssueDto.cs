

namespace backend.Dto.ProductIssue;
public class ProductIssueDto
{
    public Guid Id { get; set; }
    public Guid ProductDemandId { get; set; }
    public decimal Quantity { get; set; }
    public string IssuedBy { get; set; } = string.Empty;
    public bool isReceived { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}