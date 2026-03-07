import {
  AppBar,
  Box,
  Toolbar,
  Tooltip,
  Divider,
  IconButton,
  Button,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 0.5 }}>
          <Box component="img" src="/dendo-logo.svg" alt="Dendo" sx={{ height: 32, mr: 1 }} />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {navItems.map(({ path, label }) => (
            <Button
              key={path}
              onClick={() => navigate(path)}
              color={location.pathname === path ? 'primary' : 'inherit'}
              sx={{ fontWeight: location.pathname === path ? 700 : 400 }}
            >
              {label}
            </Button>
          ))}

          <Box sx={{ flexGrow: 1 }} />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleColorMode} size="small">
              {isDark ? <BrightnessHighIcon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton onClick={onLogout} size="small" color="default" aria-label="Logout">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
