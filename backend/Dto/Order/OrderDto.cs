using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.OrderItem;
using backend.Model.Enums;

namespace backend.Dto.Order
{
    public class OrderDto
    {
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
        public Guid? ProductionPlanId { get; set; }
        [NotMapped]
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
    }
}


