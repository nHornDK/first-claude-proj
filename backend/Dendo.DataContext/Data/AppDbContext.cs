using Microsoft.EntityFrameworkCore;
using Dendo.DataContext.Models;

namespace Dendo.DataContext.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ItemEntity> Items => Set<ItemEntity>();
    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<EventEntity> Events => Set<EventEntity>();
    public DbSet<PostEntity> Posts => Set<PostEntity>();
    public DbSet<CommentEntity> Comments => Set<CommentEntity>();
}
