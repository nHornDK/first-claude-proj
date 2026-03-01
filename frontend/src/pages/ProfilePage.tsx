import { useEffect, useState } from 'react';
import { getMe, updateMe, changePassword } from '../api';
import type { User } from '../types';

interface Props {
  token: string;
  onBack: () => void;
}

export default function ProfilePage({ token, onBack }: Props) {
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

  if (!user) return <div style={styles.page}><p style={{ color: '#888' }}>Loading...</p></div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>Profile</h1>
      </header>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Account details</h2>
        <form onSubmit={handleProfileSave} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input id="username" value={user.username} disabled style={{ ...styles.input, opacity: 0.5 }} />
          </div>
          <div style={styles.field}>
            <label htmlFor="displayName" style={styles.label}>Display name</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>
          {profileMsg && <p style={{ ...styles.msg, color: profileMsg.ok ? '#4ade80' : '#f87171' }}>{profileMsg.text}</p>}
          <button type="submit" disabled={savingProfile} style={styles.saveBtn}>
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Change password</h2>
        <form onSubmit={handlePasswordChange} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="currentPassword" style={styles.label}>Current password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="current-password"
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="newPassword" style={styles.label}>New password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="new-password"
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="new-password"
            />
          </div>
          {passwordMsg && <p style={{ ...styles.msg, color: passwordMsg.ok ? '#4ade80' : '#f87171' }}>{passwordMsg.text}</p>}
          <button type="submit" disabled={savingPassword} style={styles.saveBtn}>
            {savingPassword ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 560, margin: '0 auto', padding: '2rem', fontFamily: 'inherit' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' },
  backBtn: { background: 'transparent', border: '1px solid #555', color: 'inherit', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.9rem' },
  title: { margin: 0, fontSize: '1.8rem' },
  card: { border: '1px solid #2a2a2a', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem', background: '#1a1a1a' },
  sectionTitle: { margin: '0 0 1.25rem', fontSize: '1.1rem', color: '#ccc' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.85rem', color: '#aaa' },
  input: { padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid #444', background: '#242424', color: 'inherit', fontSize: '0.95rem' },
  msg: { margin: 0, fontSize: '0.9rem' },
  saveBtn: { alignSelf: 'flex-start', padding: '0.55rem 1.25rem', borderRadius: 6, background: '#646cff', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
};
