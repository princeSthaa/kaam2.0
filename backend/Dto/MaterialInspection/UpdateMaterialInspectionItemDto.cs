namespace backend.Dto.MaterialInspection
{
    public class UpdateMaterialInspectionItemDto
    {
        public decimal? ReceivedQuantity { get; set; }
        public string? InspectionStatus { get; set; }
        public string? Notes { get; set; }
    }
}
