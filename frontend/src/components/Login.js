import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', formData);
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="panel" style={{ maxWidth: '420px', width: '100%', margin: '20px' }}>
        <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>
          Budget Quest
        </h1>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>
        
        {error && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '16px', 
            background: 'rgba(255, 117, 117, 0.15)', 
            border: '1px solid var(--danger)', 
            borderRadius: '8px',
            color: 'var(--danger)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              style={{ width: '100%', marginBottom: '14px' }}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              style={{ width: '100%', marginBottom: '20px' }}
            />
          </label>

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginBottom: '14px' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
