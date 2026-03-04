import { useState } from 'react';
import { signup } from '../api';
import { Box, Paper, Typography, TextField, Button, Alert, Link } from '@mui/material';

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
          Create account
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
          autoComplete="new-password"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          sx={{ mb: 3 }}
        />

        <Button type="submit" variant="contained" fullWidth disabled={loading} size="large">
          {loading ? 'Creating account...' : 'Create account'}
        </Button>

        <Typography align="center" variant="body2" mt={2} color="text.secondary">
          Already have an account?{' '}
          <Link component="button" type="button" onClick={onLoginClick} underline="hover">
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
