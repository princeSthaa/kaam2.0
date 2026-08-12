using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.WarehouseFloor;

namespace backend.Dto.Warehouse
{
    public class WarehouseDto
    {
        public Guid Id { get; set; }

        public string Code { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        [NotMapped]
        public List<WarehouseFloorDto> WarehouseFloors { get; set; } = new List<WarehouseFloorDto>();

    }
}

