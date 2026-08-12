using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("WarehouseShelves")]
    public class WarehouseShelf
    {
        // <crudgen:properties>
        [Key]
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Capacity { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [Column(nameof(WarehouseRackId))]
        public Guid WarehouseRackId { get; set; }
        public virtual WarehouseRack? WarehouseRack { get; set; } = null!;
        // </crudgen:properties>
    }
}

