using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Model;

[Index(nameof(CategoryCode), IsUnique = true)]
[Table("ProductCategories")]
public class ProductCategory
{
    [Key]
    public Guid Id { get; set; }
    public string CategoryCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool isActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public virtual ICollection<Product> Products { get; set; } = new List<Product>(); 
    /* we need this so that when we need to see what products are tied to category we use this to get the products. This is a navigation property that allows us to navigate from a ProductCategory to its related Products.*/ 
}