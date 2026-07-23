using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("ProductionPlans")]
    public class ProductionPlan
    {
        // <crudgen:properties>
        public Guid Id { get; set; }
        public string PlanId { get; set; } = string.Empty;
        public string BatchId { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public string DemandType { get; set; } = string.Empty;
        public string SourceId { get; set; } = string.Empty;
        public string SourceName { get; set; } = string.Empty;
        public PlanPriority Priority { get; set; }
        public PlanStatus Status { get; set; }
        public DateTime PlannedStartDate { get; set; }
        public DateTime PlannedCompletionDate { get; set; }
        public int Quantity { get; set; }
        public decimal EstimatedCost { get; set; }
        public string Supervisor { get; set; } = string.Empty;
        public string ProductionLine { get; set; } = string.Empty;
        public string MaterialWarehouse { get; set; } = string.Empty;
        public string ProductionNotes { get; set; } = string.Empty;
        public DateTime PlanDate { get; set; }
        public string OutputDestination { get; set; } = string.Empty;
        public DateTime RequiredDate { get; set; }
        public decimal Progress { get; set; }
        public bool Blocked { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public virtual ICollection<ProductionPlanProduct> ProductionPlanProducts { get; set; } = new List<ProductionPlanProduct>();
        public virtual ICollection<ProductionPlanStage> ProductionPlanStages { get; set; } = new List<ProductionPlanStage>();
        // </crudgen:properties>
    }
}
