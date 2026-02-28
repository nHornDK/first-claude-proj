using System.IdentityModel.Tokens.Jwt;
using Api.Services;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

public class TokenServiceTests
{
    private readonly TokenService _sut;

    public TokenServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "super_secret_test_key_that_is_long_enough_32chars",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience"
            })
            .Build();

        _sut = new TokenService(config);
    }

    [Fact]
    public void Generate_ReturnsValidJwt()
    {
        var token = _sut.Generate("testuser");

        var handler = new JwtSecurityTokenHandler();
        Assert.True(handler.CanReadToken(token));
    }

    [Fact]
    public void Generate_TokenContainsUsername()
    {
        var token = _sut.Generate("testuser");

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.Contains(jwt.Claims, c => c.Value == "testuser");
    }

    [Fact]
    public void Generate_TokenHasFutureExpiry()
    {
        var token = _sut.Generate("testuser");

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.True(jwt.ValidTo > DateTime.UtcNow);
    }

    [Fact]
    public void Generate_TokenHasCorrectIssuerAndAudience()
    {
        var token = _sut.Generate("testuser");

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.Equal("test-issuer", jwt.Issuer);
        Assert.Contains("test-audience", jwt.Audiences);
    }
}
