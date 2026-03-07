import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../../api';
import type { CalendarEvent } from '../../types';
import type { RootState } from '../index';

interface EventsState {
  events: CalendarEvent[];
  selectedId: number | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  selectedId: null,
  status: 'idle',
  error: null,
};

export const fetchEventsThunk = createAsyncThunk<CalendarEvent[], void, { state: RootState }>(
  'events/fetchAll',
  async (_, { getState }) => {
    const token = getState().auth.token!;
    return fetchEvents(token);
  }
);

export const createEventThunk = createAsyncThunk<CalendarEvent, Omit<CalendarEvent, 'id'>, { state: RootState }>(
  'events/create',
  async (payload, { getState }) => {
    const token = getState().auth.token!;
    return createEvent(token, payload);
  }
);

export const updateEventThunk = createAsyncThunk<
  { id: number; event: Omit<CalendarEvent, 'id'> },
  { id: number; event: Omit<CalendarEvent, 'id'> },
  { state: RootState }
>(
  'events/update',
  async ({ id, event }, { getState }) => {
    const token = getState().auth.token!;
    await updateEvent(token, id, event);
    return { id, event };
  }
);

export const deleteEventThunk = createAsyncThunk<number, number, { state: RootState }>(
  'events/delete',
  async (id, { getState }) => {
    const token = getState().auth.token!;
    await deleteEvent(token, id);
    return id;
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedId(state, action: PayloadAction<number | null>) { state.selectedId = action.payload; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsThunk.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchEventsThunk.fulfilled, (state, action) => { state.status = 'idle'; state.events = action.payload; })
      .addCase(fetchEventsThunk.rejected, (state) => { state.status = 'failed'; state.error = 'Failed to load events.'; })

      .addCase(createEventThunk.fulfilled, (state, action) => { state.events.push(action.payload); })
      .addCase(createEventThunk.rejected, (state) => { state.error = 'Failed to save event.'; })

      .addCase(updateEventThunk.fulfilled, (state, action) => {
        const { id, event } = action.payload;
        const idx = state.events.findIndex(e => e.id === id);
        if (idx !== -1) state.events[idx] = { id, ...event };
      })
      .addCase(updateEventThunk.rejected, (state) => { state.error = 'Failed to save event.'; })

      .addCase(deleteEventThunk.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e.id !== action.payload);
        if (state.selectedId === action.payload) state.selectedId = null;
      })
      .addCase(deleteEventThunk.rejected, (state) => { state.error = 'Failed to delete event.'; });
  },
});

export const { setSelectedId, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
