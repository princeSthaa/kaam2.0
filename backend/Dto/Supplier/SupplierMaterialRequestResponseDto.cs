using backend.Model.Enums;

namespace backend.Dto.Supplier
{
    public class SupplierMaterialRequestResponseDto
    {
        public Guid Id { get; set; }

        public string MaterialId { get; set; } = string.Empty;

        public string MaterialName { get; set; } = string.Empty;

        public decimal RequestedQuantity { get; set; } 

        public string Urgency { get; set; } = string.Empty;

        public DateTime RequiredDate { get; set; }

        public string Notes { get; set; } = string.Empty;

        public string RequestedBy { get; set; } = string.Empty;

        public MaterialRequestStatus Status { get; set; } = MaterialRequestStatus.Draft;

    }
}
