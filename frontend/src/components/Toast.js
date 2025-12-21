import React, { useState, useEffect } from 'react';
import '../App.css';

function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' 
    ? 'rgba(93, 214, 164, 0.15)' 
    : type === 'error'
    ? 'rgba(255, 117, 117, 0.15)'
    : 'rgba(122, 162, 255, 0.15)';
  
  const borderColor = type === 'success'
    ? 'var(--accent)'
    : type === 'error'
    ? 'var(--danger)'
    : 'var(--accent-2)';

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 20px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        color: 'var(--text)',
        fontWeight: '600',
        fontSize: '14px',
        zIndex: 10000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '400px',
        wordWrap: 'break-word'
      }}
    >
      {message}
    </div>
  );
}

export default Toast;

