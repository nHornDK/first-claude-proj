import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventsPage from './EventsPage';
import * as api from '../api';
import type { CalendarEvent } from '../types';

vi.mock('../api');

const TOKEN = 'test-token';

const pad = (n: number) => String(n).padStart(2, '0');
const now = new Date();

// Use the 1st of the current month at 00:00 UTC — always in the past, always in
// the current month's calendar view, and never shown in the upcoming panel.
const firstOfMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;

// Future event 2 hours from now — guaranteed to pass the upcoming filter
const future = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const futureDate = `${future.getUTCFullYear()}-${pad(future.getUTCMonth() + 1)}-${pad(future.getUTCDate())}`;
const futureHH = pad(future.getUTCHours());
const futureMM = pad(future.getUTCMinutes());
const futureEndHH = pad(Math.min(future.getUTCHours() + 1, 23));

const mockCalendarEvent: CalendarEvent = {
  id: 1,
  title: 'Team Meeting',
  description: 'Weekly sync',
  startTime: `${firstOfMonth}T00:00:00Z`,
  endTime: `${firstOfMonth}T01:00:00Z`,
  color: '#bbdefb',
};

const mockUpcomingEvent: CalendarEvent = {
  id: 2,
  title: 'Upcoming Meeting',
  description: null,
  startTime: `${futureDate}T${futureHH}:${futureMM}:00Z`,
  endTime: `${futureDate}T${futureEndHH}:${futureMM}:00Z`,
  color: '#c8e6c9',
};

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchEvents).mockResolvedValue([mockCalendarEvent]);
  });

  it('renders the Calendar heading and Add Event button', () => {
    render(<EventsPage token={TOKEN} />);
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
  });

  it('shows events on the calendar after loading', async () => {
    render(<EventsPage token={TOKEN} />);
    await waitFor(() => expect(screen.getAllByText('Team Meeting').length).toBeGreaterThan(0));
  });

  it('shows upcoming events within the next 7 days', async () => {
    vi.mocked(api.fetchEvents).mockResolvedValue([mockUpcomingEvent]);
    render(<EventsPage token={TOKEN} />);
    await waitFor(() => expect(screen.getByText('Upcoming events')).toBeInTheDocument());
    expect(screen.getAllByText('Upcoming Meeting').length).toBeGreaterThan(0);
  });

  it('opens create dialog when Add Event is clicked', async () => {
    render(<EventsPage token={TOKEN} />);
    await userEvent.click(screen.getByRole('button', { name: /add event/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New Event')).toBeInTheDocument();
  });

  it('creates a new event and adds it to the list', async () => {
    const newEvent: CalendarEvent = {
      id: 3,
      title: 'New Conference',
      description: null,
      startTime: `${firstOfMonth}T14:00:00Z`,
      endTime: `${firstOfMonth}T15:00:00Z`,
      color: '#bbdefb',
    };
    vi.mocked(api.createEvent).mockResolvedValue(newEvent);
    render(<EventsPage token={TOKEN} />);
    await waitFor(() => screen.getAllByText('Team Meeting'));

    await userEvent.click(screen.getByRole('button', { name: /add event/i }));
    await userEvent.type(screen.getByLabelText(/title/i), 'New Conference');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() =>
      expect(api.createEvent).toHaveBeenCalledWith(TOKEN, expect.objectContaining({ title: 'New Conference' }))
    );
  }, 15000);

  it('opens edit dialog when an event chip is clicked', async () => {
    render(<EventsPage token={TOKEN} />);
    await waitFor(() => screen.getAllByText('Team Meeting'));

    await userEvent.click(screen.getAllByText('Team Meeting')[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Team Meeting')).toBeInTheDocument();
  });

  it('deletes an event from the edit dialog', async () => {
    vi.mocked(api.deleteEvent).mockResolvedValue(undefined);
    render(<EventsPage token={TOKEN} />);
    await waitFor(() => screen.getAllByText('Team Meeting'));

    await userEvent.click(screen.getAllByText('Team Meeting')[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(screen.queryByText('Team Meeting')).not.toBeInTheDocument());
    expect(api.deleteEvent).toHaveBeenCalledWith(TOKEN, 1);
  });

  it('shows an error when fetchEvents fails', async () => {
    vi.mocked(api.fetchEvents).mockRejectedValue(new Error('Network error'));
    render(<EventsPage token={TOKEN} />);
    await waitFor(() => expect(screen.getByText(/failed to load events/i)).toBeInTheDocument());
  });
});
