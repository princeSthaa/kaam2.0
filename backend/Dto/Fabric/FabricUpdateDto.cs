using Microsoft.AspNetCore.Http;

namespace backend.Dto.Fabric
{
    public class FabricUpdateDto
    {
        public string Name { get; set; } = string.Empty;

        public string? Category { get; set; }

        public decimal UnitPrice { get; set; }

        public string? ImagePath { get; set; }

        public IFormFile? Image { get; set; }
    }
}
