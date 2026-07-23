using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialRequests")]
    public class MaterialRequest
    {
        // <crudgen:properties>
        public Guid Id { get; set; }
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public decimal RequestedQuantity { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string Urgency { get; set; } = string.Empty;
        public DateTime RequiredDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}
