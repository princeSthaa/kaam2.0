using Microsoft.AspNetCore.Http;

namespace backend.Dto.Product
{
    public class ProductUpdateDto
    {
        public string Name { get; set; } = string.Empty;

        public string? ImagePath { get; set; }

        public IFormFile? Image { get; set; }

        public string? Sizes { get; set; }
    }
}
