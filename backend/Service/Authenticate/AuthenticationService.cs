using System.Security.Claims;
using backend.Data;
using backend.Dto.Authenticate;
using Microsoft.EntityFrameworkCore;

namespace backend.Service.Authenticate;

public class AuthenticateService : IAuthenticateService
{
    private readonly AppDbContext _context;

    public AuthenticateService(AppDbContext context)
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

        var employee = (await _context.Database
            .SqlQuery<EmployeeAuthenticationDto>($@"
                    EXEC sp_GetEmployees
                        @Email = {dto.Email}
                ")
            .ToListAsync()).FirstOrDefault();

        if (employee == null)
            return null;

        if (!employee.IsActive)
            return null;

        if (employee.Password != dto.Password)
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