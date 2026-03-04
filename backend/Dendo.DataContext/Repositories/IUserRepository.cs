using Dendo.DataContext.Models;

namespace Dendo.DataContext.Repositories;

public interface IUserRepository
{
    Task<UserEntity?> FindByUsernameAsync(string username);
    Task<List<UserEntity>> GetAllAsync();
    Task CreateAsync(UserEntity user);
    Task UpdateAsync(UserEntity user);
    Task<bool> AnyAsync();
}
