namespace backend.Models;

public class Order : BaseEntity
{
    public Guid CustomerId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, InProduction, Completed
    public decimal TotalAmount { get; set; }
    public DateTime DueDate { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public string ProductName { get; set; } = string.Empty;
    public string FabricName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
