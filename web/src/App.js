import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function Protected({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#8b8fa8', fontFamily: 'Inter, sans-serif' }, children: "Chargement..." });
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(AppShell, { children: children });
}
function DefaultRedirect() {
    const { user } = useAuth();
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(Navigate, { to: user.homePath || '/dashboard', replace: true });
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Protected, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/candidate", element: _jsx(Protected, { children: _jsx(CandidateBrief, {}) }) }), _jsx(Route, { path: "/campaign", element: _jsx(Protected, { children: _jsx(Campaign, {}) }) }), _jsx(Route, { path: "/events", element: _jsx(Protected, { children: _jsx(Events, {}) }) }), _jsx(Route, { path: "/members", element: _jsx(Protected, { children: _jsx(Members, {}) }) }), _jsx(Route, { path: "/media", element: _jsx(Protected, { children: _jsx(Media, {}) }) }), _jsx(Route, { path: "/teams", element: _jsx(Protected, { children: _jsx(Teams, {}) }) }), _jsx(Route, { path: "/territory", element: _jsx(Protected, { children: _jsx(Territory, {}) }) }), _jsx(Route, { path: "/social", element: _jsx(Protected, { children: _jsx(Social, {}) }) }), _jsx(Route, { path: "/polling", element: _jsx(Protected, { children: _jsx(PollingReview, {}) }) }), _jsx(Route, { path: "/admin", element: _jsx(Protected, { children: _jsx(SystemAdmin, {}) }) }), _jsx(Route, { path: "*", element: _jsx(DefaultRedirect, {}) })] }) }) }));
}
