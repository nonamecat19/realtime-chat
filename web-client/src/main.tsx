import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import LoginPage from '@/pages/login.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LoginPage />
  </React.StrictMode>
);
