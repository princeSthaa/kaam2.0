using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.WarehouseRack;

namespace backend.Dto.WarehouseRoom
{
    public class WarehouseRoomDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid WarehouseFloorId { get; set; }
        [NotMapped]
        public List<WarehouseRackDto> WarehouseRacks { get; set; } = new();

        // </crudgen:properties>
    }
}


