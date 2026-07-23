using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model;
using backend.Dto.Customer;
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
using backend.Model.Enums;

namespace backend.Dto.Order
{
    public class OrderDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        public string OrderNumber { get; set; } = string.Empty;

        public OrderStatus Status { get; set; }

        public decimal TotalAmount { get; set; }

        public DateTime DueDate { get; set; }

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;

        public Guid CustomerId { get; set; }
        [NotMapped]
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();

        // </crudgen:properties>
    }
}


