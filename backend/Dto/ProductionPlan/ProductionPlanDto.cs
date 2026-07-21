using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model;
using backend.Dto.Customer;
using backend.Dto.Order;
using backend.Dto.OrderItem;
using backend.Dto.Product;
using backend.Dto.Fabric;
using backend.Dto.WorkCenter;
using backend.Dto.ProductionPlanProduct;
using backend.Dto.ProductionPlanProductSize;
using backend.Dto.ProductionPlanStage;
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

namespace backend.Dto.ProductionPlan
{
    public class ProductionPlanDto
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;

        [Required(ErrorMessage = "PlanId is required.")]
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

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        [NotMapped]
        public List<ProductionPlanProductDto> ProductionPlanProducts { get; set; } = new List<ProductionPlanProductDto>();

        [NotMapped]
        public List<ProductionPlanStageDto> ProductionPlanStages { get; set; } = new List<ProductionPlanStageDto>();

        // </crudgen:properties>
    }
}

