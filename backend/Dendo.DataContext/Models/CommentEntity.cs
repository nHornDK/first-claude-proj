namespace Dendo.DataContext.Models;

public class CommentEntity
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public PostEntity Post { get; set; } = null!;
    public int UserId { get; set; }
    public UserEntity User { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
