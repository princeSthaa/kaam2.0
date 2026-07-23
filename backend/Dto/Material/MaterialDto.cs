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
using backend.Dto.ProductionPlanStage;
using backend.Dto.BillOfMaterial;
using backend.Dto.Warehouse;
using backend.Dto.WarehouseRoom;
using backend.Dto.WarehouseShelf;
using backend.Dto.Inventory;
using backend.Dto.Outlet;
using backend.Dto.OutletDemand;
using backend.Dto.Transaction;
using backend.Dto.ActivityLog;

namespace backend.Dto.Material
{
    public class MaterialDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required(ErrorMessage = "MaterialCode is required.")]
        public string MaterialCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public decimal AvailableQty { get; set; }

        public string Unit { get; set; } = string.Empty;

        public decimal CostPerUnit { get; set; }

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        // </crudgen:properties>
    }
}
