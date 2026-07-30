using System.ComponentModel.DataAnnotations;
using backend.Model.Enums;

namespace backend.Dto.MaterialRequest
{
    public class MaterialRequestDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required(ErrorMessage = "MaterialId is required.")]
        public string MaterialId { get; set; } = string.Empty;

        public string MaterialName { get; set; } = string.Empty;

        public decimal RequestedQuantity { get; set; }

        public Guid? SupplierId { get; set; }

        public string SupplierName { get; set; } = string.Empty;

        public string Urgency { get; set; } = string.Empty;

        public DateTime RequiredDate { get; set; }

        public string Notes { get; set; } = string.Empty;

        public string RequestedBy { get; set; } = string.Empty;

        public MaterialRequestStatus Status { get; set; } = MaterialRequestStatus.Draft;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        // </crudgen:properties>
    }
}
