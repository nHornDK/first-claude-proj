using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Dendo.DataContext.Data;
using Dendo.DataContext.Models;
using Dendo.DataContext.Repositories;

namespace Dendo.Api.Controllers;

public record CreateEventRequest(string Title, string? Description, DateTime StartTime, DateTime EndTime, string Color);
public record UpdateEventRequest(string Title, string? Description, DateTime StartTime, DateTime EndTime, string Color);

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EventsController(AppDbContext db, IUserRepository users) : ControllerBase
{
    private string CurrentUsername => User.Identity!.Name!;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var events = await db.Events
            .Where(e => e.UserId == user.Id)
            .OrderBy(e => e.StartTime)
            .Select(e => new { e.Id, e.Title, e.Description, e.StartTime, e.EndTime, e.Color })
            .ToListAsync();

        return Ok(events);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEventRequest request)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var ev = new EventEntity
        {
            Title = request.Title,
            Description = request.Description,
            StartTime = DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc),
            EndTime = DateTime.SpecifyKind(request.EndTime, DateTimeKind.Utc),
            Color = request.Color,
            UserId = user.Id
        };

        db.Events.Add(ev);
        await db.SaveChangesAsync();

        return Ok(new { ev.Id, ev.Title, ev.Description, ev.StartTime, ev.EndTime, ev.Color });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateEventRequest request)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == id && e.UserId == user.Id);
        if (ev is null) return NotFound();

        ev.Title = request.Title;
        ev.Description = request.Description;
        ev.StartTime = DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc);
        ev.EndTime = DateTime.SpecifyKind(request.EndTime, DateTimeKind.Utc);
        ev.Color = request.Color;

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == id && e.UserId == user.Id);
        if (ev is null) return NotFound();

        db.Events.Remove(ev);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
