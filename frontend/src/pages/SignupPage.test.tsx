import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignupPage from './SignupPage';
import * as api from '../api';

vi.mock('../api');

describe('SignupPage', () => {
  const onSignup = vi.fn();
  const onLoginClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the create account form', () => {
    render(<SignupPage onSignup={onSignup} onLoginClick={onLoginClick} />);
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('registers and calls onSignup with token on success', async () => {
    vi.mocked(api.signup).mockResolvedValue('new-token');
    render(<SignupPage onSignup={onSignup} onLoginClick={onLoginClick} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(onSignup).toHaveBeenCalledWith('new-token'));
    expect(api.signup).toHaveBeenCalledWith('newuser', 'secret123');
  });

  it('shows error when passwords do not match', async () => {
    render(<SignupPage onSignup={onSignup} onLoginClick={onLoginClick} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(api.signup).not.toHaveBeenCalled();
  });

  it('shows server error when username is already taken', async () => {
    vi.mocked(api.signup).mockRejectedValue(new Error('Username is already taken.'));
    render(<SignupPage onSignup={onSignup} onLoginClick={onLoginClick} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(screen.getByText(/username is already taken/i)).toBeInTheDocument()
    );
    expect(onSignup).not.toHaveBeenCalled();
  });

  it('disables the button while submitting', async () => {
    vi.mocked(api.signup).mockImplementation(() => new Promise(() => {}));
    render(<SignupPage onSignup={onSignup} onLoginClick={onLoginClick} />);

    await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
  });

  it('calls onLoginClick when the sign in link is clicked', async () => {
    render(<SignupPage onSignup={onSignup} onLoginClick={onLoginClick} />);
    await userEvent.click(screen.getAllByRole('button', { name: /sign in/i })[0]);
    expect(onLoginClick).toHaveBeenCalled();
  });
});
