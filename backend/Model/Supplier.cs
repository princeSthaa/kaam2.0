using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("Suppliers")]
    public class Supplier
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [EmailAddress]
        [MaxLength(150)]
        public string ContactEmail { get; set; } = string.Empty;

        [MaxLength(50)]
        public string ContactPhone { get; set; } = string.Empty;

        [MaxLength(250)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        [Column(TypeName = "decimal(5,2)")]
        public decimal OnTimeDeliveryRate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal DefectRate { get; set; }

        [Column(TypeName = "decimal(3,2)")]
        public decimal Rating { get; set; }

        public int TotalOrders { get; set; }

        public DateTime? LastEvaluatedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<MaterialCategory> MaterialCategories { get; set; } = new List<MaterialCategory>();
        public virtual ICollection<MaterialRequest> MaterialRequests { get; set; } = new List<MaterialRequest>();
        public virtual ICollection<MaterialInspection> MaterialInspections { get; set; } = new List<MaterialInspection>();
    }
}