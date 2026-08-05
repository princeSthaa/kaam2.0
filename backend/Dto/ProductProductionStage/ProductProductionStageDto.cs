using System.ComponentModel.DataAnnotations;
using backend.Dto.Product;
using backend.Dto.ProductionStage;

namespace backend.Dto.ProductProductionStage;

public class ProductProductionStageDto
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Product is required.")]
    public Guid ProductId { get; set; }
    public virtual ProductDto? Product { get; set; }

    [Required(ErrorMessage = "Production stage is required.")]
    public Guid ProductionStageId { get; set; }
    public ProductionStageDto? ProductionStage { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Sequence must be at least 1.")]
    public int Sequence { get; set; }
}