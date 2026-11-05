'use client';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from '../lib/router';
import { LockKeyhole, ShoppingBag, Zap } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useShop } from '../context/ShopContext';

export default function LoginPage() {
  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, logout } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const path = registerMode ? '/auth/register' : '/auth/login';
      const response = await api.post(path, { name, email, password });
      signIn(response.data);
      navigate(new URLSearchParams(window.location.search).get('from') || '/');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  if (user) {
    return <div className="auth-page"><div className="auth-card"><h1>Hello, {user.name}!</h1><p>You're signed in as {user.email}.</p><Link to="/orders" className="primary-button">View your orders</Link><button className="text-button" onClick={logout}>Sign out</button></div></div>;
  }

  return (
    <div className="auth-page"><div className="auth-card">
      <div className="auth-icon"><LockKeyhole size={29} /></div>
      <h1>{registerMode ? 'Create your account' : 'Welcome back!'}</h1>
      <p>{registerMode ? 'Join QuickShop and start ordering.' : 'Sign in to checkout and track orders.'}</p>
      <form onSubmit={handleSubmit}>
        {registerMode && <label>Full name<input value={name} onChange={event => setName(event.target.value)} required minLength={2} placeholder="Your full name" /></label>}
        <label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="you@example.com" /></label>
        <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={6} required placeholder="At least 6 characters" /></label>
        {error && <div className="inline-error">{error}</div>}
        <button type="submit" className="primary-button full-width" disabled={loading}>{loading ? 'Please wait...' : registerMode ? 'Create account' : 'Sign in'}</button>
      </form>
      <p className="switch-auth">{registerMode ? 'Already have an account?' : 'New to QuickShop?'} <button type="button" onClick={() => { setRegisterMode(!registerMode); setError(''); }}>{registerMode ? 'Sign in' : 'Create account'}</button></p>
    </div></div>
  );
}
