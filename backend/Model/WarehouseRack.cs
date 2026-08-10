using System;
using System.Collections.Generic;

namespace backend.Model
{
    public class WarehouseRack
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Code { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;

        // Foreign Key
        public Guid WarehouseRoomId { get; set; }
        
        // Navigation Properties
        public virtual WarehouseRoom WarehouseRoom { get; set; } = null!;
        public virtual ICollection<WarehouseShelf> WarehouseShelfs { get; set; } = new List<WarehouseShelf>();
    }
}
