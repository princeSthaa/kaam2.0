using System.ComponentModel.DataAnnotations;
using backend.Model.Enums;

namespace backend.Dto.Product
{
    public class ProductDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        public string ImagePath { get; set; } = string.Empty;

        public List<ProductSize> Sizes { get; set; } = new List<ProductSize>();

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        // </crudgen:properties>
    }
}

