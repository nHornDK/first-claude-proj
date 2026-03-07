import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, { setToken, clearToken } from './authSlice';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('authSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('setToken stores the token in state and localStorage', () => {
    const state = authReducer({ token: null }, setToken('abc123'));
    expect(state.token).toBe('abc123');
    expect(localStorageMock.getItem('token')).toBe('abc123');
  });

  it('clearToken removes token from state and localStorage', () => {
    localStorageMock.setItem('token', 'abc123');
    const state = authReducer({ token: 'abc123' }, clearToken());
    expect(state.token).toBeNull();
    expect(localStorageMock.getItem('token')).toBeNull();
  });

  it('initialises with null when localStorage is empty', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.token).toBeNull();
  });
});
