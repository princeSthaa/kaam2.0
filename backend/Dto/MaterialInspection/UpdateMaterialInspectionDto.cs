using System;
using System.Collections.Generic;

namespace backend.Dto.MaterialInspection
{
    public class UpdateMaterialInspectionDto
    {
        public string? InspectionStatus { get; set; }
        public string? InspectorName { get; set; }
        public string? Notes { get; set; }
        
        public List<UpdateMaterialInspectionItemDto> Items { get; set; } = new();
    }
}
