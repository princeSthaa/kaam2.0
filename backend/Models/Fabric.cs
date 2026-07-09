namespace backend.Models;

public class Fabric : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
}
