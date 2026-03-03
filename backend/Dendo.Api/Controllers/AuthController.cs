using Microsoft.AspNetCore.Mvc;
using Dendo.DataContext.Models;
using Dendo.DataContext.Repositories;
using Dendo.Api.Services;

namespace Dendo.Api.Controllers;

public record LoginRequest(string Username, string Password);
public record RegisterRequest(string Username, string Password);

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

    [HttpPost("register")]
    public async Task<ActionResult<string>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Username and password are required." });

        var existing = await users.FindByUsernameAsync(request.Username);
        if (existing is not null)
            return Conflict(new { error = "Username is already taken." });

        var user = new UserEntity { Username = request.Username };
        UserRepository.SetPassword(user, request.Password);
        await users.CreateAsync(user);

        return Ok(new { token = tokenService.Generate(user.Username) });
    }
}
