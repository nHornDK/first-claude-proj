import { useEffect, useState, useMemo, useRef } from 'react';
import { fetchEvents, createEvent, updateEvent, deleteEvent, fetchPosts, createPost, deletePost, createComment, deleteComment } from '../api';
import type { CalendarEvent, Post, PostComment } from '../types';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const EVENT_COLORS = ['#bbdefb', '#c8e6c9', '#fff9c4', '#ffcdd2', '#e1bee7'];

const EVENT_TEXT_COLORS: Record<string, string> = {
  '#bbdefb': '#1565c0',
  '#c8e6c9': '#2e7d32',
  '#fff9c4': '#f57f17',
  '#ffcdd2': '#c62828',
  '#e1bee7': '#6a1b9a',
};

interface Props {
  token: string;
}

interface EventForm {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(date?: string): EventForm {
  return { title: '', description: '', date: date ?? todayStr(), startTime: '09:00', endTime: '10:00', color: EVENT_COLORS[0] };
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Post card ─────────────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
  token: string;
  eventId: number;
  onDelete: (postId: number) => void;
  onCommentAdded: (postId: number, comment: PostComment) => void;
  onCommentDeleted: (postId: number, commentId: number) => void;
}

function PostCard({ post, token, eventId, onDelete, onCommentAdded, onCommentDeleted }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleAddComment() {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const comment = await createComment(token, eventId, post.id, commentText.trim());
      onCommentAdded(post.id, comment);
      setCommentText('');
      setShowComments(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, pt: 2, pb: 1.5 }}>
        <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
          {initials(post.author)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={700}>{post.author}</Typography>
          <Typography variant="caption" color="text.secondary">{fmtRelative(post.createdAt)}</Typography>
        </Box>
        {post.isOwn && (
          <IconButton size="small" color="error" onClick={() => onDelete(post.id)} aria-label="Delete post">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
      </Box>

      {/* Image */}
      {post.imageData && (
        <Box sx={{ px: 2.5, pb: 1.5 }}>
          <Box
            component="img"
            src={post.imageData}
            alt="Post image"
            sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2 }}
          />
        </Box>
      )}

      <Divider />

      {/* Actions */}
      <Box sx={{ display: 'flex', px: 2, py: 0.5, gap: 0.5 }}>
        <Button
          startIcon={<ChatBubbleOutlineIcon fontSize="small" />}
          size="small"
          sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 500 }}
          onClick={() => setShowComments(s => !s)}
        >
          {post.comments.length > 0 ? `${post.comments.length} comment${post.comments.length > 1 ? 's' : ''}` : 'Comment'}
        </Button>
        {post.comments.length > 0 && (
          <IconButton size="small" onClick={() => setShowComments(s => !s)} sx={{ ml: 'auto', color: 'text.secondary' }}>
            <ExpandMoreIcon fontSize="small" sx={{ transform: showComments ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </IconButton>
        )}
      </Box>

      {/* Comments */}
      <Collapse in={showComments}>
        <Box sx={{ bgcolor: 'action.hover', px: 2.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {post.comments.map(c => (
            <Box key={c.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'secondary.main', flexShrink: 0 }}>
                {initials(c.author)}
              </Avatar>
              <Box sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 2, px: 1.5, py: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" fontWeight={700}>{c.author}</Typography>
                  <Typography variant="caption" color="text.secondary">{fmtRelative(c.createdAt)}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{c.content}</Typography>
              </Box>
              {c.isOwn && (
                <IconButton size="small" onClick={() => onCommentDeleted(post.id, c.id)} sx={{ p: 0.25, color: 'text.disabled' }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
          ))}

          {/* Comment input */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
              fullWidth
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />
            <IconButton size="small" color="primary" onClick={handleAddComment} disabled={submitting || !commentText.trim()}>
              {submitting ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EventsPage({ token }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents(token)
      .then(setEvents)
      .catch(() => setError('Failed to load events.'));
  }, [token]);

  useEffect(() => {
    if (selectedId === null) { setPosts([]); return; }
    setPostsLoading(true);
    fetchPosts(token, selectedId)
      .then(setPosts)
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setPostsLoading(false));
  }, [token, selectedId]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.startTime) >= now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 10);
  }, [events]);

  const selectedEvent = events.find(e => e.id === selectedId) ?? null;

  function openCreate() { setEditingId(null); setForm(emptyForm()); setDialogOpen(true); }

  function openEdit(ev: CalendarEvent) {
    const start = new Date(ev.startTime);
    const end = new Date(ev.endTime);
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      date: ev.startTime.slice(0, 10),
      startTime: `${String(start.getUTCHours()).padStart(2, '0')}:${String(start.getUTCMinutes()).padStart(2, '0')}`,
      endTime: `${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`,
      color: ev.color,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        startTime: `${form.date}T${form.startTime}:00Z`,
        endTime: `${form.date}T${form.endTime}:00Z`,
        color: form.color,
      };
      if (editingId !== null) {
        await updateEvent(token, editingId, payload);
        setEvents(prev => prev.map(e => e.id === editingId ? { ...e, ...payload } : e));
      } else {
        const created = await createEvent(token, payload);
        setEvents(prev => [...prev, created]);
      }
      setDialogOpen(false);
    } catch {
      setError('Failed to save event.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEvent(id: number) {
    try {
      await deleteEvent(token, id);
      setEvents(prev => prev.filter(e => e.id !== id));
      if (selectedId === id) setSelectedId(null);
      setDialogOpen(false);
    } catch {
      setError('Failed to delete event.');
    }
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNewPostImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCreatePost() {
    if (!selectedId || !newPostText.trim()) return;
    setPostSubmitting(true);
    try {
      const post = await createPost(token, selectedId, newPostText.trim(), newPostImage ?? undefined);
      setPosts(prev => [post, ...prev]);
      setNewPostText('');
      setNewPostImage(null);
    } catch {
      setError('Failed to create post.');
    } finally {
      setPostSubmitting(false);
    }
  }

  async function handleDeletePost(postId: number) {
    if (!selectedId) return;
    try {
      await deletePost(token, selectedId, postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      setError('Failed to delete post.');
    }
  }

  function handleCommentAdded(postId: number, comment: PostComment) {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
  }

  async function handleCommentDeleted(postId: number, commentId: number) {
    if (!selectedId) return;
    try {
      await deleteComment(token, selectedId, postId, commentId);
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
        : p
      ));
    } catch {
      setError('Failed to delete comment.');
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Events</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Event</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Top: select list + detail view */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 3 }}>

        {/* Upcoming select list */}
        <Box sx={{ width: 280, flexShrink: 0, bgcolor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>Upcoming events</Typography>
            <Typography variant="body2" color="text.secondary">Don&apos;t miss scheduled events</Typography>
          </Box>
          <Divider />
          {upcoming.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>No upcoming events</Typography>
          ) : (
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {upcoming.map(ev => {
                const textColor = EVENT_TEXT_COLORS[ev.color] ?? 'text.primary';
                const isSelected = selectedId === ev.id;
                return (
                  <Box
                    key={ev.id}
                    component="li"
                    onClick={() => setSelectedId(isSelected ? null : ev.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5,
                      cursor: 'pointer', borderLeft: 3,
                      borderLeftColor: isSelected ? textColor : 'transparent',
                      bgcolor: isSelected ? `${ev.color}60` : 'transparent',
                      '&:hover': { bgcolor: isSelected ? `${ev.color}60` : 'action.hover' },
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: ev.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography variant="caption" sx={{ color: textColor, fontWeight: 800, lineHeight: 1, fontSize: '0.7rem' }}>
                        {new Date(ev.startTime).toLocaleDateString([], { month: 'short', timeZone: 'UTC' }).toUpperCase()}
                      </Typography>
                      <Typography sx={{ color: textColor, fontWeight: 800, lineHeight: 1, fontSize: '0.95rem' }}>
                        {new Date(ev.startTime).getUTCDate()}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={isSelected ? 700 : 600} noWrap>{ev.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{fmtTime(ev.startTime)}–{fmtTime(ev.endTime)}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Event detail view */}
        <Box sx={{ flex: 1, minWidth: 0, bgcolor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
          {selectedEvent ? (
            <>
              <Box sx={{ height: 8, bgcolor: selectedEvent.color, borderRadius: '12px 12px 0 0' }} />
              <Box sx={{ p: 3, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                  <Box>
                    <Chip size="small" label={new Date(selectedEvent.startTime) >= new Date() ? 'Upcoming' : 'Past'}
                      sx={{ bgcolor: selectedEvent.color, color: EVENT_TEXT_COLORS[selectedEvent.color] ?? 'text.primary', fontWeight: 600, mb: 1 }} />
                    <Typography variant="h5" fontWeight={700}>{selectedEvent.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => openEdit(selectedEvent)} aria-label="Edit"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteEvent(selectedEvent.id)} aria-label="Delete"><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">{fmtDate(selectedEvent.startTime)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">{fmtTime(selectedEvent.startTime)} – {fmtTime(selectedEvent.endTime)}</Typography>
                  </Box>
                  {selectedEvent.description && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <EventNoteIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.25 }} />
                      <Typography variant="body2" color="text.secondary">{selectedEvent.description}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary', p: 4 }}>
              <CalendarTodayIcon sx={{ fontSize: 48, opacity: 0.25 }} />
              <Typography variant="body1" fontWeight={500}>Select an event to view details</Typography>
              <Typography variant="body2">Choose an upcoming event from the list</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Social Wall */}
      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>
          {selectedEvent ? `Wall — ${selectedEvent.title}` : 'Social Wall'}
        </Typography>

        {!selectedEvent ? (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider', p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Select an event above to view and post on its wall</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Create post box */}
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider', p: 2.5 }}>
              <TextField
                placeholder={`Post something about "${selectedEvent.title}"…`}
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                variant="outlined"
                size="small"
              />
              {newPostImage && (
                <Box sx={{ position: 'relative', mt: 1.5, display: 'inline-block' }}>
                  <Box component="img" src={newPostImage} alt="preview"
                    sx={{ maxHeight: 200, maxWidth: '100%', borderRadius: 2, display: 'block' }} />
                  <IconButton size="small" onClick={() => setNewPostImage(null)}
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Box>
                  <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
                  <IconButton size="small" onClick={() => imageInputRef.current?.click()} aria-label="Attach image" sx={{ color: 'text.secondary' }}>
                    <ImageIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Button variant="contained" size="small" endIcon={postSubmitting ? <CircularProgress size={14} color="inherit" /> : <SendIcon fontSize="small" />}
                  onClick={handleCreatePost} disabled={postSubmitting || !newPostText.trim()}>
                  Post
                </Button>
              </Box>
            </Box>

            {/* Posts list */}
            {postsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : posts.length === 0 ? (
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: 1, borderColor: 'divider', p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">No posts yet. Be the first to post!</Typography>
              </Box>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  token={token}
                  eventId={selectedId!}
                  onDelete={handleDeletePost}
                  onCommentAdded={handleCommentAdded}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Create / Edit event dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth required autoFocus />
          <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
          <TextField label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="Start" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="End" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Color</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {EVENT_COLORS.map(c => (
                <Box key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: c, border: 2, borderColor: form.color === c ? 'primary.main' : 'divider', cursor: 'pointer' }} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          {editingId ? <Button color="error" onClick={() => handleDeleteEvent(editingId)}>Delete</Button> : <Box />}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
