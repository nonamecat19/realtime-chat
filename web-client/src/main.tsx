import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import Router from '@/router/Router.tsx';
import {Toaster} from '@/components/ui/sonner.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
    <Toaster position="top-center" />
  </React.StrictMode>
);
