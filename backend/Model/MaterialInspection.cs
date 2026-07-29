using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialInspections")]
    public class MaterialInspection
    {
        [Key]
        public Guid Id { get; set; }
        public string MaterialId { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;

        [ForeignKey(nameof(MaterialRequest))]
        public Guid MaterialRequestId { get; set; }
        public virtual MaterialRequest MaterialRequest { get; set; } = null!;
            
        [Column(TypeName = "decimal(18,2)")]
        public decimal ReceivedQuantity { get; set; }
        public string InspectionStatus { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string InspectorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
    
    }
}
