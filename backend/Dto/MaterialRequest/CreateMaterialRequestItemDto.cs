namespace backend.Dto.MaterialRequest
{
    public class CreateMaterialRequestItemDto
    {
        public Guid MaterialId { get; set; }
        public decimal RequestedQuantity { get; set; }
    }
}
