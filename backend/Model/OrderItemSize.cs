using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("OrderItemSizes")]
    public class OrderItemSize
    {
        [Key]
        public Guid Id { get; set; }
        public ProductSize Size { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid OrderItemId { get; set; }
        public virtual OrderItem OrderItem { get; set; } = null!;
    }
}
