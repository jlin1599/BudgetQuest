import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';

function Header({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="app-header">
      <h1>Budget Quest</h1>
      <nav>
        <Link 
          to="/" 
          style={{ 
            color: isActive('/') ? 'var(--accent)' : 'var(--text)', 
            textDecoration: 'none', 
            borderBottom: isActive('/') ? '2px solid var(--accent)' : 'none',
            paddingBottom: '2px'
          }}
        >
          Dashboard
        </Link>
        <Link 
          to="/goals" 
          style={{ 
            color: isActive('/goals') ? 'var(--accent)' : 'var(--text)', 
            textDecoration: 'none', 
            borderBottom: isActive('/goals') ? '2px solid var(--accent)' : 'none',
            paddingBottom: '2px'
          }}
        >
          Quests
        </Link>
        <Link 
          to="/transactions" 
          style={{ 
            color: isActive('/transactions') ? 'var(--accent)' : 'var(--text)', 
            textDecoration: 'none', 
            borderBottom: isActive('/transactions') ? '2px solid var(--accent)' : 'none',
            paddingBottom: '2px'
          }}
        >
          Transactions
        </Link>
        <Link 
          to="/achievements" 
          style={{ 
            color: isActive('/achievements') ? 'var(--accent)' : 'var(--text)', 
            textDecoration: 'none', 
            borderBottom: isActive('/achievements') ? '2px solid var(--accent)' : 'none',
            paddingBottom: '2px'
          }}
        >
          Achievements
        </Link>
      </nav>
      <div className="header-actions">
        <div className="coins">🪙 {user?.coins || 0}</div>
        <button 
          onClick={onLogout} 
          className="btn small"
          style={{ background: 'var(--danger)' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
