using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.WarehouseShelf;

namespace backend.Dto.WarehouseRack
{
    public class WarehouseRackDto
    {
        public Guid Id { get; set; }

        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        [Required(ErrorMessage = "WarehouseRoomId is required.")]
        public Guid WarehouseRoomId { get; set; }
        
        [NotMapped]
        public List<WarehouseShelfDto> WarehouseShelves { get; set; } = new();
    }
}
