using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    public class WarehouseFloor
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [Column(nameof(WarehouseId))]
        public Guid WarehouseId { get; set; }
        public virtual Warehouse? Warehouse { get; set; }
        
        // Navigation Properties
        public virtual ICollection<WarehouseRoom> WarehouseRooms { get; set; } = new List<WarehouseRoom>();
    }
}
