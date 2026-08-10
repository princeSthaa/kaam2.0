
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model;

[Table("ProductDemand")]
public class ProductDemand
{
    [Key]
    public Guid Id { get; set; }

    [Required] [MaxLength(50)]
    public string RequestId { get; set;} = string.Empty;
    
    [ForeignKey(nameof(MaterialId))]
    public Guid MaterialId { get; set; }
    public virtual Material? Material { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Quantity { get; set; }

    [Required] [MaxLength(150)]
    public string ApprovedBy { get; set; } = string.Empty;

    [Required]
    public bool isIssued { get; set; } = false; 

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}