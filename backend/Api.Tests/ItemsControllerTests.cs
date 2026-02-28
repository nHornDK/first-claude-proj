using Api.Controllers;
using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Tests;

public class ItemsControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ItemsController _sut;

    public ItemsControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(options);
        _sut = new ItemsController(_db);
    }

    [Fact]
    public async Task GetAll_EmptyDb_ReturnsEmpty()
    {
        var result = await _sut.GetAll();

        Assert.Empty(result);
    }

    [Fact]
    public async Task Create_ValidItem_ReturnsCreatedWithId()
    {
        var item = new Item { Name = "Test Item", Description = "Desc" };

        var result = await _sut.Create(item);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returned = Assert.IsType<Item>(created.Value);
        Assert.True(returned.Id > 0);
    }

    [Fact]
    public async Task GetAll_AfterCreate_ReturnsItem()
    {
        await _sut.Create(new Item { Name = "Test Item" });

        var result = await _sut.GetAll();

        Assert.Single(result);
        Assert.Equal("Test Item", result.First().Name);
    }

    [Fact]
    public async Task Get_ExistingId_ReturnsItem()
    {
        var created = (CreatedAtActionResult)(await _sut.Create(new Item { Name = "Test" })).Result!;
        var id = ((Item)created.Value!).Id;

        var result = await _sut.Get(id);

        Assert.Equal("Test", result.Value!.Name);
    }

    [Fact]
    public async Task Get_NonExistentId_ReturnsNotFound()
    {
        var result = await _sut.Get(999);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Delete_ExistingItem_RemovesFromDb()
    {
        var created = (CreatedAtActionResult)(await _sut.Create(new Item { Name = "Test" })).Result!;
        var id = ((Item)created.Value!).Id;

        await _sut.Delete(id);

        Assert.Equal(0, await _db.Items.CountAsync());
    }

    [Fact]
    public async Task Delete_NonExistentId_ReturnsNotFound()
    {
        var result = await _sut.Delete(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Update_ValidItem_ReturnsNoContent()
    {
        var created = (CreatedAtActionResult)(await _sut.Create(new Item { Name = "Original" })).Result!;
        var id = ((Item)created.Value!).Id;

        var result = await _sut.Update(id, new Item { Id = id, Name = "Updated", Description = "New desc" });

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Update_PersistsChanges()
    {
        var created = (CreatedAtActionResult)(await _sut.Create(new Item { Name = "Original" })).Result!;
        var id = ((Item)created.Value!).Id;

        await _sut.Update(id, new Item { Id = id, Name = "Updated", Description = "New desc" });

        _db.ChangeTracker.Clear();
        var updated = await _db.Items.FindAsync(id);
        Assert.Equal("Updated", updated!.Name);
        Assert.Equal("New desc", updated.Description);
    }

    [Fact]
    public async Task Update_DoesNotChangeCreatedAt()
    {
        var created = (CreatedAtActionResult)(await _sut.Create(new Item { Name = "Original" })).Result!;
        var item = (Item)created.Value!;
        var originalCreatedAt = item.CreatedAt;

        await _sut.Update(item.Id, new Item { Id = item.Id, Name = "Updated", CreatedAt = DateTime.UtcNow.AddYears(1) });

        _db.ChangeTracker.Clear();
        var updated = await _db.Items.FindAsync(item.Id);
        Assert.Equal(originalCreatedAt, updated!.CreatedAt);
    }

    [Fact]
    public async Task Update_NonExistentId_ReturnsNotFound()
    {
        var result = await _sut.Update(999, new Item { Id = 999, Name = "X" });

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Update_MismatchedId_ReturnsBadRequest()
    {
        var result = await _sut.Update(1, new Item { Id = 99, Name = "X" });

        Assert.IsType<BadRequestResult>(result);
    }

    public void Dispose() => _db.Dispose();
}
