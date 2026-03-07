import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventsPage from './EventsPage';
import * as api from '../api';
import { renderWithStore, withAuth } from '../test-utils';
import type { CalendarEvent } from '../types';

vi.mock('../api');

const pad = (n: number) => String(n).padStart(2, '0');
const now = new Date();

// Future event guaranteed to appear in the "Upcoming" list
const future = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const futureDate = `${future.getUTCFullYear()}-${pad(future.getUTCMonth() + 1)}-${pad(future.getUTCDate())}`;
const futureHH = pad(future.getUTCHours());
const futureMM = pad(future.getUTCMinutes());
const futureEndHH = pad(Math.min(future.getUTCHours() + 1, 23));

const mockUpcomingEvent: CalendarEvent = {
  id: 1,
  title: 'Team Meeting',
  description: 'Weekly sync',
  startTime: `${futureDate}T${futureHH}:${futureMM}:00Z`,
  endTime: `${futureDate}T${futureEndHH}:${futureMM}:00Z`,
  color: '#bbdefb',
};

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchEvents).mockResolvedValue([mockUpcomingEvent]);
    vi.mocked(api.fetchPosts).mockResolvedValue([]);
  });

  it('renders the Events heading and Add Event button', async () => {
    renderWithStore(<EventsPage />, withAuth);
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
  });

  it('shows upcoming events in the list after loading', async () => {
    renderWithStore(<EventsPage />, withAuth);
    await waitFor(() => expect(screen.getByText('Team Meeting')).toBeInTheDocument());
    expect(screen.getByText('Upcoming events')).toBeInTheDocument();
  });

  it('shows empty upcoming list when there are no events', async () => {
    vi.mocked(api.fetchEvents).mockResolvedValue([]);
    renderWithStore(<EventsPage />, withAuth);
    await waitFor(() => expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument());
  });

  it('selects an event and shows its detail view', async () => {
    renderWithStore(<EventsPage />, withAuth);
    await waitFor(() => screen.getByText('Team Meeting'));

    await userEvent.click(screen.getByText('Team Meeting'));

    await waitFor(() => expect(screen.getByText('Weekly sync')).toBeInTheDocument());
    expect(api.fetchPosts).toHaveBeenCalledWith('test-token', 1);
  });

  it('opens the create dialog when Add Event is clicked', async () => {
    renderWithStore(<EventsPage />, withAuth);
    await userEvent.click(screen.getByRole('button', { name: /add event/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New Event')).toBeInTheDocument();
  });

  it('creates a new event and adds it to the list', async () => {
    const newEvent: CalendarEvent = {
      id: 2,
      title: 'New Conference',
      description: null,
      startTime: `${futureDate}T${futureHH}:${futureMM}:00Z`,
      endTime: `${futureDate}T${futureEndHH}:${futureMM}:00Z`,
      color: '#bbdefb',
    };
    vi.mocked(api.createEvent).mockResolvedValue(newEvent);
    renderWithStore(<EventsPage />, withAuth);
    await waitFor(() => screen.getByText('Team Meeting'));

    await userEvent.click(screen.getByRole('button', { name: /add event/i }));
    await userEvent.type(screen.getByLabelText(/title/i), 'New Conference');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() =>
      expect(api.createEvent).toHaveBeenCalledWith('test-token', expect.objectContaining({ title: 'New Conference' }))
    );
  }, 15000);

  it('opens edit dialog from event detail view', async () => {
    renderWithStore(<EventsPage />, withAuth);
    await waitFor(() => screen.getByText('Team Meeting'));

    await userEvent.click(screen.getByText('Team Meeting'));
    await waitFor(() => screen.getByRole('button', { name: /edit/i }));

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Team Meeting')).toBeInTheDocument();
  });

  it('deletes an event from the detail view', async () => {
    vi.mocked(api.deleteEvent).mockResolvedValue(undefined);
    renderWithStore(<EventsPage />, withAuth);
    await waitFor(() => screen.getByText('Team Meeting'));

    await userEvent.click(screen.getByText('Team Meeting'));
    await waitFor(() => screen.getByRole('button', { name: /delete/i }));

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(screen.queryByText('Team Meeting')).not.toBeInTheDocument());
    expect(api.deleteEvent).toHaveBeenCalledWith('test-token', 1);
  });

  it('shows an error when fetchEvents fails', async () => {
    vi.mocked(api.fetchEvents).mockRejectedValue(new Error('Network error'));
    renderWithStore(<EventsPage />, withAuth);
    await waitFor(() => expect(screen.getByText(/failed to load events/i)).toBeInTheDocument());
  });
});
