import { createContext, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ItemsPage from './pages/ItemsPage';
import ProfilePage from './pages/ProfilePage';
import AppShell from './AppShell';

type AuthView = 'login' | 'signup';
export type AppView = 'items' | 'profile';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [appView, setAppView] = useState<AppView>('items');
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
    []
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  function handleLogout() {
    setToken(null);
    setAuthView('login');
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {!token ? (
          authView === 'signup' ? (
            <SignupPage onSignup={setToken} onLoginClick={() => setAuthView('login')} />
          ) : (
            <LoginPage onLogin={setToken} onSignupClick={() => setAuthView('signup')} />
          )
        ) : (
          <AppShell
            token={token}
            onLogout={handleLogout}
            appView={appView}
            onNavChange={setAppView}
            toggleColorMode={colorMode.toggleColorMode}
          >
            {appView === 'profile' ? (
              <ProfilePage token={token} />
            ) : (
              <ItemsPage token={token} />
            )}
          </AppShell>
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
