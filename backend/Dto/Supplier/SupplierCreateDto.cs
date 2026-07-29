using System.ComponentModel.DataAnnotations;
using backend.Model.Enums;

namespace backend.Dto.Supplier
{
    public class SupplierCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [EmailAddress]
        public string ContactEmail { get; set; } = string.Empty;

        public string ContactPhone { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;
         public UserStatus Status { get; set; } = UserStatus.Active;
    }
}
