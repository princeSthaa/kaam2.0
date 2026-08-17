using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("ActivityLogs")]
    public class ActivityLog
    {
        // <crudgen:properties>
        [Key]
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string EntityId { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        // </crudgen:properties>
    }
}
