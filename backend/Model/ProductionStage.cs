using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model;

[Table("ProductionStages")]
public class ProductionStage
{
    [Key]
    public Guid Id { get; set; }

    public string ProductionStageCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string Description { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<ProductProductionStage> ProductProductionStages { get; set; } = new List<ProductProductionStage>();
}