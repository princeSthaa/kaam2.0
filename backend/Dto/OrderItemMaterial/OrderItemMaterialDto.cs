using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model;
using backend.Dto.Customer;
using backend.Dto.Order;
using backend.Dto.OrderItem;
using backend.Dto.OrderItemSize;
using backend.Dto.Product;
using backend.Dto.WorkCenter;
using backend.Dto.ProductionPlan;
using backend.Dto.ProductionPlanProduct;
using backend.Dto.ProductionPlanProductSize;
using backend.Dto.ProductionPlanStage;
using backend.Dto.MaterialType;
using backend.Dto.MaterialCategory;
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
using backend.Dto.MaterialRequest;
using backend.Dto.MaterialIssue;
using backend.Dto.MaterialInspection;
using backend.Dto.FinishedGoodsHandover;
using backend.Dto.CustomerReturn;

namespace backend.Dto.OrderItemMaterial
{
    public class OrderItemMaterialDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        public Guid MaterialId { get; set; }
        
        public decimal RequiredQuantity { get; set; }

        public string Unit { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        public Guid OrderItemId { get; set; }
        // </crudgen:properties>
    }

    public class OrderItemMaterialGetDto
    {
        public Guid Id { get; set; }

        public Guid MaterialId { get; set; }

        [NotMapped]
        public OrderMaterialGetDto? Material { get; set; }

        public decimal RequiredQuantity { get; set; }

        public string Unit { get; set; } = string.Empty;

        public Guid OrderItemId { get; set; }
    }
}
