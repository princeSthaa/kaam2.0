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
        [Key]
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [Column(nameof(WarehouseFloorId))]
        public Guid WarehouseFloorId { get; set; }
        public virtual WarehouseFloor? WarehouseFloor { get; set; }

        public virtual ICollection<WarehouseRack> WarehouseRacks { get; set; } = new List<WarehouseRack>();
        // </crudgen:properties>
    }
}

