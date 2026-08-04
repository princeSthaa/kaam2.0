using System.ComponentModel.DataAnnotations;
using backend.Model.Enums;
using backend.Dto.Product;
using backend.Dto.MaterialType;

namespace backend.Dto.ProductMaterialRequirement;

public class ProductMaterialRequirementDto
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Product is required.")]
    public Guid ProductId { get; set; }

    public ProductDto? Product { get; set; }

    [Required(ErrorMessage = "Material is required.")]
    public Guid MaterialTypeId { get; set; }
    public virtual MaterialTypeDto? MaterialType { get; set; }

    [Required(ErrorMessage = "Product size is required.")]
    public ProductSize ProductSize { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
    public decimal Quantity { get; set; }
}