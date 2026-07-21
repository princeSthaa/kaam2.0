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
using backend.Dto.ProductionPlan;
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

namespace backend.Dto.ProductionPlanProduct
{
    public class ProductionPlanProductDto
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;

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

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        public string ProductionPlanId { get; set; }
        [NotMapped]
        public ProductionPlanDto? ProductionPlan { get; set; }

        [NotMapped]
        public List<ProductionPlanProductSizeDto> ProductionPlanProductSizes { get; set; } = new List<ProductionPlanProductSizeDto>();

        // </crudgen:properties>
    }
}


