using System.ComponentModel.DataAnnotations;

namespace backend.Dto.Authenticate;

public sealed class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(4)]
    public string NewPassword { get; set; } = string.Empty;
}
