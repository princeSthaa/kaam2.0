using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("WarehouseRooms")]
    public class WarehouseRoom
    {
        // <crudgen:properties>
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Floor { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public Guid WarehouseId { get; set; }
        public virtual Warehouse Warehouse { get; set; } = null!;
        public virtual ICollection<WarehouseShelf> WarehouseShelfs { get; set; } = new List<WarehouseShelf>();
        // </crudgen:properties>
    }
}

