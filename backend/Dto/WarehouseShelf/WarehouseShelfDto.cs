using System.ComponentModel.DataAnnotations;


namespace backend.Dto.WarehouseShelf
{
    public class WarehouseShelfDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;
        public string Capacity { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [Required(ErrorMessage = "WarehouseRackId is required.")]
        public Guid WarehouseRackId { get; set; }
    }
}

