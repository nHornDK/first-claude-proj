using System.Security.Cryptography;
using Dendo.DataContext.Data;
using Dendo.DataContext.Models;
using Microsoft.EntityFrameworkCore;

namespace Dendo.DataContext.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<UserEntity?> FindByUsernameAsync(string username) =>
        db.Users.FirstOrDefaultAsync(u => u.Username == username);

    public async Task CreateAsync(UserEntity user)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync();
    }

    public async Task UpdateAsync(UserEntity user)
    {
        db.Users.Update(user);
        await db.SaveChangesAsync();
    }

    public Task<bool> AnyAsync() => db.Users.AnyAsync();

    public static void SetPassword(UserEntity user, string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        user.PasswordSalt = Convert.ToBase64String(salt);
        user.PasswordHash = Convert.ToBase64String(hash);
    }

    public static bool VerifyPassword(UserEntity user, string password)
    {
        var salt = Convert.FromBase64String(user.PasswordSalt);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(hash, Convert.FromBase64String(user.PasswordHash));
    }
}
