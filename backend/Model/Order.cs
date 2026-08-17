using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model
{
    [Table("Orders")]
    public class Order
    {
        [Key]
        public Guid Id { get; set; }
        [MaxLength(20)]
        public string OrderNumber { get; set; } = string.Empty;
        public OrderStatus Status { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid CustomerId { get; set; }
        public virtual Customer Customer { get; set; } = null!;
        public Guid? ProductionPlanId { get; set; }
        public virtual ProductionPlan? ProductionPlan { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}

