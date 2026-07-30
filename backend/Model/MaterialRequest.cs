using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("MaterialRequests")]
    public class MaterialRequest
    {
        [Key]
        public Guid Id { get; set; }
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        [Column(TypeName = "decimal(18,2)")]
        public decimal RequestedQuantity { get; set; }
    
        [ForeignKey(nameof(Supplier))]
        public Guid? SupplierId { get; set; }
        public virtual Supplier? Supplier { get; set; }
        
        public string SupplierName { get; set; } = string.Empty;
        public string Urgency { get; set; } = string.Empty;
        public DateTime RequiredDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public MaterialRequestStatus Status { get; set; } = MaterialRequestStatus.Draft;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        public virtual ICollection<MaterialInspection> MaterialInspections { get; set; } = new List<MaterialInspection>();

    }
}
