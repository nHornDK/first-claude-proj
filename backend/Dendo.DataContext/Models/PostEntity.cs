namespace Dendo.DataContext.Models;

public class PostEntity
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public EventEntity Event { get; set; } = null!;
    public int UserId { get; set; }
    public UserEntity User { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public string? ImageData { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<CommentEntity> Comments { get; set; } = [];
}
