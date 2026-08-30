using System.Security.Claims;
using backend.Dto.Authenticate;

namespace backend.Service.Authenticate;

public interface IAuthenticateService
{
    Task<ClaimsPrincipal?> AuthenticateAsync(LoginRequestDto dto);
}