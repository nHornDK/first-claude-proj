import { useState } from 'react';
import { login } from '../api';
import { Box, Typography, TextField, Button, Alert, Link, Divider } from '@mui/material';

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', py: { xs: 0, sm: 3 }, px: { xs: 0, sm: 2 } }}>
      <Box sx={{
        width: '100%',
        maxWidth: 1280,
        bgcolor: 'background.paper',
        borderRadius: { xs: 0, sm: '16px' },
        boxShadow: '0 8px 48px rgba(80,60,140,0.10)',
        minHeight: { xs: '100vh', sm: 'calc(100vh - 48px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 3, md: 5 }, py: 2.5, borderBottom: 1, borderColor: 'divider' }}>
          <Box component="img" src="/logos/logo-09.svg" alt="Dendo" sx={{ height: 28 }} />
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" mr={1}>
            Don&apos;t have an account?
          </Typography>
          <Button variant="outlined" size="small" onClick={onSignupClick}
            sx={{ borderRadius: '10px', fontWeight: 600, borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' } }}>
            Sign up
          </Button>
        </Box>

        {/* Centered form */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
            <Typography variant="h4" fontWeight={800} mb={0.5} letterSpacing="-0.02em">
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              Sign in to your account to continue
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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

            <Button type="submit" variant="contained" fullWidth disableElevation disabled={loading} size="large"
              sx={{ py: 1.4, fontSize: '1rem', borderRadius: '12px', fontWeight: 700 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography align="center" variant="body2" color="text.secondary">
              New to Dendo?{' '}
              <Link component="button" type="button" onClick={onSignupClick} underline="hover" fontWeight={600} color="primary.main">
                Create an account
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: { xs: 3, md: 5 }, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.disabled">
            &copy; {new Date().getFullYear()} Dendo
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
