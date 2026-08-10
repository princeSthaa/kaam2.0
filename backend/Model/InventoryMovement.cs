using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("InventoryMovements")]
    public class InventoryMovement
    {
        [Key]
        public Guid Id { get; set; }

        public string MovementType { get; set; } = string.Empty; // e.g. "PutAway", "Transfer"

        [ForeignKey(nameof(Material))]
        public Guid MaterialId { get; set; }
        public virtual Material Material { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [ForeignKey(nameof(FromWarehouseShelf))]
        public Guid? FromWarehouseShelfId { get; set; }
        public virtual WarehouseShelf? FromWarehouseShelf { get; set; }

        [ForeignKey(nameof(ToWarehouseShelf))]
        public Guid? ToWarehouseShelfId { get; set; }
        public virtual WarehouseShelf? ToWarehouseShelf { get; set; }

        public DateTime Timestamp { get; set; }
        public string HandledBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
    }
}
