using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.WarehouseRack
{
    public class WarehouseRackDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Code is required.")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        [Required(ErrorMessage = "WarehouseRoomId is required.")]
        public Guid WarehouseRoomId { get; set; }
        public System.Collections.Generic.List<backend.Dto.WarehouseShelf.WarehouseShelfDto> WarehouseShelves { get; set; } = new();
    }
}
