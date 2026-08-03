using System;

namespace backend.Dto.MaterialInspection
{
    public class MaterialInspectionItemDto
    {
        public Guid Id { get; set; }
        public Guid MaterialInspectionId { get; set; }
        public Guid MaterialId { get; set; }
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal ReceivedQuantity { get; set; }
        public string InspectionStatus { get; set; } = "Pending";
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
