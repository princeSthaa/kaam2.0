namespace backend.Models;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
    public List<string> Sizes { get; set; } = new();
}
