import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProfileThunk, updateProfileThunk, changePasswordThunk } from './profileSlice';
import * as api from '../../api';
import { makeStore } from '../../test-utils';
import type { User } from '../../types';

vi.mock('../../api');

const mockUser: User = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  displayName: 'Alice',
};

function authStore() {
  return makeStore({ auth: { token: 'test-token' } });
}

describe('profileSlice thunks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchProfileThunk loads the user', async () => {
    vi.mocked(api.getMe).mockResolvedValue(mockUser);
    const store = authStore();
    await store.dispatch(fetchProfileThunk());
    expect(store.getState().profile.user).toEqual(mockUser);
    expect(api.getMe).toHaveBeenCalledWith('test-token');
  });

  it('fetchProfileThunk sets error on failure', async () => {
    vi.mocked(api.getMe).mockRejectedValue(new Error('Network error'));
    const store = authStore();
    await store.dispatch(fetchProfileThunk());
    expect(store.getState().profile.status).toBe('failed');
    expect(store.getState().profile.error).toBe('Failed to load profile.');
  });

  it('updateProfileThunk updates email and displayName in state', async () => {
    vi.mocked(api.getMe).mockResolvedValue(mockUser);
    vi.mocked(api.updateMe).mockResolvedValue(undefined);

    const store = authStore();
    await store.dispatch(fetchProfileThunk());
    await store.dispatch(updateProfileThunk({ email: 'new@example.com', displayName: 'Alice B' }));

    const user = store.getState().profile.user;
    expect(user?.email).toBe('new@example.com');
    expect(user?.displayName).toBe('Alice B');
    expect(api.updateMe).toHaveBeenCalledWith('test-token', 'new@example.com', 'Alice B');
  });

  it('changePasswordThunk fulfills on success', async () => {
    vi.mocked(api.changePassword).mockResolvedValue(undefined);
    const store = authStore();
    const result = await store.dispatch(changePasswordThunk({ currentPassword: 'old', newPassword: 'new' }));
    expect(changePasswordThunk.fulfilled.match(result)).toBe(true);
    expect(api.changePassword).toHaveBeenCalledWith('test-token', 'old', 'new');
  });

  it('changePasswordThunk rejects with error message on failure', async () => {
    vi.mocked(api.changePassword).mockRejectedValue(new Error('Wrong password'));
    const store = authStore();
    const result = await store.dispatch(changePasswordThunk({ currentPassword: 'bad', newPassword: 'new' }));
    expect(changePasswordThunk.rejected.match(result)).toBe(true);
    expect(result.payload).toBe('Wrong password');
  });
});
