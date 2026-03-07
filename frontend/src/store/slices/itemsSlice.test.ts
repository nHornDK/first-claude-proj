import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchItemsThunk, createItemThunk, updateItemThunk, deleteItemThunk } from './itemsSlice';
import * as api from '../../api';
import { makeStore } from '../../test-utils';
import type { Item } from '../../types';

vi.mock('../../api');

const mockItems: Item[] = [
  { id: 1, name: 'Alpha', description: 'first', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Beta', description: null, createdAt: '2024-01-02T00:00:00Z' },
];

function authStore() {
  return makeStore({ auth: { token: 'test-token' } });
}

describe('itemsSlice thunks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchItemsThunk populates the items list', async () => {
    vi.mocked(api.fetchItems).mockResolvedValue(mockItems);
    const store = authStore();
    await store.dispatch(fetchItemsThunk());
    expect(store.getState().items.items).toEqual(mockItems);
    expect(store.getState().items.status).toBe('idle');
  });

  it('fetchItemsThunk sets status to failed on error', async () => {
    vi.mocked(api.fetchItems).mockRejectedValue(new Error('Network error'));
    const store = authStore();
    await store.dispatch(fetchItemsThunk());
    expect(store.getState().items.status).toBe('failed');
    expect(store.getState().items.error).toBe('Failed to load items.');
  });

  it('createItemThunk appends the new item', async () => {
    vi.mocked(api.fetchItems).mockResolvedValue(mockItems);
    const newItem: Item = { id: 3, name: 'Gamma', description: 'new', createdAt: '2024-01-03T00:00:00Z' };
    vi.mocked(api.createItem).mockResolvedValue(newItem);

    const store = authStore();
    await store.dispatch(fetchItemsThunk());
    await store.dispatch(createItemThunk({ name: 'Gamma', description: 'new' }));

    const items = store.getState().items.items;
    expect(items).toHaveLength(3);
    expect(items[2]).toEqual(newItem);
    expect(api.createItem).toHaveBeenCalledWith('test-token', 'Gamma', 'new');
  });

  it('updateItemThunk updates the item in state', async () => {
    vi.mocked(api.fetchItems).mockResolvedValue(mockItems);
    vi.mocked(api.updateItem).mockResolvedValue(undefined);

    const store = authStore();
    await store.dispatch(fetchItemsThunk());
    await store.dispatch(updateItemThunk({ id: 1, name: 'Alpha Updated', description: 'changed' }));

    const item = store.getState().items.items.find(i => i.id === 1);
    expect(item?.name).toBe('Alpha Updated');
    expect(item?.description).toBe('changed');
  });

  it('deleteItemThunk removes the item from state', async () => {
    vi.mocked(api.fetchItems).mockResolvedValue(mockItems);
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);

    const store = authStore();
    await store.dispatch(fetchItemsThunk());
    await store.dispatch(deleteItemThunk(1));

    const items = store.getState().items.items;
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(2);
    expect(api.deleteItem).toHaveBeenCalledWith('test-token', 1);
  });
});
