using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("ProductionPlanProducts")]
    public class ProductionPlanProduct
    {
        // <crudgen:properties>
        public Guid Id { get; set; }
        public string LineId { get; set; } = string.Empty;
        public string OrderNo { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Variant { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime RequiredDate { get; set; }
        public PlanStatus Status { get; set; }
        public string ProductImage { get; set; } = string.Empty;
        public DateTime PlannedStartDate { get; set; }
        public DateTime PlannedCompletionDate { get; set; }
        public PlanPriority Priority { get; set; }
        public string ProductionNotes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public Guid ProductionPlanId { get; set; }
        public virtual ProductionPlan ProductionPlan { get; set; } = null!;
        public virtual ICollection<ProductionPlanProductSize> ProductionPlanProductSizes { get; set; } = new List<ProductionPlanProductSize>();
        // </crudgen:properties>
    }
}

