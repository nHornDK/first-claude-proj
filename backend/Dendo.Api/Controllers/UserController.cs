using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dendo.DataContext.Repositories;

namespace Dendo.Api.Controllers;

public record UserProfileResponse(int Id, string Username, string? Email, string? DisplayName);
public record UpdateProfileRequest(string? Email, string? DisplayName);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

[Authorize]
[ApiController]
[Route("api/user")]
public class UserController(IUserRepository users) : ControllerBase
{
    private string CurrentUsername => User.Identity!.Name!;

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetMe()
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return NotFound();
        return Ok(new UserProfileResponse(user.Id, user.Username, user.Email, user.DisplayName));
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(UpdateProfileRequest request)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return NotFound();
        user.Email = request.Email;
        user.DisplayName = request.DisplayName;
        await users.UpdateAsync(user);
        return NoContent();
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return NotFound();
        if (!UserRepository.VerifyPassword(user, request.CurrentPassword))
            return BadRequest(new { error = "Current password is incorrect." });
        UserRepository.SetPassword(user, request.NewPassword);
        await users.UpdateAsync(user);
        return NoContent();
    }
}
