import { useState } from 'react';
import { signup } from '../api';

interface Props {
  onSignup: (token: string) => void;
  onLoginClick: () => void;
}

export default function SignupPage({ onSignup, onLoginClick }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = await signup(username, password);
      onSignup(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Create account</h1>

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
          autoComplete="new-password"
          required
        />

        <label htmlFor="confirmPassword" style={styles.label}>Confirm password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={styles.link}>
          Already have an account?{' '}
          <button type="button" onClick={onLoginClick} style={styles.linkBtn}>
            Sign in
          </button>
        </p>
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
  link: { margin: '0.25rem 0 0', textAlign: 'center', fontSize: '0.875rem', color: '#888' },
  linkBtn: { background: 'none', border: 'none', color: '#646cff', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' },
};
