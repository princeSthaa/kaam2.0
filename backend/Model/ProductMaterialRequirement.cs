using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Model;

[Index(nameof(ProductId), nameof(MaterialId), nameof(ProductSize), IsUnique = true)] // indicates unique 1 product id with unique 1 material id with unique 1 product size
[Table("ProductMaterialRequirements")]
public class ProductMaterialRequirement
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [ForeignKey(nameof(ProductId))]
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    [Required]
    [ForeignKey(nameof(MaterialId))]
    public Guid MaterialId { get; set; }
    public Material Material { get; set; } = null!;

    [Required]
    public ProductSize ProductSize { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Quantity { get; set; }
}