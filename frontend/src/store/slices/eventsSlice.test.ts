import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchEventsThunk, createEventThunk, updateEventThunk, deleteEventThunk,
  setSelectedId,
} from './eventsSlice';
import * as api from '../../api';
import { makeStore } from '../../test-utils';
import type { CalendarEvent } from '../../types';

vi.mock('../../api');

const mockEvent: CalendarEvent = {
  id: 1,
  title: 'Sprint Review',
  description: 'End of sprint',
  startTime: '2025-06-01T10:00:00Z',
  endTime: '2025-06-01T11:00:00Z',
  color: '#bbdefb',
};

function authStore() {
  return makeStore({ auth: { token: 'test-token' } });
}

describe('eventsSlice thunks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchEventsThunk populates the events list', async () => {
    vi.mocked(api.fetchEvents).mockResolvedValue([mockEvent]);
    const store = authStore();
    await store.dispatch(fetchEventsThunk());
    expect(store.getState().events.events).toEqual([mockEvent]);
    expect(store.getState().events.status).toBe('idle');
  });

  it('fetchEventsThunk sets error on failure', async () => {
    vi.mocked(api.fetchEvents).mockRejectedValue(new Error('Network error'));
    const store = authStore();
    await store.dispatch(fetchEventsThunk());
    expect(store.getState().events.status).toBe('failed');
    expect(store.getState().events.error).toBe('Failed to load events.');
  });

  it('createEventThunk appends the new event', async () => {
    vi.mocked(api.fetchEvents).mockResolvedValue([mockEvent]);
    const newEvent: CalendarEvent = { ...mockEvent, id: 2, title: 'Retrospective' };
    vi.mocked(api.createEvent).mockResolvedValue(newEvent);

    const store = authStore();
    await store.dispatch(fetchEventsThunk());
    await store.dispatch(createEventThunk({ title: 'Retrospective', description: null, startTime: mockEvent.startTime, endTime: mockEvent.endTime, color: mockEvent.color }));

    expect(store.getState().events.events).toHaveLength(2);
    expect(store.getState().events.events[1].title).toBe('Retrospective');
  });

  it('updateEventThunk updates the event in state', async () => {
    vi.mocked(api.fetchEvents).mockResolvedValue([mockEvent]);
    vi.mocked(api.updateEvent).mockResolvedValue(undefined);

    const store = authStore();
    await store.dispatch(fetchEventsThunk());
    const updated = { title: 'Updated', description: null, startTime: mockEvent.startTime, endTime: mockEvent.endTime, color: mockEvent.color };
    await store.dispatch(updateEventThunk({ id: 1, event: updated }));

    expect(store.getState().events.events[0].title).toBe('Updated');
  });

  it('deleteEventThunk removes the event and clears selectedId', async () => {
    vi.mocked(api.fetchEvents).mockResolvedValue([mockEvent]);
    vi.mocked(api.deleteEvent).mockResolvedValue(undefined);

    const store = authStore();
    await store.dispatch(fetchEventsThunk());
    store.dispatch(setSelectedId(1));
    await store.dispatch(deleteEventThunk(1));

    expect(store.getState().events.events).toHaveLength(0);
    expect(store.getState().events.selectedId).toBeNull();
  });

  it('setSelectedId updates selectedId in state', () => {
    const store = authStore();
    store.dispatch(setSelectedId(42));
    expect(store.getState().events.selectedId).toBe(42);
    store.dispatch(setSelectedId(null));
    expect(store.getState().events.selectedId).toBeNull();
  });
});
