using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto.ProductionStage
{
    public class ProductionStageDto
    {
        public Guid Id { get; set; }

        public string ProductionStageCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public string Description { get; set; } = string.Empty;

        public string Duration { get; set; } = string.Empty;
    }
}
