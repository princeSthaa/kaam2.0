using backend.Model.Enums;
using backend.Dto.Material;
using backend.Dto.Supplier;

namespace backend.Dto.MaterialRequest
{
    public class MaterialRequestGetDto
    {
        public Guid Id { get; set; }

        public string MaterialId { get; set; } = string.Empty;

        public Guid? SupplierId { get; set; }

        public decimal RequestedQuantity { get; set; }

        public DateTime RequiredDate { get; set; }

        public string Notes { get; set; } = string.Empty;

        public string RequestedBy { get; set; } = string.Empty;

        public MaterialGetDto? Material { get; set; }

        public SupplierDto? Supplier { get; set; }
    }
}
