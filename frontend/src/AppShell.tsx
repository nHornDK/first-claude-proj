import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import LogoutIcon from '@mui/icons-material/Logout';
import type { AppView } from './App';

const DRAWER_WIDTH = 64;

interface Props {
  token: string;
  onLogout: () => void;
  appView: AppView;
  onNavChange: (view: AppView) => void;
  toggleColorMode: () => void;
  children: React.ReactNode;
}

export default function AppShell({ onLogout, appView, onNavChange, toggleColorMode, children }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 1,
            overflowX: 'hidden',
          },
        }}
      >
        <Avatar sx={{ width: 36, height: 36, mb: 1, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
          D
        </Avatar>
        <Divider sx={{ width: '80%', mb: 1 }} />

        <List disablePadding sx={{ flex: 1, width: '100%' }}>
          <Tooltip title="Items" placement="right">
            <ListItemButton
              selected={appView === 'items'}
              onClick={() => onNavChange('items')}
              sx={{ justifyContent: 'center', py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: appView === 'items' ? 'primary.main' : 'text.secondary' }}>
                <ListAltIcon />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>

          <Tooltip title="Calendar" placement="right">
            <ListItemButton
              selected={appView === 'events'}
              onClick={() => onNavChange('events')}
              sx={{ justifyContent: 'center', py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: appView === 'events' ? 'primary.main' : 'text.secondary' }}>
                <CalendarTodayIcon />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>

          <Tooltip title="Profile" placement="right">
            <ListItemButton
              selected={appView === 'profile'}
              onClick={() => onNavChange('profile')}
              sx={{ justifyContent: 'center', py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: appView === 'profile' ? 'primary.main' : 'text.secondary' }}>
                <AccountCircleIcon />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        </List>

        <Divider sx={{ width: '80%', my: 1 }} />

        <Tooltip title={isDark ? 'Light mode' : 'Dark mode'} placement="right">
          <IconButton onClick={toggleColorMode} sx={{ mb: 0.5 }}>
            {isDark ? <BrightnessHighIcon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Logout" placement="right">
          <IconButton onClick={onLogout} sx={{ mb: 1, color: 'text.secondary' }} aria-label="Logout">
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
