import type { Item, User } from './types';

const BASE_URL = 'https://api.dendo.dk/api';

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
