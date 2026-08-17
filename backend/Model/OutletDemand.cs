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
        [Key]
        public Guid Id { get; set; }
        public string DemandNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid OutletId { get; set; }
        public virtual Outlet Outlet { get; set; } = null!;
        // </crudgen:properties>
    }
}

