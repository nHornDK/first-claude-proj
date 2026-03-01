using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Dendo.DataContext.Data;

// Used by `dotnet ef` tooling at design time (migrations, scaffolding).
// At runtime the connection string comes from configuration / environment variables.
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Prefer the environment variable (ASP.NET Core double-underscore convention).
        // Fall back to a local dev default so `dotnet ef` works without extra setup.
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=FirstClaudeDb;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
