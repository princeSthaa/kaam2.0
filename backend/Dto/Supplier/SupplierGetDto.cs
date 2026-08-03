using backend.Model.Enums;
using backend.Dto.Supplier;

namespace backend.Dto.Supplier
{
    public class SupplierGetDto
    {
        public Guid Id { get; set; }

        public string SupplierCode { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string ContactEmail { get; set; } = string.Empty;

        public string ContactPhone { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public UserStatus Status { get; set; } = UserStatus.Active;

        public decimal OnTimeDeliveryRate { get; set; }

        public decimal DefectRate { get; set; }

        public decimal Rating { get; set; }

        public int TotalOrders { get; set; }

        public DateTime? LastEvaluatedAt { get; set; }
        public List<SupplierCategoryResponseDto> MaterialCategories { get; set; } = new List<SupplierCategoryResponseDto>();

        public List<SupplierMaterialRequestResponseDto> MaterialRequests { get; set; } = new List<SupplierMaterialRequestResponseDto>();
    }
}
