import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItemsPage from './ItemsPage';
import * as api from '../api';
import type { Item } from '../types';

vi.mock('../api');

const TOKEN = 'test-token';

const mockItems: Item[] = [
  { id: 1, name: 'First Item', description: 'A description', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Second Item', description: null, createdAt: '2024-01-02T00:00:00Z' },
];

describe('ItemsPage', () => {
  const onLogout = vi.fn();
  const onProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchItems).mockResolvedValue(mockItems);
  });

  it('renders items after loading', async () => {
    render(<ItemsPage token={TOKEN} onLogout={onLogout} onProfile={onProfile} />);
    await waitFor(() => expect(screen.getByText('First Item')).toBeInTheDocument());
    expect(screen.getByText('Second Item')).toBeInTheDocument();
  });

  it('shows empty state when there are no items', async () => {
    vi.mocked(api.fetchItems).mockResolvedValue([]);
    render(<ItemsPage token={TOKEN} onLogout={onLogout} onProfile={onProfile} />);
    await waitFor(() => expect(screen.getByText(/no items yet/i)).toBeInTheDocument());
  });

  it('creates a new item and appends it to the list', async () => {
    const newItem: Item = { id: 3, name: 'New Item', description: 'desc', createdAt: '2024-01-03T00:00:00Z' };
    vi.mocked(api.createItem).mockResolvedValue(newItem);
    render(<ItemsPage token={TOKEN} onLogout={onLogout} onProfile={onProfile} />);
    await waitFor(() => screen.getByText('First Item'));

    await userEvent.type(screen.getByPlaceholderText(/^name$/i), 'New Item');
    await userEvent.type(screen.getByPlaceholderText(/description/i), 'desc');
    await userEvent.click(screen.getByRole('button', { name: /add item/i }));

    await waitFor(() => expect(screen.getByText('New Item')).toBeInTheDocument());
    expect(api.createItem).toHaveBeenCalledWith(TOKEN, 'New Item', 'desc');
  });

  it('deletes an item and removes it from the list', async () => {
    vi.mocked(api.deleteItem).mockResolvedValue(undefined);
    render(<ItemsPage token={TOKEN} onLogout={onLogout} onProfile={onProfile} />);
    await waitFor(() => screen.getByText('First Item'));

    await userEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

    await waitFor(() => expect(screen.queryByText('First Item')).not.toBeInTheDocument());
    expect(api.deleteItem).toHaveBeenCalledWith(TOKEN, 1);
  });

  it('edits an item and updates the list', async () => {
    vi.mocked(api.updateItem).mockResolvedValue(undefined);
    render(<ItemsPage token={TOKEN} onLogout={onLogout} onProfile={onProfile} />);
    await waitFor(() => screen.getByText('First Item'));

    await userEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);

    const nameInput = screen.getByDisplayValue('First Item');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Item');

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => expect(screen.getByText('Updated Item')).toBeInTheDocument());
    expect(api.updateItem).toHaveBeenCalledWith(TOKEN, 1, 'Updated Item', 'A description');
  });

  it('calls onLogout when Logout is clicked', async () => {
    render(<ItemsPage token={TOKEN} onLogout={onLogout} onProfile={onProfile} />);
    await waitFor(() => screen.getByText('First Item'));
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(onLogout).toHaveBeenCalled();
  });

  it('calls onProfile when Profile is clicked', async () => {
    render(<ItemsPage token={TOKEN} onLogout={onLogout} onProfile={onProfile} />);
    await waitFor(() => screen.getByText('First Item'));
    await userEvent.click(screen.getByRole('button', { name: /profile/i }));
    expect(onProfile).toHaveBeenCalled();
  });

  it('shows an error when item creation fails', async () => {
    vi.mocked(api.createItem).mockRejectedValue(new Error('Server error'));
    render(<ItemsPage token={TOKEN} onLogout={onLogout} onProfile={onProfile} />);
    await waitFor(() => screen.getByText('First Item'));

    await userEvent.type(screen.getByPlaceholderText(/^name$/i), 'Bad Item');
    await userEvent.click(screen.getByRole('button', { name: /add item/i }));

    await waitFor(() => expect(screen.getByText(/failed to create item/i)).toBeInTheDocument());
  });
});
