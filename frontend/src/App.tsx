import { createContext, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ItemsPage from './pages/ItemsPage';
import EventsPage from './pages/EventsPage';
import ProfilePage from './pages/ProfilePage';
import AppShell from './AppShell';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setToken, clearToken } from './store/slices/authSlice';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.auth.token);
  const navigate = useNavigate();

  const [mode, setMode] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('colorMode') as 'light' | 'dark') ?? 'light'
  );

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
    dispatch(setToken(t));
    navigate('/items');
  }

  function handleLogout() {
    dispatch(clearToken());
  }

  useEffect(() => {
    const onUnauthorized = () => dispatch(clearToken());
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [dispatch]);

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
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/" element={<Navigate to={token ? '/items' : '/login'} replace />} />
          <Route path="*" element={<Navigate to={token ? '/items' : '/login'} replace />} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
