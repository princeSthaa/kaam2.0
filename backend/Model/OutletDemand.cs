using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Model
{
    [Table("OutletDemands")]
    public class OutletDemand
    {
        // <crudgen:properties>
        public string Id { get; set; } = string.Empty;
        public string DemandNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public string OutletId { get; set; }
        public virtual Outlet Outlet { get; set; } = null!;
        // </crudgen:properties>
    }
}

