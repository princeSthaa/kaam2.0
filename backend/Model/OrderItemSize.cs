using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("OrderItemSizes")]
    public class OrderItemSize
    {
        public Guid Id { get; set; }
        public ProductSize Size { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public Guid OrderItemId { get; set; }
        public virtual OrderItem OrderItem { get; set; } = null!;
    }
}
