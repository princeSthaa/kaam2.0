using System.Security.Claims;
using backend.Dto.Authentication;

namespace backend.Service.Authentication;

public interface IAuthenticationService
{
    Task<ClaimsPrincipal?> AuthenticateAsync(LoginRequestDto dto);
}