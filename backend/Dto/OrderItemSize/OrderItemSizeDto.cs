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
        public DateTime UpdatedAt { get; set; }
        public Guid OrderItemId { get; set; }
    }

    public class OrderItemSizeGetDto
    {
        public Guid Id { get; set; }
        public Guid OrderItemId { get; set; }
        public ProductSize Size { get; set; }
        public int Quantity { get; set; }
    }
}
