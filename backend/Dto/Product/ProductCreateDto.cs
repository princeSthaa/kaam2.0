using System.ComponentModel.DataAnnotations;
using backend.Dto.ProductMaterialRequirement;
using backend.Dto.ProductProductionStage;


namespace backend.Dto.Product
{
    public class ProductCreateDto
    {
        public string? SKU { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Product category is required.")]
        public Guid ProductCategoryId { get; set; }

        public IFormFile? Image { get; set; }

        public bool IsActive { get; set; } = true;

        public List<ProductMaterialRequirementDto> MaterialRequirements { get; set; } = new();

        public List<ProductProductionStageDto> ProductionStages { get; set; } = new();
    }
}