using System.ComponentModel.DataAnnotations;
using backend.Dto.ProductMaterialRequirement;
using backend.Dto.ProductProductionStage;

namespace backend.Dto.Product
{
    public class ProductDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "SKU is required.")]
        public string SKU { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        public string ImagePath { get; set; } = string.Empty;

        public bool isActive { get; set; } = true;

        [Required(ErrorMessage = "Product category is required.")]
        public Guid? ProductCategoryId { get; set; }

        public List<ProductMaterialRequirementDto> MaterialRequirements { get; set; } = new();

        public List<ProductProductionStageDto> ProductionStages { get; set; } = new();

    }
}
