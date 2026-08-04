using backend.Dto.ProductMaterialRequirement;
using backend.Dto.ProductProductionStage;
using Microsoft.AspNetCore.Http;

namespace backend.Dto.Product
{
    public class ProductUpdateDto
    {
        public string? SKU { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid ProductCategoryId { get; set; }

        public string? ImagePath { get; set; }

        public IFormFile? Image { get; set; }

        public bool IsActive { get; set; } = true;

        public List<ProductMaterialRequirementDto> MaterialRequirements { get; set; } = new();

        public List<ProductProductionStageDto> ProductionStages { get; set; } = new();
    }
}
