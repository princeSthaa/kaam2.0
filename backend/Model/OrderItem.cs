using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("OrderItems")]
    public class OrderItem
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;
        public string FabricId { get; set; }
        public virtual Fabric Fabric { get; set; } = null!;
        public decimal TotalPrice { get; set; }
        public decimal Discount { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public string OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;
        // </crudgen:properties>
    }
}

