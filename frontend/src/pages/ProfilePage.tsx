import { useEffect, useState } from 'react';
import { getMe, updateMe, changePassword } from '../api';
import type { User } from '../types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

interface Props {
  token: string;
}

export default function ProfilePage({ token }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getMe(token).then((u) => {
      setUser(u);
      setEmail(u.email ?? '');
      setDisplayName(u.displayName ?? '');
    });
  }, [token]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateMe(token, email.trim() || null, displayName.trim() || null);
      setUser((u) => u && { ...u, email: email.trim() || null, displayName: displayName.trim() || null });
      setProfileMsg({ text: 'Profile updated.', ok: true });
    } catch {
      setProfileMsg({ text: 'Failed to update profile.', ok: false });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', ok: false });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await changePassword(token, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({ text: 'Password changed successfully.', ok: true });
    } catch (err) {
      setPasswordMsg({ text: err instanceof Error ? err.message : 'Failed to change password.', ok: false });
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) {
    return (
      <Box>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth={560}>
      <Typography variant="h5" fontWeight={700} mb={3}>Profile</Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>Account details</Typography>
          <Box component="form" onSubmit={handleProfileSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Username" value={user.username} disabled fullWidth />
            <TextField
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              fullWidth
            />
            {profileMsg && (
              <Alert severity={profileMsg.ok ? 'success' : 'error'}>{profileMsg.text}</Alert>
            )}
            <Button type="submit" variant="contained" disabled={savingProfile} sx={{ alignSelf: 'flex-start' }}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>Change password</Typography>
          <Box component="form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              fullWidth
            />
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              fullWidth
            />
            {passwordMsg && (
              <Alert severity={passwordMsg.ok ? 'success' : 'error'}>{passwordMsg.text}</Alert>
            )}
            <Button type="submit" variant="contained" disabled={savingPassword} sx={{ alignSelf: 'flex-start' }}>
              {savingPassword ? 'Changing...' : 'Change password'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
