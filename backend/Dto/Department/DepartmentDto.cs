using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Department
{
    public class DepartmentDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(10)]
        public string DepartmentCode { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
