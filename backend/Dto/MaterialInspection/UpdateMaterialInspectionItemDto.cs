using System;

namespace backend.Dto.MaterialInspection
{
    public class UpdateMaterialInspectionItemDto
    {
        public Guid Id { get; set; }
        public decimal? AcceptedQuantity { get; set; }
        public decimal? RejectedQuantity { get; set; }
        public string? Notes { get; set; }
    }
}
