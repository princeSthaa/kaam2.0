using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/dev")]
public class DevController : ControllerBase
{
    private readonly AppDbContext _context;

    public DevController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("run-sql")]
    public IActionResult RunSql()
    {
        SqlScriptRunner.Run(_context);

        return Ok("All SQL scripts executed successfully.   ");
    }

    [HttpPost("seed")]
    public IActionResult Seed()
    {
        DatabaseSeeder.Seed(_context);

        return Ok("Database seeded successfully.");
    }
}