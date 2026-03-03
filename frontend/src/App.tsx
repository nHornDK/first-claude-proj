import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ItemsPage from './pages/ItemsPage';
import ProfilePage from './pages/ProfilePage';

type AuthView = 'login' | 'signup';
type AppView = 'items' | 'profile';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [appView, setAppView] = useState<AppView>('items');

  if (!token) {
    if (authView === 'signup') {
      return <SignupPage onSignup={setToken} onLoginClick={() => setAuthView('login')} />;
    }
    return <LoginPage onLogin={setToken} onSignupClick={() => setAuthView('signup')} />;
  }

  if (appView === 'profile') {
    return <ProfilePage token={token} onBack={() => setAppView('items')} />;
  }

  return (
    <ItemsPage
      token={token}
      onLogout={() => { setToken(null); setAuthView('login'); }}
      onProfile={() => setAppView('profile')}
    />
  );
}
