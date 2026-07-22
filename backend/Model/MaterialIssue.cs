using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("MaterialIssues")]
    public class MaterialIssue
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public string MaterialId { get; set; } = string.Empty;
        public decimal IssueQuantity { get; set; }
        public string TargetDestination { get; set; } = string.Empty;
        public string IssuedTo { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = "Completed";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
        // </crudgen:properties>
    }
}
