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

        [MaxLength(50)]
        public string RequestNumber { get; set; } = string.Empty;

        [ForeignKey(nameof(Supplier))]
        public Guid? SupplierId { get; set; }
        public virtual Supplier? Supplier { get; set; }

        public MaterialRequestStatus Status { get; set; } = MaterialRequestStatus.Draft;
        public DateTime RequiredDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        public virtual ICollection<MaterialRequestItem> Items { get; set; } = new List<MaterialRequestItem>();
        public virtual MaterialInspection? MaterialInspection { get; set; }
    }
}
