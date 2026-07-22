using System.Collections.Generic;

namespace backend.Dto.ProductionPlan
{
    public class ProductQuantityDto
    {
        public string ProductId { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public class MaterialCheckRequestDto
    {
        public List<ProductQuantityDto> Products { get; set; } = new List<ProductQuantityDto>();
    }

    public class MaterialCheckItemDto
    {
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal RequiredQty { get; set; }
        public decimal AvailableQty { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class MaterialCheckResponseDto
    {
        public List<MaterialCheckItemDto> Materials { get; set; } = new List<MaterialCheckItemDto>();
        public List<string> Warnings { get; set; } = new List<string>();
    }
}
