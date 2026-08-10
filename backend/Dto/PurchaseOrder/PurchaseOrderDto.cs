using System;
using System.Collections.Generic;
using backend.Model.Enums;

namespace backend.Dto.PurchaseOrder
{
    public class PurchaseOrderDto
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public decimal TotalAmount { get; set; }
        public Guid SupplierId { get; set; }
        public Guid? MaterialCategoryId { get; set; }
        public string ShippingMethod { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentTerms { get; set; } = string.Empty;
        public DateTime ExpectedDeliveryDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public List<PurchaseOrderItemDto> Items { get; set; } = new List<PurchaseOrderItemDto>();
    }
}