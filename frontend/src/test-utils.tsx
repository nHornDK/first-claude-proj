import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render, type RenderOptions } from '@testing-library/react';
import authReducer from './store/slices/authSlice';
import itemsReducer from './store/slices/itemsSlice';
import eventsReducer from './store/slices/eventsSlice';
import postsReducer from './store/slices/postsSlice';
import profileReducer from './store/slices/profileSlice';
import type { RootState } from './store';


export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore<RootState>({
    reducer: {
      auth: authReducer,
      items: itemsReducer,
      events: eventsReducer,
      posts: postsReducer,
      profile: profileReducer,
    },
    preloadedState: preloadedState as RootState,
  });
}

export function renderWithStore(
  ui: React.ReactElement,
  preloadedState: Partial<RootState> = {},
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const store = makeStore(preloadedState);
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** Pre-loaded auth state with a test token */
export const withAuth: Partial<RootState> = {
  auth: { token: 'test-token' },
};
