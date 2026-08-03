using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Model;
[Index(nameof(ProductId), nameof(ProductionStageId), IsUnique = true)]
[Table("ProductProductionStage")]
public class ProductProductionStage
{   
    [Key]
    public Guid Id { get; set; }

    [ForeignKey(nameof(Product))]
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [ForeignKey(nameof(ProductionStage))]
    public Guid ProductionStageId { get; set; }
    public ProductionStage ProductionStage { get; set; } = null!;
    [Range(1, int.MaxValue)]
    public int Sequence { get; set; }
}