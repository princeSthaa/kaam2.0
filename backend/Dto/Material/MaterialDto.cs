using System.ComponentModel.DataAnnotations;
using backend.Validation;

namespace backend.Dto.Material
{
    public class MaterialDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required, MaxLength(50)]
        public string MaterialCode { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [NotEmptyGuid]
        public Guid MaterialTypeId { get; set; }

        [NotEmptyGuid]
        public Guid MaterialCategoryId { get; set; }
    
        [Range(typeof(decimal), "0", "79228162514264337593543950335")]
        public decimal AvailableQty { get; set; }

        [Required, MaxLength(30)]
        public string Unit { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ImagePath { get; set; } = string.Empty;

        [Range(typeof(decimal), "0", "79228162514264337593543950335")]
        public decimal CostPerUnit { get; set; }

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        // </crudgen:properties>
    }
}
