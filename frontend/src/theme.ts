import { createTheme } from '@mui/material/styles';

export function getTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#5c6bc0' : '#7986cb' },
      background: {
        default: mode === 'light' ? '#f0f1f8' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
        },
      },
    },
  });
}
