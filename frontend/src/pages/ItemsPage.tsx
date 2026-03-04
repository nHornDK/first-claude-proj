import { useEffect, useState } from 'react';
import { fetchItems, createItem, updateItem, deleteItem } from '../api';
import type { Item } from '../types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  token: string;
}

interface EditState {
  id: number;
  name: string;
  description: string;
}

export default function ItemsPage({ token }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

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

  function startEdit(item: Item) {
    setEditing({ id: item.id, name: item.name, description: item.description ?? '' });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await updateItem(token, editing.id, editing.name.trim(), editing.description.trim());
      setItems((prev) =>
        prev.map((i) =>
          i.id === editing.id ? { ...i, name: editing.name.trim(), description: editing.description.trim() } : i
        )
      );
      setEditing(null);
    } catch {
      setError('Failed to save item.');
    } finally {
      setSaving(false);
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
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Items</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          size="small"
          sx={{ flex: 1, minWidth: 160 }}
        />
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="small"
          sx={{ flex: 2, minWidth: 200 }}
        />
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Item'}
        </Button>
      </Box>

      {items.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={6}>
          No items yet. Add one above.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) =>
                editing?.id === item.id ? (
                  <TableRow key={item.id} component="form" onSubmit={handleSave}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <TextField
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        size="small"
                        required
                        autoFocus
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={editing.description}
                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton type="submit" disabled={saving} aria-label="Save" size="small" color="primary">
                        <CheckIcon />
                      </IconButton>
                      <IconButton onClick={() => setEditing(null)} aria-label="Cancel" size="small">
                        <CloseIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description ?? '—'}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => startEdit(item)} aria-label="Edit" size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item.id)} aria-label="Delete" size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
