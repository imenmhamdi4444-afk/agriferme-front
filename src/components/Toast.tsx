import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: '#d5f5e3', border: '#27ae60', icon: '✅' },
  error:   { bg: '#fadbd8', border: '#e74c3c', icon: '❌' },
  warning: { bg: '#fdebd0', border: '#e67e22', icon: '⚠️' },
  info:    { bg: '#d6eaf8', border: '#3498db', icon: 'ℹ️' },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const c = colors[type];

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      backgroundColor: c.bg, border: `2px solid ${c.border}`,
      borderRadius: 8, padding: '12px 18px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', gap: 10,
      minWidth: 280, maxWidth: 400,
      animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: 18 }}>{c.icon}</span>
      <span style={{ flex: 1, fontSize: 14, color: '#2c3e50', fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 16, color: '#7f8c8d', padding: '0 4px',
      }}>✕</button>
    </div>
  );
};

export default Toast;