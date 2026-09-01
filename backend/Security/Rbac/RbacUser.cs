using System.Security.Claims;
using OpenIddict.Abstractions;

namespace backend.Security.Rbac;

public static class RbacUser
{
    public static Guid? GetEmployeeId(ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(OpenIddictConstants.Claims.Subject)
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
