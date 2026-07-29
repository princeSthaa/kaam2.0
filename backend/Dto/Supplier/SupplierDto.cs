using System.ComponentModel.DataAnnotations;
using backend.Model.Enums;

namespace backend.Dto.Supplier
{
    public class SupplierDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Supplier Code is required.")]
        public string SupplierCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Supplier Name is required.")]
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string ContactEmail { get; set; } = string.Empty;

        public string ContactPhone { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

         public UserStatus Status { get; set; } = UserStatus.Active;

        public decimal OnTimeDeliveryRate { get; set; }

        public decimal DefectRate { get; set; }

        public decimal Rating { get; set; }

        public int TotalOrders { get; set; }

        public DateTime? LastEvaluatedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}
