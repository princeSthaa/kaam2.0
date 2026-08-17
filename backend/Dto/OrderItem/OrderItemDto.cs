using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Dto.Fabric;
using backend.Dto.OrderItemSize;
using backend.Dto.OrderItemMaterial;

namespace backend.Dto.OrderItem
{
    public class OrderItemDto
    {
        // <crudgen:properties>
        public Guid Id { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public Guid ProductId { get; set; }

        public decimal TotalPrice { get; set; }

        public decimal Discount { get; set; }

        [Required(ErrorMessage = "CreatedAt is required.")]
        public DateTime CreatedAt { get; set; }


        public DateTime UpdatedAt { get; set; }


        public Guid OrderId { get; set; }
        [NotMapped]
        public List<OrderItemSizeDto> OrderItemSizes { get; set; } = new();

        [NotMapped]
        public List<OrderItemMaterialDto> OrderItemMaterials { get; set; } = new();

        // </crudgen:properties>
    }
}
