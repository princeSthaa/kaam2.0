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
using backend.Dto.Material;
using backend.Dto.BillOfMaterial;
using backend.Dto.Warehouse;
using backend.Dto.WarehouseRoom;
using backend.Dto.WarehouseShelf;
using backend.Dto.Inventory;
using backend.Dto.Outlet;
using backend.Dto.OutletDemand;
using backend.Dto.ActivityLog;

namespace backend.Dto.Transaction
{
    public class TransactionDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Timestamp is required.")]
        public DateTime Timestamp { get; set; }

        public string TransactionType { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string ReferenceEntity { get; set; } = string.Empty;

        public string HandledBy { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        // </crudgen:properties>
    }
}
