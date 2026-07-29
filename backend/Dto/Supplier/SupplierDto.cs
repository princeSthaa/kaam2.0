using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Supplier
{
    public class SupplierDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Supplier name is required.")]
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string ContactEmail { get; set; } = string.Empty;

        public string ContactPhone { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string Status { get; set; } = "Active";

        public decimal OnTimeDeliveryRate { get; set; }

        public decimal DefectRate { get; set; }

        public decimal Rating { get; set; }

        public int TotalOrders { get; set; }

        public DateTime? LastEvaluatedAt { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
