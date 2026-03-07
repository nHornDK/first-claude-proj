import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMe, updateMe, changePassword } from '../../api';
import type { User } from '../../types';
import type { RootState } from '../index';

interface ProfileState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ProfileState = {
  user: null,
  status: 'idle',
  error: null,
};

export const fetchProfileThunk = createAsyncThunk<User, void, { state: RootState }>(
  'profile/fetch',
  async (_, { getState }) => {
    const token = getState().auth.token!;
    return getMe(token);
  }
);

export const updateProfileThunk = createAsyncThunk<
  { email: string | null; displayName: string | null },
  { email: string | null; displayName: string | null },
  { state: RootState }
>(
  'profile/update',
  async ({ email, displayName }, { getState }) => {
    const token = getState().auth.token!;
    await updateMe(token, email, displayName);
    return { email, displayName };
  }
);

export const changePasswordThunk = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string },
  { state: RootState }
>(
  'profile/changePassword',
  async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
    const token = getState().auth.token!;
    try {
      await changePassword(token, currentPassword, newPassword);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to change password.');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile(state) { state.user = null; state.status = 'idle'; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => { state.status = 'idle'; state.user = action.payload; })
      .addCase(fetchProfileThunk.rejected, (state) => { state.status = 'failed'; state.error = 'Failed to load profile.'; })

      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        if (state.user) {
          state.user.email = action.payload.email;
          state.user.displayName = action.payload.displayName;
        }
      })

      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'Failed to change password.';
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
