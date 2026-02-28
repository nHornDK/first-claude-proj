using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Api.Models;

namespace Api.Tests.Integration;

public class EditItemIntegrationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<Item> CreateAuthenticatedItemAsync(string name = "Original", string description = "desc")
    {
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login",
            new { username = "admin", password = "password123" });
        var body = await loginResponse.Content.ReadFromJsonAsync<TokenResponse>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!.Token);

        var createResponse = await _client.PostAsJsonAsync("/api/items",
            new { name, description });
        return (await createResponse.Content.ReadFromJsonAsync<Item>())!;
    }

    [Fact]
    public async Task UpdateItem_WithoutToken_Returns401()
    {
        var response = await _client.PutAsJsonAsync("/api/items/1",
            new { id = 1, name = "X", description = "" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateItem_ValidRequest_Returns204()
    {
        var item = await CreateAuthenticatedItemAsync();

        var response = await _client.PutAsJsonAsync($"/api/items/{item.Id}",
            new { id = item.Id, name = "Updated Name", description = "Updated desc" });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task UpdateItem_PersistsNewValues()
    {
        var item = await CreateAuthenticatedItemAsync("Before", "old desc");

        await _client.PutAsJsonAsync($"/api/items/{item.Id}",
            new { id = item.Id, name = "After", description = "new desc" });

        var getResponse = await _client.GetAsync($"/api/items/{item.Id}");
        var updated = await getResponse.Content.ReadFromJsonAsync<Item>();

        Assert.Equal("After", updated!.Name);
        Assert.Equal("new desc", updated.Description);
    }

    [Fact]
    public async Task UpdateItem_MismatchedId_Returns400()
    {
        var item = await CreateAuthenticatedItemAsync();

        var response = await _client.PutAsJsonAsync($"/api/items/{item.Id}",
            new { id = item.Id + 99, name = "X", description = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateItem_DoesNotChangeCreatedAt()
    {
        var item = await CreateAuthenticatedItemAsync();

        await _client.PutAsJsonAsync($"/api/items/{item.Id}",
            new { id = item.Id, name = "Changed", description = "", createdAt = DateTime.UtcNow.AddYears(1) });

        var getResponse = await _client.GetAsync($"/api/items/{item.Id}");
        var updated = await getResponse.Content.ReadFromJsonAsync<Item>();

        Assert.Equal(item.CreatedAt, updated!.CreatedAt);
    }

    private record TokenResponse(string Token);
}
