namespace backend.Dto.Material;

public class MaterialGetDto
{
    public Guid Id { get; set; }
    public string MaterialCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid MaterialTypeId { get; set; }
    public string MaterialTypeName { get; set; } = string.Empty;
    public Guid MaterialCategoryId { get; set; }
    public string MaterialCategoryName { get; set; } = string.Empty;
    public decimal AvailableQty { get; set; }
    public string ImagePath { get; set; } = string.Empty;
    public decimal CostPerUnit { get; set; }
    
}
