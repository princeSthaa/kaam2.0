using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialInspections")]
    public class MaterialInspection
    {
        // <crudgen:properties>
        public Guid Id { get; set; }
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public decimal ReceivedQuantity { get; set; }
        public string InspectionStatus { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string InspectorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}
