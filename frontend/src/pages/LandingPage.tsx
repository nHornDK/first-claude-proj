import { Box, Button, Typography, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', py: { xs: 0, sm: 3 }, px: { xs: 0, sm: 2 } }}>
      {/* Centered white container */}
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
          <Box component="img" src="/logos/logo-09.svg" alt="Dendo" sx={{ height: 30, mr: 1.5 }} />

          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

          <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
            {['Features', 'Events', 'Community'].map(label => (
              <Button key={label} color="inherit" sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.9rem', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}>
                {label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 600, color: 'text.primary', px: 2.5 }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/signup')}
              disableElevation
              sx={{ px: 3, py: 1, borderRadius: '10px', fontWeight: 700 }}
            >
              Sign up
            </Button>
          </Box>
        </Box>

        {/* Hero */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3, py: { xs: 8, md: 12 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.25rem' },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              mb: 2.5,
              color: 'text.primary',
              maxWidth: 720,
            }}
          >
            Connect, share and<br />grow together
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: 'text.secondary',
              maxWidth: 480,
              mb: 5,
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.7,
            }}
          >
            Dendo brings your community together. Share events, post updates, and stay connected with the people that matter.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={() => navigate('/signup')}
              sx={{ px: 4, py: 1.4, fontSize: '1rem', borderRadius: '12px', fontWeight: 700 }}
            >
              Get started
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 4,
                py: 1.4,
                fontSize: '1rem',
                borderRadius: '12px',
                fontWeight: 600,
                border: '1.5px solid',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
              }}
            >
              Sign in
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: { xs: 3, md: 5 }, py: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.disabled">
            &copy; {new Date().getFullYear()} Dendo
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <Typography key={l} variant="body2" color="text.disabled" sx={{ cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}>
                {l}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
