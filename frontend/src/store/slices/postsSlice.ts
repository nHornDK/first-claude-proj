import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPosts, createPost, deletePost, createComment, deleteComment } from '../../api';
import type { Post, PostComment } from '../../types';
import type { RootState } from '../index';
import { deleteEventThunk } from './eventsSlice';

interface PostsState {
  posts: Post[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null,
};

export const fetchPostsThunk = createAsyncThunk<Post[], number, { state: RootState }>(
  'posts/fetchAll',
  async (eventId, { getState }) => {
    const token = getState().auth.token!;
    return fetchPosts(token, eventId);
  }
);

export const createPostThunk = createAsyncThunk<Post, { eventId: number; content: string; imageData?: string }, { state: RootState }>(
  'posts/create',
  async ({ eventId, content, imageData }, { getState }) => {
    const token = getState().auth.token!;
    return createPost(token, eventId, content, imageData);
  }
);

export const deletePostThunk = createAsyncThunk<number, { eventId: number; postId: number }, { state: RootState }>(
  'posts/delete',
  async ({ eventId, postId }, { getState }) => {
    const token = getState().auth.token!;
    await deletePost(token, eventId, postId);
    return postId;
  }
);

export const createCommentThunk = createAsyncThunk<
  { postId: number; comment: PostComment },
  { eventId: number; postId: number; content: string },
  { state: RootState }
>(
  'posts/createComment',
  async ({ eventId, postId, content }, { getState }) => {
    const token = getState().auth.token!;
    const comment = await createComment(token, eventId, postId, content);
    return { postId, comment };
  }
);

export const deleteCommentThunk = createAsyncThunk<
  { postId: number; commentId: number },
  { eventId: number; postId: number; commentId: number },
  { state: RootState }
>(
  'posts/deleteComment',
  async ({ eventId, postId, commentId }, { getState }) => {
    const token = getState().auth.token!;
    await deleteComment(token, eventId, postId, commentId);
    return { postId, commentId };
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPosts(state) { state.posts = []; state.status = 'idle'; state.error = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsThunk.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchPostsThunk.fulfilled, (state, action) => { state.status = 'idle'; state.posts = action.payload; })
      .addCase(fetchPostsThunk.rejected, (state) => { state.status = 'failed'; state.error = 'Failed to load posts.'; })

      .addCase(createPostThunk.fulfilled, (state, action) => { state.posts.unshift(action.payload); })
      .addCase(createPostThunk.rejected, (state) => { state.error = 'Failed to create post.'; })

      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload);
      })
      .addCase(deletePostThunk.rejected, (state) => { state.error = 'Failed to delete post.'; })

      .addCase(createCommentThunk.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) post.comments.push(comment);
      })
      .addCase(createCommentThunk.rejected, (state) => { state.error = 'Failed to create comment.'; })

      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) post.comments = post.comments.filter(c => c.id !== commentId);
      })
      .addCase(deleteCommentThunk.rejected, (state) => { state.error = 'Failed to delete comment.'; })

      // Clear posts when the selected event is deleted
      .addCase(deleteEventThunk.fulfilled, (state) => { state.posts = []; });
  },
});

export const { clearPosts, clearError } = postsSlice.actions;
export default postsSlice.reducer;
