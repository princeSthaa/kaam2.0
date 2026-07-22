using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialInspections")]
    public class MaterialInspection
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public decimal ReceivedQuantity { get; set; }
        public string InspectionStatus { get; set; } = "Accepted"; // "Accepted" or "Purchase Return"
        public string Notes { get; set; } = string.Empty;
        public string InspectorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}
