using Microsoft.AspNetCore.Mvc;
using Dendo.DataContext.Repositories;
using Dendo.Api.Services;

namespace Dendo.Api.Controllers;

public record LoginRequest(string Username, string Password);

[ApiController]
[Route("api/[controller]")]
public class AuthController(IUserRepository users, TokenService tokenService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<string>> Login(LoginRequest request)
    {
        var user = await users.FindByUsernameAsync(request.Username);
        if (user is null || !UserRepository.VerifyPassword(user, request.Password))
            return Unauthorized();

        return Ok(new { token = tokenService.Generate(user.Username) });
    }
}
