using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("Inventories")]
    public class Inventory
    {
        // <crudgen:properties>
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(Material))]
        public Guid? MaterialId { get; set; }
        public virtual Material? Material { get; set; }

        [ForeignKey(nameof(WarehouseShelf))]
        public Guid? WarehouseShelfId { get; set; }
        public virtual WarehouseShelf? WarehouseShelf { get; set; }

        public string SKU { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        // </crudgen:properties>
    }
}
