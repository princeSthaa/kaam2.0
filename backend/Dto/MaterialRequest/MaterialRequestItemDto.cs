using backend.Dto.Material;

namespace backend.Dto.MaterialRequest
{
    public class MaterialRequestItemDto
    {
        public Guid Id { get; set; }
        public Guid MaterialId { get; set; }
        public decimal RequestedQuantity { get; set; }
        public MaterialGetDto? Material { get; set; }
    }
}
