import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      onRegister(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Register</h2>
        
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
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
              style={{ width: '100%', marginBottom: '14px' }}
              minLength="3"
            />
          </label>

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
              placeholder="At least 6 characters"
              style={{ width: '100%', marginBottom: '14px' }}
              minLength="6"
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              style={{ width: '100%', marginBottom: '20px' }}
            />
          </label>

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginBottom: '14px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
