using Dendo.Api.Controllers;
using Dendo.Api.Services;
using Dendo.DataContext.Models;
using Dendo.DataContext.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Dendo.Api.Tests;

public class AuthControllerTests
{
    private readonly AuthController _sut;
    private readonly Mock<IUserRepository> _userRepo = new();

    public AuthControllerTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "super_secret_test_key_that_is_long_enough_32chars",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience",
            })
            .Build();

        _sut = new AuthController(_userRepo.Object, new TokenService(config));
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        var user = new UserEntity { Username = "admin" };
        UserRepository.SetPassword(user, "password123");
        _userRepo.Setup(r => r.FindByUsernameAsync("admin")).ReturnsAsync(user);

        var result = await _sut.Login(new LoginRequest("admin", "password123"));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        var user = new UserEntity { Username = "admin" };
        UserRepository.SetPassword(user, "password123");
        _userRepo.Setup(r => r.FindByUsernameAsync("admin")).ReturnsAsync(user);

        var result = await _sut.Login(new LoginRequest("admin", "wrong"));

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task Login_WrongUsername_ReturnsUnauthorized()
    {
        _userRepo.Setup(r => r.FindByUsernameAsync("unknown")).ReturnsAsync((UserEntity?)null);

        var result = await _sut.Login(new LoginRequest("unknown", "password123"));

        Assert.IsType<UnauthorizedResult>(result.Result);
    }
}
