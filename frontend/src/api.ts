import type { Item, User, CalendarEvent, Post, PostComment } from './types';

const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const { token } = await res.json();
  return token;
}

export async function signup(username: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Registration failed.');
  }
  const { token } = await res.json();
  return token;
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/me`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateMe(token: string, email: string | null, displayName: string | null): Promise<void> {
  const res = await fetch(`${BASE_URL}/user/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ email, displayName }),
  });
  if (!res.ok) throw new Error('Failed to update profile');
}

export async function changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/user/me/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to change password');
  }
}

export async function fetchItems(token: string): Promise<Item[]> {
  const res = await fetch(`${BASE_URL}/items`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItem(token: string, name: string, description: string): Promise<Item> {
  const res = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to create item');
  return res.json();
}

export async function updateItem(token: string, id: number, name: string, description: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ id, name, description }),
  });
  if (!res.ok) throw new Error('Failed to update item');
}

export async function deleteItem(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete item');
}

export async function fetchEvents(token: string): Promise<CalendarEvent[]> {
  const res = await fetch(`${BASE_URL}/events`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function createEvent(token: string, event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  const res = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error('Failed to create event');
  return res.json();
}

export async function updateEvent(token: string, id: number, event: Omit<CalendarEvent, 'id'>): Promise<void> {
  const res = await fetch(`${BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error('Failed to update event');
}

export async function deleteEvent(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/events/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete event');
}

export async function fetchPosts(token: string, eventId: number): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/events/${eventId}/posts`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function createPost(token: string, eventId: number, content: string, imageData?: string): Promise<Post> {
  const res = await fetch(`${BASE_URL}/events/${eventId}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ content, imageData: imageData ?? null }),
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

export async function deletePost(token: string, eventId: number, postId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/events/${eventId}/posts/${postId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete post');
}

export async function createComment(token: string, eventId: number, postId: number, content: string): Promise<PostComment> {
  const res = await fetch(`${BASE_URL}/events/${eventId}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
}

export async function deleteComment(token: string, eventId: number, postId: number, commentId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/events/${eventId}/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}
