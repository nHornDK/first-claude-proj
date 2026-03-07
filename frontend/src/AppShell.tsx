import {
  Box,
  Tooltip,
  Divider,
  IconButton,
  Button,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import LogoutIcon from '@mui/icons-material/Logout';

interface Props {
  onLogout: () => void;
  toggleColorMode: () => void;
}

export default function AppShell({ onLogout, toggleColorMode }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/items', label: 'Items' },
    { path: '/events', label: 'Events' },
    { path: '/profile', label: 'Profile' },
  ];

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

        {/* Navigation header */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 3, md: 5 }, py: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box
            component="img"
            src="/logos/logo-09.svg"
            alt="Dendo"
            sx={{ height: 28, mr: 1.5, cursor: 'pointer' }}
            onClick={() => navigate('/items')}
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

          <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
            {navItems.map(({ path, label }) => {
              const active = location.pathname === path;
              return (
                <Button
                  key={path}
                  onClick={() => navigate(path)}
                  disableElevation
                  sx={{
                    fontWeight: active ? 700 : 500,
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'primary.main' + '14' : 'transparent',
                    borderRadius: '10px',
                    px: 2,
                    fontSize: '0.9rem',
                    '&:hover': { bgcolor: active ? 'primary.main' + '1a' : 'action.hover', color: active ? 'primary.main' : 'text.primary' },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={toggleColorMode} size="small" sx={{ color: 'text.secondary' }}>
                {isDark ? <BrightnessHighIcon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout">
              <IconButton onClick={onLogout} size="small" sx={{ color: 'text.secondary' }} aria-label="Logout">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Page content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: { xs: 2.5, md: 4 }, bgcolor: 'background.paper' }}
        >
          <Outlet />
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
