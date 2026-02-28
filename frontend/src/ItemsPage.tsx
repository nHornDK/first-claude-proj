import { useEffect, useState } from 'react';
import { fetchItems, createItem, deleteItem } from './api';
import type { Item } from './types';

interface Props {
  token: string;
  onLogout: () => void;
}

export default function ItemsPage({ token, onLogout }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems(token)
      .then(setItems)
      .catch(() => setError('Failed to load items.'));
  }, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const item = await createItem(token, name.trim(), description.trim());
      setItems((prev) => [...prev, item]);
      setName('');
      setDescription('');
    } catch {
      setError('Failed to create item.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteItem(token, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError('Failed to delete item.');
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Items</h1>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleCreate} style={styles.form}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
        />
        <button type="submit" disabled={submitting} style={styles.addBtn}>
          {submitting ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      {items.length === 0 ? (
        <p style={styles.empty}>No items yet. Add one above.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>{item.id}</td>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>{item.description ?? '—'}</td>
                <td style={styles.td}>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'inherit' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, fontSize: '1.8rem' },
  logoutBtn: { background: 'transparent', border: '1px solid #888', color: 'inherit', cursor: 'pointer', padding: '0.4rem 0.9rem', borderRadius: 6 },
  error: { color: '#f87171', marginBottom: '1rem' },
  form: { display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 160, padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #444', background: '#1a1a1a', color: 'inherit', fontSize: '0.95rem' },
  addBtn: { padding: '0.5rem 1.25rem', borderRadius: 6, background: '#646cff', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.95rem' },
  empty: { color: '#888', textAlign: 'center', marginTop: '3rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.6rem 0.75rem', borderBottom: '1px solid #333', color: '#888', fontWeight: 600, fontSize: '0.85rem' },
  tr: { borderBottom: '1px solid #2a2a2a' },
  td: { padding: '0.7rem 0.75rem', fontSize: '0.95rem' },
  deleteBtn: { background: 'transparent', border: '1px solid #666', color: '#f87171', cursor: 'pointer', padding: '0.3rem 0.7rem', borderRadius: 5, fontSize: '0.85rem' },
};
