import { useState } from 'react';
import { login } from '../api';
import { Box, Paper, Typography, TextField, Button, Alert, Link } from '@mui/material';

interface Props {
  onLogin: (token: string) => void;
  onSignupClick: () => void;
}

export default function LoginPage({ onLogin, onSignupClick }: Props) {
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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{ width: '100%', maxWidth: 400, p: 4, borderRadius: 3 }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Typography variant="h5" align="center" fontWeight={700} mb={3}>
          Sign in
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          autoComplete="username"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          autoComplete="current-password"
          sx={{ mb: 3 }}
        />

        <Button type="submit" variant="contained" fullWidth disabled={loading} size="large">
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>

        <Typography align="center" variant="body2" mt={2} color="text.secondary">
          Don&apos;t have an account?{' '}
          <Link component="button" type="button" onClick={onSignupClick} underline="hover">
            Create one
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
