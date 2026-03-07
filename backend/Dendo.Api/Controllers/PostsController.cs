using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Dendo.DataContext.Data;
using Dendo.DataContext.Models;
using Dendo.DataContext.Repositories;

namespace Dendo.Api.Controllers;

public record CreatePostRequest(string Content, string? ImageData);
public record CreateCommentRequest(string Content);

[Authorize]
[ApiController]
[Route("api/events/{eventId}/posts")]
public class PostsController(AppDbContext db, IUserRepository users) : ControllerBase
{
    private string CurrentUsername => User.Identity!.Name!;

    [HttpGet]
    public async Task<IActionResult> GetAll(int eventId)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == eventId && e.UserId == user.Id);
        if (ev is null) return NotFound();

        var posts = await db.Posts
            .Where(p => p.EventId == eventId)
            .Include(p => p.User)
            .Include(p => p.Comments).ThenInclude(c => c.User)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Content,
                p.ImageData,
                p.CreatedAt,
                Author = p.User.DisplayName ?? p.User.Username,
                IsOwn = p.UserId == user.Id,
                Comments = p.Comments
                    .OrderBy(c => c.CreatedAt)
                    .Select(c => new
                    {
                        c.Id,
                        c.Content,
                        c.CreatedAt,
                        Author = c.User.DisplayName ?? c.User.Username,
                        IsOwn = c.UserId == user.Id,
                    })
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpPost]
    public async Task<IActionResult> Create(int eventId, CreatePostRequest request)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == eventId && e.UserId == user.Id);
        if (ev is null) return NotFound();

        var post = new PostEntity
        {
            EventId = eventId,
            UserId = user.Id,
            Content = request.Content,
            ImageData = request.ImageData,
            CreatedAt = DateTime.UtcNow,
        };

        db.Posts.Add(post);
        await db.SaveChangesAsync();

        return Ok(new
        {
            post.Id,
            post.Content,
            post.ImageData,
            post.CreatedAt,
            Author = user.DisplayName ?? user.Username,
            IsOwn = true,
            Comments = Array.Empty<object>(),
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int eventId, int id)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == id && p.EventId == eventId && p.UserId == user.Id);
        if (post is null) return NotFound();

        db.Posts.Remove(post);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{postId}/comments")]
    public async Task<IActionResult> AddComment(int eventId, int postId, CreateCommentRequest request)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == postId && p.EventId == eventId);
        if (post is null) return NotFound();

        var comment = new CommentEntity
        {
            PostId = postId,
            UserId = user.Id,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
        };

        db.Comments.Add(comment);
        await db.SaveChangesAsync();

        return Ok(new
        {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            Author = user.DisplayName ?? user.Username,
            IsOwn = true,
        });
    }

    [HttpDelete("{postId}/comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(int eventId, int postId, int commentId)
    {
        var user = await users.FindByUsernameAsync(CurrentUsername);
        if (user is null) return Unauthorized();

        var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.PostId == postId && c.UserId == user.Id);
        if (comment is null) return NotFound();

        db.Comments.Remove(comment);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
