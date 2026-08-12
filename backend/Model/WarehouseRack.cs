using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    public class WarehouseRack
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column(nameof(WarehouseRoomId))]
        public Guid WarehouseRoomId { get; set; }        
        public virtual WarehouseRoom? WarehouseRoom { get; set; }
        
        public virtual ICollection<WarehouseShelf> WarehouseShelfs { get; set; } = new List<WarehouseShelf>();
    }
}
