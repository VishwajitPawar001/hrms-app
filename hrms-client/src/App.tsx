import React, { useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function App() {
  const [isAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  if (!isAuthenticated) {
    return <Auth />;
  }

  return <Dashboard />;
}

export default App;