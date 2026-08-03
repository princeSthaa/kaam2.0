using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialRequestItems")]
    public class MaterialRequestItem
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(MaterialRequest))]
        public Guid MaterialRequestId { get; set; }
        public virtual MaterialRequest? MaterialRequest { get; set; }

        [ForeignKey(nameof(Material))]
        public Guid MaterialId { get; set; }
        public virtual Material? Material { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RequestedQuantity { get; set; }
    }
}
