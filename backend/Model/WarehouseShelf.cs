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
        public string Capacity { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public Guid WarehouseRackId { get; set; }
        public virtual WarehouseRack WarehouseRack { get; set; } = null!;
        // </crudgen:properties>
    }
}

