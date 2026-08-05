using backend.Model.Enums;

namespace backend.Dto.Product
{
    public class ProductGetDto
    {
        public Guid Id { get; set; }

        public string SKU { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string ImagePath { get; set; } = string.Empty;
        
        public bool IsActive { get; set; } = true;
        public Guid? ProductCategoryId { get; set; }
        public string ProductCategoryName { get; set; } = string.Empty;

        public List<ProductMaterialRequirementGetDto> MaterialRequirements { get; set; } = new();

        public List<ProductProductionStageGetDto> ProductionStages { get; set; } = new();
        
    }

    public class ProductMaterialRequirementGetDto
    {
        public Guid Id { get; set; }
        public Guid MaterialTypeId { get; set; }
        public string MaterialTypeName { get; set; } = string.Empty;
        public string MaterialTypeCode { get; set; } = string.Empty;
        public ProductSize ProductSize { get; set; }
        public int Quantity { get; set; }

    }

    public class ProductProductionStageGetDto
    {
        public Guid Id { get; set; }
        public Guid ProductionStageId { get; set; }
        public string ProductionStageName { get; set; } = string.Empty;
        public string ProductionStageCode { get; set; } = string.Empty;
        public int Sequence { get; set; }
    }
}
