import { useEffect, useState, useMemo } from 'react';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../api';
import type { CalendarEvent } from '../types';
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
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EVENT_COLORS = ['#bbdefb', '#c8e6c9', '#fff9c4', '#ffcdd2', '#e1bee7'];

// Saturated text/dot colors matching each pastel
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

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

export default function EventsPage({ token }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState('');
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents(token)
      .then(setEvents)
      .catch(() => setError('Failed to load events.'));
  }, [token]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  function eventsForDay(date: Date): CalendarEvent[] {
    const prefix = toDateStr(date);
    return events.filter(e => e.startTime.startsWith(prefix));
  }

  function openCreate(date?: Date) {
    setEditingId(null);
    setForm(emptyForm(date ? toDateStr(date) : undefined));
    setDialogOpen(true);
  }

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

  async function handleDelete() {
    if (editingId === null) return;
    try {
      await deleteEvent(token, editingId);
      setEvents(prev => prev.filter(e => e.id !== editingId));
      setDialogOpen(false);
    } catch {
      setError('Failed to delete event.');
    }
  }

  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.startTime) >= now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 10);
  }, [events]);

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

      {/* ── Upcoming events panel ── */}
      <Box
        sx={{
          width: 270,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          p: 2.5,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={0.5}>Upcoming events</Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Don&apos;t miss scheduled events
        </Typography>

        {upcoming.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No upcoming events</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {upcoming.map(ev => {
              const textColor = EVENT_TEXT_COLORS[ev.color] ?? 'text.primary';
              return (
                <Box key={ev.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: textColor,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: textColor, fontWeight: 600 }}>
                        {fmtTime(ev.startTime)}–{fmtTime(ev.endTime)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(ev)}
                      sx={{ p: 0.25, color: 'text.secondary' }}
                      aria-label="More options"
                    >
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" fontWeight={700} mt={0.5} sx={{ ml: 2 }}>
                    {ev.title}
                  </Typography>
                  {ev.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      noWrap
                      sx={{ ml: 2 }}
                    >
                      {ev.description}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ── Calendar ── */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Calendar</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate()}>
            Add Event
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Month navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton size="small" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600} minWidth={200} textAlign="center">
            {monthLabel}
          </Typography>
          <IconButton size="small" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Calendar grid */}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
          {/* Weekday headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', bgcolor: 'action.hover' }}>
            {WEEKDAYS.map(d => (
              <Box key={d} sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">{d}</Typography>
              </Box>
            ))}
          </Box>

          {/* Day cells */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {calendarDays.map((date, i) => {
              const isToday = date?.toDateString() === today.toDateString();
              const dayEvents = date ? eventsForDay(date) : [];
              return (
                <Box
                  key={i}
                  onClick={() => date && openCreate(date)}
                  sx={{
                    minHeight: 90,
                    p: 0.75,
                    borderTop: 1,
                    borderLeft: i % 7 !== 0 ? 1 : 0,
                    borderColor: 'divider',
                    cursor: date ? 'pointer' : 'default',
                    bgcolor: date ? 'background.paper' : 'action.hover',
                    '&:hover': date ? { bgcolor: 'action.hover' } : {},
                  }}
                >
                  {date && (
                    <>
                      <Typography
                        variant="caption"
                        fontWeight={isToday ? 700 : 400}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: isToday ? 'primary.main' : 'transparent',
                          color: isToday ? 'primary.contrastText' : 'text.primary',
                          mb: 0.5,
                        }}
                      >
                        {date.getDate()}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        {dayEvents.map(ev => (
                          <Box
                            key={ev.id}
                            onClick={e => { e.stopPropagation(); openEdit(ev); }}
                            sx={{
                              bgcolor: ev.color,
                              borderRadius: 1,
                              px: 0.75,
                              py: 0.25,
                              cursor: 'pointer',
                              '&:hover': { filter: 'brightness(0.92)' },
                            }}
                          >
                            <Typography variant="caption" noWrap fontWeight={500} display="block" color="text.primary">
                              {ev.title}
                            </Typography>
                            <Typography variant="caption" noWrap display="block" sx={{ opacity: 0.65, fontSize: '0.65rem', color: 'text.primary' }}>
                              {fmtTime(ev.startTime)}–{fmtTime(ev.endTime)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Start"
              type="time"
              value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End"
              type="time"
              value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Color</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {EVENT_COLORS.map(c => (
                <Box
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: c,
                    border: 2,
                    borderColor: form.color === c ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          {editingId ? (
            <Button color="error" onClick={handleDelete}>Delete</Button>
          ) : <Box />}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
