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
        [Key]
        public Guid Id { get; set; }

        public Guid ProductionPlanId { get; set; }
        public virtual ProductionPlan ProductionPlan { get; set; } = null!;

        public Guid WorkCenterId { get; set; }
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
        public DateTime UpdatedAt { get; set; }
        
    }
}

