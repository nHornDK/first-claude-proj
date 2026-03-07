import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchItems, createItem, updateItem, deleteItem } from '../../api';
import type { Item } from '../../types';
import type { RootState } from '../index';

interface ItemsState {
  items: Item[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ItemsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchItemsThunk = createAsyncThunk<Item[], void, { state: RootState }>(
  'items/fetchAll',
  async (_, { getState }) => {
    const token = getState().auth.token!;
    return fetchItems(token);
  }
);

export const createItemThunk = createAsyncThunk<Item, { name: string; description: string }, { state: RootState }>(
  'items/create',
  async ({ name, description }, { getState }) => {
    const token = getState().auth.token!;
    return createItem(token, name, description);
  }
);

export const updateItemThunk = createAsyncThunk<
  { id: number; name: string; description: string },
  { id: number; name: string; description: string },
  { state: RootState }
>(
  'items/update',
  async ({ id, name, description }, { getState }) => {
    const token = getState().auth.token!;
    await updateItem(token, id, name, description);
    return { id, name, description };
  }
);

export const deleteItemThunk = createAsyncThunk<number, number, { state: RootState }>(
  'items/delete',
  async (id, { getState }) => {
    const token = getState().auth.token!;
    await deleteItem(token, id);
    return id;
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemsThunk.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchItemsThunk.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload; })
      .addCase(fetchItemsThunk.rejected, (state) => { state.status = 'failed'; state.error = 'Failed to load items.'; })

      .addCase(createItemThunk.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(createItemThunk.rejected, (state) => { state.error = 'Failed to create item.'; })

      .addCase(updateItemThunk.fulfilled, (state, action) => {
        const { id, name, description } = action.payload;
        const item = state.items.find(i => i.id === id);
        if (item) { item.name = name; item.description = description; }
      })
      .addCase(updateItemThunk.rejected, (state) => { state.error = 'Failed to save item.'; })

      .addCase(deleteItemThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(deleteItemThunk.rejected, (state) => { state.error = 'Failed to delete item.'; });
  },
});

export const { clearError } = itemsSlice.actions;
export default itemsSlice.reducer;
