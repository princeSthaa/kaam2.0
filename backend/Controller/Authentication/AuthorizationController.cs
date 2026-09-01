using backend.Service.Authenticate;
using backend.Dto.Authenticate;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;

using System.Security.Claims;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;
using Microsoft.AspNetCore;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Server.AspNetCore;
using OpenIddict.Validation.AspNetCore;
using backend.Security.Rbac;
using backend.Service.Rbac;


namespace backend.Controller.Authentication;

[ApiController]
[Route("api/auth")]
public class AuthorizationController : ControllerBase
{
    private readonly IAuthenticateService _service;
    private readonly IRbacService _rbac;
    public AuthorizationController(IAuthenticateService service, IRbacService rbac)
    {
        _service = service;
        _rbac = rbac;
    }

    [HttpGet("~/connect/authorize")]
    [HttpPost("~/connect/authorize")]
    [AllowAnonymous]
    public async Task<IActionResult> Authorize()
    {   
        var request = HttpContext.GetOpenIddictServerRequest();

        if(request == null)
            throw new InvalidOperationException("The OpenIddict authorization requrest cannot be retrived");
        
        var result = await HttpContext.AuthenticateAsync(
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        if(!result.Succeeded)
        {
            // Later we will redirect to the Next.js login page.
            var returnUrl = Request.GetEncodedUrl();
            return Redirect(
                $"http://localhost:3000/login?returnUrl={Uri.EscapeDataString(returnUrl)}"
            );
            // return Unauthorized("User is not authenticated.");
        }

        var principle = result.Principal;
        
        //Make sure that authenticated user has a subject identifier.
        var userId = principle?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if(string.IsNullOrEmpty(userId))
        {
            return Unauthorized("Authenticatied user doesn't have a user Id");
        }

        var identity = new ClaimsIdentity(
            TokenValidationParameters.DefaultAuthenticationType,
            Claims.Name,
            Claims.Role
        );

        identity.SetClaim(Claims.Subject, userId);
        var name = principle?.FindFirst(ClaimTypes.Name)?.Value;
        var email = principle?.FindFirst(ClaimTypes.Email)?.Value;

        if (!string.IsNullOrEmpty(name))
            identity.SetClaim(Claims.Name, name);

        if (!string.IsNullOrEmpty(email))
            identity.SetClaim(Claims.Email, email);

        var role = principle?.FindFirst(ClaimTypes.Role)?.Value;
        if (!string.IsNullOrEmpty(role)) identity.SetClaim(Claims.Role, role);
        foreach (var claimName in new[] { "role_id", "is_super_admin" })
        {
            var value = principle?.FindFirst(claimName)?.Value;
            if (!string.IsNullOrEmpty(value)) identity.SetClaim(claimName, value);
        }

        var openIddictPrincipal = new ClaimsPrincipal(identity);
        // Tell OpenIddict which scopes are allowed.
        openIddictPrincipal.SetScopes(
            request.GetScopes()
        );
        // Tell OpenIddict which resources the access token is intended for.
        openIddictPrincipal.SetResources("api");

        return SignIn(
            openIddictPrincipal,
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme
        );
    }


    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto dto)
    {
        var principal = await _service.AuthenticateAsync(dto);

        if (principal == null)
            return Unauthorized();
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal
        );
        return Ok(new
        {
            Message = "Authentication successful",
            // UserId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
            // Name = principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value,
            // Email = principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
        });
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { Message = "Signed out" });
    }

    [Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var employeeId = RbacUser.GetEmployeeId(User);
        if (employeeId is null) return Unauthorized();
        var profile = await _rbac.GetProfileAsync(employeeId.Value);
        return profile is null ? Unauthorized() : Ok(profile);
    }

    [Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var employeeId = RbacUser.GetEmployeeId(User);
        if (employeeId is null) return Unauthorized();
        return await _service.ChangePasswordAsync(employeeId.Value, dto.CurrentPassword, dto.NewPassword)
            ? NoContent()
            : BadRequest(new { message = "The current password is incorrect." });
    }
    
    
}
