using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using backend.Model.Enums;

namespace backend.Dto.Supplier
{
    public class SupplierUpdateDto
    {
        public string SupplierCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Supplier name is required.")]
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string ContactEmail { get; set; } = string.Empty;

        public string ContactPhone { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public UserStatus Status { get; set; } = UserStatus.Active;

        public List<Guid> MaterialCategoryIds { get; set; } = new List<Guid>();
    }
}
