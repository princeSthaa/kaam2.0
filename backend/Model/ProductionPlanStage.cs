using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("ProductionPlanStages")]
    public class ProductionPlanStage
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public string StageId { get; set; } = string.Empty;
        public string StageName { get; set; } = string.Empty;
        public string WorkCenterId { get; set; }
        public virtual WorkCenter WorkCenter { get; set; } = null!;
        public string OperatorName { get; set; } = string.Empty;
        public DateTime PlannedStartDate { get; set; }
        public DateTime PlannedEndDate { get; set; }
        public PlanStatus Status { get; set; }
        public int CompletedQty { get; set; }
        public int RejectedQty { get; set; }
        public DateTime ActualStartDate { get; set; }
        public DateTime ActualEndDate { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public string ProductionPlanId { get; set; }
        public virtual ProductionPlan ProductionPlan { get; set; } = null!;
        // </crudgen:properties>
    }
}

