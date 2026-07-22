using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("FinishedGoodsHandovers")]
    public class FinishedGoodsHandover
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string SourceFactoryLine { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string AcceptedBy { get; set; } = string.Empty;
        public string Status { get; set; } = "Accepted";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}
