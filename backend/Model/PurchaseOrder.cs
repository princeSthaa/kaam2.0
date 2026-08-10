using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Enums;

namespace backend.Model;

public class PurchaseOrder
{
    [Key]
    public Guid Id { get; set; }

    public string OrderNumber { get; set; } = string.Empty;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [ForeignKey(nameof(SupplierId))]
    public Guid SupplierId { get; set; }
    public virtual Supplier? Supplier { get; set; }

    [ForeignKey(nameof(MaterialCategoryId))]
    public Guid? MaterialCategoryId { get; set; }
    public virtual MaterialCategory? Category { get; set; } 

    public string ShippingMethod { get; set; } = string.Empty;
    
    public string ShippingAddress { get; set; } = string.Empty;

    public string PaymentTerms { get; set; } = string.Empty;
    public DateTime ExpectedDeliveryDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    public virtual ICollection<PurchaseOrderReceipt> Receipts { get; set; } = new List<PurchaseOrderReceipt>();
}