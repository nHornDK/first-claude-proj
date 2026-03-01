import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ItemsPage from './pages/ItemsPage';
import ProfilePage from './pages/ProfilePage';

type View = 'items' | 'profile';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<View>('items');

  if (!token) {
    return <LoginPage onLogin={setToken} />;
  }

  if (view === 'profile') {
    return <ProfilePage token={token} onBack={() => setView('items')} />;
  }

  return (
    <ItemsPage
      token={token}
      onLogout={() => { setToken(null); setView('items'); }}
      onProfile={() => setView('profile')}
    />
  );
}
