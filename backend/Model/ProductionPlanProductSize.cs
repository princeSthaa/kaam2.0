using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("ProductionPlanProductSizes")]
    public class ProductionPlanProductSize
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public ProductSize Size { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public string ProductionPlanProductId { get; set; }
        public virtual ProductionPlanProduct ProductionPlanProduct { get; set; } = null!;
        // </crudgen:properties>
    }
}

