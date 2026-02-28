using Api.Controllers;
using Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

public class AuthControllerTests
{
    private readonly AuthController _sut;

    public AuthControllerTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "super_secret_test_key_that_is_long_enough_32chars",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience",
                ["DemoUser:Username"] = "admin",
                ["DemoUser:Password"] = "password123"
            })
            .Build();

        _sut = new AuthController(new TokenService(config), config);
    }

    [Fact]
    public void Login_ValidCredentials_ReturnsOkWithToken()
    {
        var result = _sut.Login(new LoginRequest("admin", "password123"));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public void Login_WrongPassword_ReturnsUnauthorized()
    {
        var result = _sut.Login(new LoginRequest("admin", "wrong"));

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public void Login_WrongUsername_ReturnsUnauthorized()
    {
        var result = _sut.Login(new LoginRequest("unknown", "password123"));

        Assert.IsType<UnauthorizedResult>(result.Result);
    }
}
