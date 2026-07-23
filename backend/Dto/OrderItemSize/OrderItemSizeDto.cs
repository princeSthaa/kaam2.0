using System;
using backend.Model.Enums;

namespace backend.Dto.OrderItemSize
{
    public class OrderItemSizeDto
    {
        public Guid Id { get; set; }
        public ProductSize Size { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public Guid OrderItemId { get; set; }
    }
}
