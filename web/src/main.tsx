import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './pages/Login.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
