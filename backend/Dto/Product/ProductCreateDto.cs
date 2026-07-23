using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Product
{
    public class ProductCreateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        public IFormFile? Image { get; set; }

        public string? Sizes { get; set; }
    }
}
