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
using backend.Dto.MaterialRequest;
using backend.Dto.MaterialIssue;
using backend.Dto.MaterialInspection;
using backend.Dto.FinishedGoodsHandover;

namespace backend.Dto.CustomerReturn
{
    public class CustomerReturnDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required(ErrorMessage = "OrderNumber is required.")]
        public string OrderNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "CustomerName is required.")]
        public string CustomerName { get; set; } = string.Empty;

        public string ProductId { get; set; } = string.Empty;

        public int ReturnedQuantity { get; set; }

        public string Reason { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public string ProcessedBy { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        // </crudgen:properties>
    }
}
