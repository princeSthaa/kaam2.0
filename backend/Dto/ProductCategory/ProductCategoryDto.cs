using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.ProductCategory
{
    public class ProductCategoryDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "CategoryCode is required.")]
        public string CategoryCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        public bool isActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
