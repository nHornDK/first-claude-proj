import { createTheme } from '@mui/material/styles';

export function getTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#4F74F9' : '#7993fb' },
      background: {
        default: mode === 'light' ? '#e8e3f0' : '#0f0f1a',
        paper:   mode === 'light' ? '#ffffff'  : '#1a1a2e',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            ...(ownerState.variant !== 'outlined' && { borderRadius: 16 }),
          }),
        },
      },
    },
  });
}
