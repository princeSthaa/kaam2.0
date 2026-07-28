using System.ComponentModel.DataAnnotations;

namespace backend.Dto.MaterialInspection
{
    public class MaterialInspectionDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required(ErrorMessage = "MaterialId is required.")]
        public string MaterialId { get; set; } = string.Empty;

        public string MaterialName { get; set; } = string.Empty;

        public string SupplierName { get; set; } = string.Empty;

        public decimal ReceivedQuantity { get; set; }

        [Required(ErrorMessage = "InspectionStatus is required.")]
        public string InspectionStatus { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public string InspectorName { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        // </crudgen:properties>
    }
}
