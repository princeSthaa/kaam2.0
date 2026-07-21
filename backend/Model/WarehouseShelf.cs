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
        public string Id { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Capacity { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public string WarehouseRoomId { get; set; }
        public virtual WarehouseRoom WarehouseRoom { get; set; } = null!;
        // </crudgen:properties>
    }
}

