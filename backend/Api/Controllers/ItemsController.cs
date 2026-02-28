using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Models;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<Item>> GetAll() =>
        await db.Items.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> Get(int id)
    {
        var item = await db.Items.FindAsync(id);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Item>> Create(Item item)
    {
        db.Items.Add(item);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Item item)
    {
        if (id != item.Id) return BadRequest();
        db.Entry(item).State = EntityState.Modified;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.Items.FindAsync(id);
        if (item is null) return NotFound();
        db.Items.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
