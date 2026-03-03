import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ApiError } from '../api/client.js';
import './Login.css';
export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [login_, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(login_, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof ApiError ? 'Identifiants incorrects' : 'Erreur de connexion');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("div", { className: "login-bg", children: _jsxs("div", { className: "login-card", children: [_jsxs("div", { className: "login-logo", children: [_jsx("span", { className: "login-flag", children: "\uD83C\uDDE8\uD83C\uDDEC" }), _jsx("h1", { children: "MRC War Room" }), _jsx("p", { children: "Plateforme op\u00E9rationnelle \u00E9lectorale 2026" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "login-form", children: [_jsxs("div", { className: "field", children: [_jsx("label", { children: "Identifiant" }), _jsx("input", { autoFocus: true, type: "text", value: login_, onChange: e => setLogin(e.target.value), placeholder: "Username ou email", required: true })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "Mot de passe" }), _jsx("input", { type: "password", value: password, onChange: e => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] }), error && _jsx("div", { className: "login-error", children: error }), _jsx("button", { type: "submit", disabled: loading, className: "login-btn", children: loading ? 'Connexion...' : 'Se connecter' })] })] }) }));
}
