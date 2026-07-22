using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("CustomerReturns")]
    public class CustomerReturn
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public int ReturnedQuantity { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string ProcessedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}
