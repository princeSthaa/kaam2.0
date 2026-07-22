using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialRequests")]
    public class MaterialRequest
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public decimal RequestedQuantity { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string Urgency { get; set; } = "Normal";
        public DateTime? RequiredDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public string Status { get; set; } = "Requested";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}
