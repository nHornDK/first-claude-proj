import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import * as api from '../api';

vi.mock('../api');

describe('LoginPage', () => {
  const onLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-in form', () => {
    render(<LoginPage onLogin={onLogin} />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls login and invokes onLogin with token on success', async () => {
    vi.mocked(api.login).mockResolvedValue('test-token');
    render(<LoginPage onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith('test-token'));
    expect(api.login).toHaveBeenCalledWith('admin', 'secret');
  });

  it('shows an error message when login fails', async () => {
    vi.mocked(api.login).mockRejectedValue(new Error('Unauthorized'));
    render(<LoginPage onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
    );
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('disables the button while submitting', async () => {
    vi.mocked(api.login).mockImplementation(() => new Promise(() => {})); // never resolves
    render(<LoginPage onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'pass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
