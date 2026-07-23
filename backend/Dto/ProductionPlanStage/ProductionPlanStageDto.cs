using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using backend.Model;
using backend.Dto.Customer;
using backend.Dto.Order;
using backend.Dto.OrderItem;
using backend.Dto.Product;
using backend.Dto.Fabric;
using backend.Dto.WorkCenter;
using backend.Dto.ProductionPlan;
using backend.Dto.ProductionPlanProduct;
using backend.Dto.ProductionPlanProductSize;
using backend.Dto.Material;
using backend.Dto.BillOfMaterial;
using backend.Dto.Warehouse;
using backend.Dto.WarehouseRoom;
using backend.Dto.WarehouseShelf;
using backend.Dto.Inventory;
using backend.Dto.Outlet;
using backend.Dto.OutletDemand;
using backend.Dto.Transaction;
using backend.Dto.ActivityLog;
using backend.Model.Enums;

namespace backend.Dto.ProductionPlanStage
{
    public class ProductionPlanStageDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        public string StageId { get; set; } = string.Empty;

        public string StageName { get; set; } = string.Empty;

        public Guid WorkCenterId { get; set; }
        [NotMapped]
        public WorkCenterDto? WorkCenter { get; set; }

        public string OperatorName { get; set; } = string.Empty;

        public DateTime PlannedStartDate { get; set; }

        public DateTime PlannedEndDate { get; set; }

        public PlanStatus Status { get; set; }

        public int CompletedQty { get; set; }

        public int RejectedQty { get; set; }

        public DateTime ActualStartDate { get; set; }

        public DateTime ActualEndDate { get; set; }

        public string Remarks { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        public Guid ProductionPlanId { get; set; }
        // </crudgen:properties>
    }
}

