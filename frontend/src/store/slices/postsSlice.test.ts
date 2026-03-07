import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchPostsThunk, createPostThunk, deletePostThunk,
  createCommentThunk, deleteCommentThunk, clearPosts,
} from './postsSlice';
import * as api from '../../api';
import { makeStore } from '../../test-utils';
import type { Post, PostComment } from '../../types';

vi.mock('../../api');

const mockComment: PostComment = {
  id: 10,
  author: 'Alice',
  content: 'Nice post!',
  createdAt: '2024-01-01T00:00:00Z',
  isOwn: false,
};

const mockPost: Post = {
  id: 1,
  author: 'Bob',
  content: 'Hello world',
  imageData: null,
  createdAt: '2024-01-01T00:00:00Z',
  isOwn: true,
  comments: [mockComment],
};

function authStore() {
  return makeStore({ auth: { token: 'test-token' } });
}

describe('postsSlice thunks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetchPostsThunk populates posts', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValue([mockPost]);
    const store = authStore();
    await store.dispatch(fetchPostsThunk(5));
    expect(store.getState().posts.posts).toEqual([mockPost]);
    expect(api.fetchPosts).toHaveBeenCalledWith('test-token', 5);
  });

  it('fetchPostsThunk sets error on failure', async () => {
    vi.mocked(api.fetchPosts).mockRejectedValue(new Error('fail'));
    const store = authStore();
    await store.dispatch(fetchPostsThunk(5));
    expect(store.getState().posts.status).toBe('failed');
    expect(store.getState().posts.error).toBe('Failed to load posts.');
  });

  it('createPostThunk prepends the new post', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValue([mockPost]);
    const newPost: Post = { ...mockPost, id: 2, content: 'New post', comments: [] };
    vi.mocked(api.createPost).mockResolvedValue(newPost);

    const store = authStore();
    await store.dispatch(fetchPostsThunk(5));
    await store.dispatch(createPostThunk({ eventId: 5, content: 'New post' }));

    const posts = store.getState().posts.posts;
    expect(posts[0]).toEqual(newPost);
    expect(posts).toHaveLength(2);
  });

  it('deletePostThunk removes the post', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValue([mockPost]);
    vi.mocked(api.deletePost).mockResolvedValue(undefined);

    const store = authStore();
    await store.dispatch(fetchPostsThunk(5));
    await store.dispatch(deletePostThunk({ eventId: 5, postId: 1 }));

    expect(store.getState().posts.posts).toHaveLength(0);
  });

  it('createCommentThunk appends a comment to the post', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValue([{ ...mockPost, comments: [] }]);
    const newComment: PostComment = { id: 99, author: 'Carol', content: 'Great!', createdAt: '2024-01-02T00:00:00Z', isOwn: true };
    vi.mocked(api.createComment).mockResolvedValue(newComment);

    const store = authStore();
    await store.dispatch(fetchPostsThunk(5));
    await store.dispatch(createCommentThunk({ eventId: 5, postId: 1, content: 'Great!' }));

    const post = store.getState().posts.posts.find(p => p.id === 1);
    expect(post?.comments).toHaveLength(1);
    expect(post?.comments[0]).toEqual(newComment);
  });

  it('deleteCommentThunk removes the comment from the post', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValue([mockPost]);
    vi.mocked(api.deleteComment).mockResolvedValue(undefined);

    const store = authStore();
    await store.dispatch(fetchPostsThunk(5));
    await store.dispatch(deleteCommentThunk({ eventId: 5, postId: 1, commentId: 10 }));

    const post = store.getState().posts.posts.find(p => p.id === 1);
    expect(post?.comments).toHaveLength(0);
  });

  it('clearPosts resets the posts state', async () => {
    vi.mocked(api.fetchPosts).mockResolvedValue([mockPost]);
    const store = authStore();
    await store.dispatch(fetchPostsThunk(5));
    store.dispatch(clearPosts());
    expect(store.getState().posts.posts).toHaveLength(0);
    expect(store.getState().posts.status).toBe('idle');
  });
});
