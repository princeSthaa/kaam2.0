using System.Security.Claims;
using backend.Data;
using backend.Dto.Authenticate;
using backend.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Service.Authenticate;

public class AuthenticateService : IAuthenticateService
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher<backend.Model.Employee> _passwordHasher = new();

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

        var employee = await _context.Employees
            .Include(x => x.EmployeeRole)
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (employee == null)
            return null;

        if (!employee.IsActive)
            return null;

        if (!VerifyPassword(employee, dto.Password))
            return null;

        if (!employee.Password.StartsWith("AQAAAA", StringComparison.Ordinal))
        {
            employee.Password = _passwordHasher.HashPassword(employee, dto.Password);
            employee.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier, employee.Id.ToString()
            ),

            new Claim( ClaimTypes.Name, $"{employee.FirstName} {employee.LastName}"
            ),

            new Claim(ClaimTypes.Email, employee.Email),
            new Claim(ClaimTypes.Role, employee.EmployeeRole?.RoleName ?? string.Empty),
            new Claim("role_id", employee.EmployeeRoleId.ToString()),
            new Claim("is_super_admin", (employee.EmployeeRole?.IsSuperAdmin == true).ToString().ToLowerInvariant())
        };

        var identity = new ClaimsIdentity(
            claims,
            "Password"
        );

        return new ClaimsPrincipal(identity);
    }

    public async Task<bool> ChangePasswordAsync(Guid employeeId, string currentPassword, string newPassword)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(x => x.Id == employeeId && x.IsActive);
        if (employee is null || !VerifyPassword(employee, currentPassword)) return false;
        employee.Password = _passwordHasher.HashPassword(employee, newPassword);
        employee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private bool VerifyPassword(backend.Model.Employee employee, string password)
    {
        if (employee.Password.StartsWith("AQAAAA", StringComparison.Ordinal))
            return _passwordHasher.VerifyHashedPassword(employee, employee.Password, password) != PasswordVerificationResult.Failed;
        return string.Equals(employee.Password, password, StringComparison.Ordinal);
    }
}
