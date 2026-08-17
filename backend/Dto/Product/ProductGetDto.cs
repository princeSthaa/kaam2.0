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
    }

    public class ProductMaterialRequirementGetDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid MaterialTypeId { get; set; }
        public string MaterialTypeName { get; set; } = string.Empty;
        public string MaterialCode { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public ProductSize ProductSize { get; set; }
        public decimal Quantity { get; set; }
    }
}
