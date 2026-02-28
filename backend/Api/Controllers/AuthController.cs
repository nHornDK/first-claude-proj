using Microsoft.AspNetCore.Mvc;
using Api.Services;

namespace Api.Controllers;

public record LoginRequest(string Username, string Password);

[ApiController]
[Route("api/[controller]")]
public class AuthController(TokenService tokenService, IConfiguration config) : ControllerBase
{
    [HttpPost("login")]
    public ActionResult<string> Login(LoginRequest request)
    {
        // Replace with a real user lookup (e.g. ASP.NET Core Identity)
        var validUser = config["DemoUser:Username"];
        var validPass = config["DemoUser:Password"];

        if (request.Username != validUser || request.Password != validPass)
            return Unauthorized();

        return Ok(new { token = tokenService.Generate(request.Username) });
    }
}
