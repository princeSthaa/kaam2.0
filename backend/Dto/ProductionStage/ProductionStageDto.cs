using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.ProductionStage
{
    public class ProductionStageDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public bool isActive { get; set; } = true;
        public string? Description { get; set; }
    }
}
