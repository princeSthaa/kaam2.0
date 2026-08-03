namespace backend.Dto.Supplier
{
    public class SupplierMaterialRequestResponseDto
    {
        public Guid Id { get; set; }

        public string MaterialId { get; set; } = string.Empty;

        public decimal RequestedQuantity { get; set; } 

        public DateTime RequiredDate { get; set; }

        public string Notes { get; set; } = string.Empty;

        public string RequestedBy { get; set; } = string.Empty;
    }
}
