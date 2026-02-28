import { useState } from 'react';
import LoginPage from './LoginPage';
import ItemsPage from './ItemsPage';

export default function App() {
  const [token, setToken] = useState<string | null>(null);

  if (!token) {
    return <LoginPage onLogin={setToken} />;
  }

  return <ItemsPage token={token} onLogout={() => setToken(null)} />;
}
