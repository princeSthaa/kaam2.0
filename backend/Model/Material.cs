using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("Materials")]
    public class Material
    {
        // <crudgen:properties>
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string MaterialCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [ForeignKey(nameof(MaterialType))]
        public Guid MaterialTypeId { get; set; }

        public virtual MaterialType MaterialType { get; set; } = null!;

        [ForeignKey(nameof(MaterialCategory))]
        public Guid MaterialCategoryId { get; set; }

        public virtual MaterialCategory MaterialCategory { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal AvailableQty { get; set; }

        [Required]
        [MaxLength(30)]
        public string Unit { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ImagePath { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostPerUnit { get; set; }

        public DateTime CreatedAt { get; set; }

        [Required]
        [MaxLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        [Required]
        [MaxLength(100)]
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}
