using backend.Dto.OrderItemMaterial;
using backend.Dto.OrderItemSize;
using backend.Dto.Product;
using System.ComponentModel.DataAnnotations.Schema;


namespace backend.Dto.OrderItem;

public class OrderItemGetDto
{
    public Guid Id { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public Guid ProductId { get; set; }

    public decimal TotalPrice { get; set; }

    public decimal Discount { get; set; }

    public Guid OrderId { get; set; }

    public OrderProductGetDto? Product { get; set; }

    [NotMapped]
    public List<OrderItemSizeGetDto> OrderItemSizes { get; set; } = new();

    [NotMapped]
    public List<OrderItemMaterialGetDto> OrderItemMaterials { get; set; } = new();
}
