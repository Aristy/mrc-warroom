import { useState, type FormEvent } from 'react';
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(login_, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? 'Identifiants incorrects' : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-flag">🇨🇬</span>
          <h1>MRC War Room</h1>
          <p>Plateforme opérationnelle électorale 2026</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Identifiant</label>
            <input autoFocus type="text" value={login_} onChange={e => setLogin(e.target.value)} placeholder="Username ou email" required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
