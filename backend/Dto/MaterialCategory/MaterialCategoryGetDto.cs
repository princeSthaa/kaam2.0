namespace backend.Dto.MaterialCategory;

public class MaterialCategoryGetDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid MaterialTypeId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
