import { useState } from 'react';
import { login } from '../api';

interface Props {
  onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await login(username, password);
      onLogin(token);
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Sign in</h1>

        {error && <p style={styles.error}>{error}</p>}

        <label htmlFor="username" style={styles.label}>Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          autoComplete="username"
          required
        />

        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 360, padding: '2rem', border: '1px solid #333', borderRadius: 10, background: '#1a1a1a' },
  title: { margin: '0 0 0.5rem', fontSize: '1.5rem', textAlign: 'center' },
  error: { color: '#f87171', margin: 0, fontSize: '0.9rem', textAlign: 'center' },
  label: { fontSize: '0.85rem', color: '#aaa' },
  input: { padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid #444', background: '#242424', color: 'inherit', fontSize: '1rem' },
  btn: { marginTop: '0.5rem', padding: '0.6rem', borderRadius: 6, background: '#646cff', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 },
};
