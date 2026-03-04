namespace Dendo.DataContext.Models;

public class EventEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Color { get; set; } = "#bbdefb";
    public int UserId { get; set; }
    public UserEntity User { get; set; } = null!;
}
