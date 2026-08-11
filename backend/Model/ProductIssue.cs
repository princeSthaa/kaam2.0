
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model;

[Table("ProductIssue")]
public class ProductIssue
{
    [Key]
    public Guid Id { get; set; }

    [ForeignKey(nameof(ProductDemandId))]
    public Guid ProductDemandId { get; set; }
    public virtual ProductDemand? ProductDemand { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Quantity { get; set; }

    [Required] [MaxLength(150)]
    public string IssuedBy { get; set; } = string.Empty;
    
    public bool isReceived { get; set; } = false;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}