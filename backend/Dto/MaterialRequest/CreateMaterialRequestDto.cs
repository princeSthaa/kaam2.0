using backend.Model.Enums;

namespace backend.Dto.MaterialRequest
{
    public class CreateMaterialRequestDto
    {
        public Guid? SupplierId { get; set; }
        public MaterialRequestStatus Status { get; set; } = MaterialRequestStatus.Draft;
        public DateTime RequiredDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public List<CreateMaterialRequestItemDto> Items { get; set; } = new();
    }
}
