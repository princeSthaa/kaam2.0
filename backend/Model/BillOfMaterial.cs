using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("BillOfMaterials")]
    public class BillOfMaterial
    {
        // <crudgen:properties>
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;
        public Guid MaterialId { get; set; }
        public virtual Material Material { get; set; } = null!;
        public decimal QtyPerUnit { get; set; }
        public decimal WastagePercent { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}

