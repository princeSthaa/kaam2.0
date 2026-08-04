namespace backend.Dto.MaterialType;

public class MaterialTypeGetDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MaterialCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string Unit { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
