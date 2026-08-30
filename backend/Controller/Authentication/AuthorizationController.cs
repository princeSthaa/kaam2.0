

using backend.Service.Authentication;
using backend.Dto.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controller.Authentication;

[ApiController]
public class AuthorizationController : ControllerBase
{
    private readonly IAuthenticationService _service;
    public AuthorizationController(IAuthenticationService service)
    {
        _service = service;
    }

    [HttpGet("~/connect/authorize")]
    [HttpPost("~/connect/authorize")]
    public IActionResult Authorize()
    {
        return Ok();
    }

    
    
}
