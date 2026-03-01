using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Dendo.DataContext.Models;

namespace Dendo.Api.Tests.Integration;

public class ItemsIntegrationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private async Task AuthenticateAsync()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { username = "admin", password = "password123" });

        var body = await response.Content.ReadFromJsonAsync<TokenResponse>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!.Token);
    }

    [Fact]
    public async Task GetItems_WithoutToken_Returns401()
    {
        var response = await _client.GetAsync("/api/items");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetItems_WithToken_Returns200()
    {
        await AuthenticateAsync();

        var response = await _client.GetAsync("/api/items");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateItem_WithToken_Returns201AndItem()
    {
        await AuthenticateAsync();

        var response = await _client.PostAsJsonAsync("/api/items",
            new { name = "Test Item", description = "A test" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var item = await response.Content.ReadFromJsonAsync<ItemEntity>();
        Assert.NotNull(item);
        Assert.Equal("Test Item", item.Name);
        Assert.True(item.Id > 0);
    }

    [Fact]
    public async Task FullCrudFlow()
    {
        await AuthenticateAsync();

        var createResponse = await _client.PostAsJsonAsync("/api/items",
            new { name = "CRUD Item", description = "desc" });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<ItemEntity>();

        var getResponse = await _client.GetAsync($"/api/items/{created!.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var updateResponse = await _client.PutAsJsonAsync($"/api/items/{created.Id}",
            new { id = created.Id, name = "Updated", description = "updated desc" });
        Assert.Equal(HttpStatusCode.NoContent, updateResponse.StatusCode);

        var deleteResponse = await _client.DeleteAsync($"/api/items/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var missingResponse = await _client.GetAsync($"/api/items/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missingResponse.StatusCode);
    }

    private record TokenResponse(string Token);
}
