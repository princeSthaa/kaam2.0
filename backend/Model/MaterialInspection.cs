using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialInspections")]
    public class MaterialInspection
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(MaterialRequest))]
        public Guid MaterialRequestId { get; set; }
        public virtual MaterialRequest MaterialRequest { get; set; } = null!;

        [ForeignKey(nameof(Supplier))]
        public Guid? SupplierId { get; set; }
        public virtual Supplier? Supplier { get; set; }

        [MaxLength(50)]
        public string InspectionStatus { get; set; } = "Pending";
        public string Notes { get; set; } = string.Empty;
        public string InspectorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;

        public virtual ICollection<MaterialInspectionItem> Items { get; set; } = new List<MaterialInspectionItem>();
    }
}
