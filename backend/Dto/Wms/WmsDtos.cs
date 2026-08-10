using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Wms
{
    public class PutAwayDto
    {
        [Required]
        public Guid TargetWarehouseShelfId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Quantity must be greater than zero.")]
        public decimal Quantity { get; set; }
    }

    public class TransferDto
    {
        [Required]
        public Guid TargetWarehouseShelfId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Quantity must be greater than zero.")]
        public decimal Quantity { get; set; }
    }
}
