using System.Net;
using System.Net.Http.Json;
using Api.Controllers;

namespace Api.Tests.Integration;

public class AuthIntegrationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("admin", "password123"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(body?.Token);
        Assert.NotEmpty(body.Token);
    }

    [Fact]
    public async Task Login_InvalidPassword_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("admin", "wrong"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_InvalidUsername_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("unknown", "password123"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private record TokenResponse(string Token);
}
