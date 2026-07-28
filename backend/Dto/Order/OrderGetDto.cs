using backend.Model.Enums;
using backend.Dto.OrderItem;

namespace backend.Dto.Order;

public class OrderGetDto
{
    public Guid Id { get; set; }

    public string OrderNumber { get; set; } = string.Empty;

    public OrderStatus Status { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime DueDate { get; set; }

    public Guid CustomerId { get; set; }

    public Guid? ProductionPlanId { get; set; }

    public List<OrderItemGetDto> OrderItems { get; set; } = new();


}
