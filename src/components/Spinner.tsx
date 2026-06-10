import React from 'react';

interface SpinnerProps {
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = 'Chargement...' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 12,
  }}>
    <div style={{
      width: 36, height: 36,
      border: '4px solid #ecf0f1',
      borderTop: '4px solid #27ae60',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{ color: '#7f8c8d', fontSize: 14 }}>{message}</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
  </div>
);

export default Spinner;