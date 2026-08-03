using backend.Model.Enums;
using backend.Dto.Supplier;

namespace backend.Dto.MaterialRequest
{
    public class MaterialRequestDto
    {
        public Guid Id { get; set; }
        public string RequestNumber { get; set; } = string.Empty;
        public Guid? SupplierId { get; set; }
        public MaterialRequestStatus Status { get; set; } = MaterialRequestStatus.Draft;
        public DateTime RequiredDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;

        public SupplierGetDto? Supplier { get; set; }
        public List<MaterialRequestItemDto> Items { get; set; } = new();
    }
}
