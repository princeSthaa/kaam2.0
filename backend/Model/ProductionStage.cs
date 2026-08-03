using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model;

[Table("ProductionStages")]
public class ProductionStage
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public bool isActive { get; set; } = true;
    public string? Description { get; set; }
    public virtual ICollection<ProductProductionStage> ProductProductionStages { get; set; } = new List<ProductProductionStage>();
}