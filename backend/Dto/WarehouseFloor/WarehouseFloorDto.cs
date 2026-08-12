using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.WarehouseRoom;

namespace backend.Dto.WarehouseFloor
{
    public class WarehouseFloorDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;
        
        public string Code { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public Guid WarehouseId { get; set; }

        [NotMapped]
        public List<WarehouseRoomDto> WarehouseRooms { get; set; } = new List<WarehouseRoomDto>();

    }
}

