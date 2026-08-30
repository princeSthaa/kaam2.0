using System.Security.Claims;
using backend.Data;
using backend.Dto.Authentication;
using Microsoft.EntityFrameworkCore;

namespace backend.Service.Authentication;

public class AuthenticationService : IAuthenticationService
{
    private readonly AppDbContext _context;

    public AuthenticationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ClaimsPrincipal?> AuthenticateAsync(LoginRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return null;
        }

        var employee = await _context.Database
            .SqlQuery<EmployeeAuthenticationDto>($@"
                    EXEC sp_GetEmployees
                        @Email = {dto.Email}
                ")
            .SingleOrDefaultAsync();

        if (employee == null)
            return null;

        if (!employee.IsActive)
            return null;

        if (employee.PasswordHash != dto.Password)
            return null;

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier, employee.Id.ToString()
            ),

            new Claim( ClaimTypes.Name, $"{employee.FirstName} {employee.LastName}"
            ),

            new Claim(ClaimTypes.Email, employee.Email!
            )
        };

        var identity = new ClaimsIdentity(
            claims,
            "Password"
        );

        return new ClaimsPrincipal(identity);
    }
}