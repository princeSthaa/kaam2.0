using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Fabric
{
    public class FabricCreateDto
    {
        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        public string? Category { get; set; }

        public decimal UnitPrice { get; set; }

        public IFormFile? Image { get; set; }
    }
}
