import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from './ProfilePage';
import * as api from '../api';
import type { User } from '../types';

vi.mock('../api');

const TOKEN = 'test-token';

const mockUser: User = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  displayName: 'Admin User',
};

describe('ProfilePage', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getMe).mockResolvedValue(mockUser);
  });

  it('renders user info after loading', async () => {
    render(<ProfilePage token={TOKEN} onBack={onBack} />);
    await waitFor(() => expect(screen.getByDisplayValue('admin')).toBeInTheDocument());
    expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin@example.com')).toBeInTheDocument();
  });

  it('calls onBack when Back button is clicked', async () => {
    render(<ProfilePage token={TOKEN} onBack={onBack} />);
    await waitFor(() => screen.getByDisplayValue('admin'));
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('saves profile changes successfully', async () => {
    vi.mocked(api.updateMe).mockResolvedValue(undefined);
    render(<ProfilePage token={TOKEN} onBack={onBack} />);
    await waitFor(() => screen.getByDisplayValue('Admin User'));

    const displayNameInput = screen.getByLabelText(/display name/i);
    await userEvent.clear(displayNameInput);
    await userEvent.type(displayNameInput, 'New Name');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(screen.getByText(/profile updated/i)).toBeInTheDocument());
    expect(api.updateMe).toHaveBeenCalledWith(TOKEN, 'admin@example.com', 'New Name');
  });

  it('shows an error when profile save fails', async () => {
    vi.mocked(api.updateMe).mockRejectedValue(new Error('Server error'));
    render(<ProfilePage token={TOKEN} onBack={onBack} />);
    await waitFor(() => screen.getByDisplayValue('Admin User'));

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument()
    );
  });

  it('shows an error when new passwords do not match', async () => {
    render(<ProfilePage token={TOKEN} onBack={onBack} />);
    await waitFor(() => screen.getByDisplayValue('admin'));

    await userEvent.type(screen.getByLabelText(/current password/i), 'oldpass');
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpass1');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpass2');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(api.changePassword).not.toHaveBeenCalled();
  });

  it('changes password successfully', async () => {
    vi.mocked(api.changePassword).mockResolvedValue(undefined);
    render(<ProfilePage token={TOKEN} onBack={onBack} />);
    await waitFor(() => screen.getByDisplayValue('admin'));

    await userEvent.type(screen.getByLabelText(/current password/i), 'oldpass');
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpass');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpass');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() =>
      expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument()
    );
    expect(api.changePassword).toHaveBeenCalledWith(TOKEN, 'oldpass', 'newpass');
  });

  it('shows an error when password change fails', async () => {
    vi.mocked(api.changePassword).mockRejectedValue(new Error('Wrong current password'));
    render(<ProfilePage token={TOKEN} onBack={onBack} />);
    await waitFor(() => screen.getByDisplayValue('admin'));

    await userEvent.type(screen.getByLabelText(/current password/i), 'wrongpass');
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpass');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpass');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() =>
      expect(screen.getByText(/wrong current password/i)).toBeInTheDocument()
    );
  });
});
