import { createContext, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ItemsPage from './pages/ItemsPage';
import EventsPage from './pages/EventsPage';
import ProfilePage from './pages/ProfilePage';
import AppShell from './AppShell';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [mode, setMode] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('colorMode') as 'light' | 'dark') ?? 'light'
  );
  const navigate = useNavigate();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((m) => {
          const next = m === 'light' ? 'dark' : 'light';
          localStorage.setItem('colorMode', next);
          return next;
        }),
    }),
    []
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  function handleLogin(t: string) {
    localStorage.setItem('token', t);
    setToken(t);
    navigate('/items');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  const shell = token ? (
    <AppShell onLogout={handleLogout} toggleColorMode={colorMode.toggleColorMode} />
  ) : (
    <Navigate to="/login" replace />
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/items" replace />
              ) : (
                <LoginPage onLogin={handleLogin} onSignupClick={() => navigate('/signup')} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              token ? (
                <Navigate to="/items" replace />
              ) : (
                <SignupPage onSignup={handleLogin} onLoginClick={() => navigate('/login')} />
              )
            }
          />
          <Route element={shell}>
            <Route path="/items" element={<ItemsPage token={token!} />} />
            <Route path="/events" element={<EventsPage token={token!} />} />
            <Route path="/profile" element={<ProfilePage token={token!} />} />
          </Route>
          <Route path="/" element={<Navigate to={token ? '/items' : '/login'} replace />} />
          <Route path="*" element={<Navigate to={token ? '/items' : '/login'} replace />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
