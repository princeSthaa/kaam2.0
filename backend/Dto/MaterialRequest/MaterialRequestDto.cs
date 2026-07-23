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
using backend.Dto.MaterialIssue;
using backend.Dto.MaterialInspection;
using backend.Dto.FinishedGoodsHandover;
using backend.Dto.CustomerReturn;

namespace backend.Dto.MaterialRequest
{
    public class MaterialRequestDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required(ErrorMessage = "MaterialId is required.")]
        public string MaterialId { get; set; } = string.Empty;

        public string MaterialName { get; set; } = string.Empty;

        public decimal RequestedQuantity { get; set; }

        [Required(ErrorMessage = "SupplierName is required.")]
        public string SupplierName { get; set; } = string.Empty;

        public string Urgency { get; set; } = string.Empty;

        public DateTime RequiredDate { get; set; }

        public string Notes { get; set; } = string.Empty;

        public string RequestedBy { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        // </crudgen:properties>
    }
}
