import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import AppShell from './components/layout/AppShell.js';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import CandidateBrief from './pages/CandidateBrief.js';
import Campaign from './pages/Campaign.js';
import Events from './pages/Events.js';
import Members from './pages/Members.js';
import Media from './pages/Media.js';
import Teams from './pages/Teams.js';
import Territory from './pages/Territory.js';
import Social from './pages/Social.js';
import PollingReview from './pages/PollingReview.js';
import SystemAdmin from './pages/SystemAdmin.js';
import type { ReactNode } from 'react';

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#8b8fa8', fontFamily: 'Inter, sans-serif' }}>Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function DefaultRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.homePath || '/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/candidate" element={<Protected><CandidateBrief /></Protected>} />
          <Route path="/campaign" element={<Protected><Campaign /></Protected>} />
          <Route path="/events" element={<Protected><Events /></Protected>} />
          <Route path="/members" element={<Protected><Members /></Protected>} />
          <Route path="/media" element={<Protected><Media /></Protected>} />
          <Route path="/teams" element={<Protected><Teams /></Protected>} />
          <Route path="/territory" element={<Protected><Territory /></Protected>} />
          <Route path="/social" element={<Protected><Social /></Protected>} />
          <Route path="/polling" element={<Protected><PollingReview /></Protected>} />
          <Route path="/admin" element={<Protected><SystemAdmin /></Protected>} />
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
