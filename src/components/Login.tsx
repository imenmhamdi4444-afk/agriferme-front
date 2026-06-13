import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs !');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#2c3e50',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'System-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        padding: 20,
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative background pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 10,
          width: 300,
          minHeight: 340,
          boxShadow: '0 15px 50px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.1)',
          position: 'relative',
          padding: 0,
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Title */}
        <div
          style={{
            paddingLeft: 69,
            paddingTop: 44,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#2c3e50',
            letterSpacing: '0.5px',
            userSelect: 'none',
          }}
        >
          🌾 {t('login.title')}
        </div>

        {/* Separator */}
        <div
          style={{
            marginLeft: 30,
            marginTop: 7,
            width: 240,
            height: 1,
            backgroundColor: '#bdc3c7',
          }}
        />

        <form onSubmit={handleSubmit} style={{ margin: 0, padding: 0 }}>
          {/* Email Label */}
          <div
            style={{
              paddingLeft: 40,
              paddingTop: 32,
              fontSize: 14,
              color: '#7f8c8d',
              fontWeight: 500,
              userSelect: 'none',
            }}
          >
            {t('login.email')}
          </div>

          {/* Email Field */}
          <div style={{ paddingLeft: 40, paddingTop: 5 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.placeholderEmail')}
              style={{
                width: 220,
                height: 35,
                padding: '0 12px',
                borderRadius: 5,
                border: '1px solid #bdc3c7',
                fontSize: 13,
                color: '#2c3e50',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                backgroundColor: '#fafafa',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#27ae60';
                e.target.style.boxShadow = '0 0 0 3px rgba(39,174,96,0.15)';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#bdc3c7';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#fafafa';
              }}
            />
          </div>

          {/* Password Label */}
          <div
            style={{
              paddingLeft: 40,
              paddingTop: 25,
              fontSize: 14,
              color: '#7f8c8d',
              fontWeight: 500,
              userSelect: 'none',
            }}
          >
            {t('login.password')}
          </div>

          {/* Password Field */}
          <div style={{ paddingLeft: 40, paddingTop: 5 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.placeholderPassword')}
              style={{
                width: 220,
                height: 35,
                padding: '0 12px',
                borderRadius: 5,
                border: '1px solid #bdc3c7',
                fontSize: 13,
                color: '#2c3e50',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                backgroundColor: '#fafafa',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#27ae60';
                e.target.style.boxShadow = '0 0 0 3px rgba(39,174,96,0.15)';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#bdc3c7';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#fafafa';
              }}
            />
          </div>

          {/* Error Label */}
          {error && (
            <div
              style={{
                paddingLeft: 40,
                paddingTop: 12,
                width: 220,
                color: '#e74c3c',
                fontSize: 12,
                lineHeight: '14px',
                animation: 'shake 0.4s ease',
              }}
            >
              {error}
            </div>
          )}

          {/* Connect Button */}
          <div style={{ paddingLeft: 40, paddingTop: error ? 8 : 28 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: 220,
                height: 35,
                borderRadius: 5,
                border: 'none',
                fontSize: 14,
                fontWeight: 'bold',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading
                  ? '#27ae60'
                  : 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                boxShadow: loading
                  ? 'none'
                  : '0 4px 15px rgba(39,174,96,0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                letterSpacing: '0.5px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #219a52 0%, #27ae60 100%)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 20px rgba(39,174,96,0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 15px rgba(39,174,96,0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ animation: 'spin 0.8s linear infinite' }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.25"
                    />
                    <path
                      d="M12 2a10 10 0 019.95 9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  {t('login.loading')}
                </>
              ) : (
                t('login.connect')
              )}
            </button>
          </div>
        </form>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#27ae60', fontSize: 14, fontWeight: 600, textDecoration: 'underline' }}>
              Mot de passe oublie ?
            </button>
          </div>

        {/* Footer */}
        <div
          style={{
            paddingLeft: 100,
            paddingTop: 22,
            paddingBottom: 18,
            fontSize: 10,
            color: '#95a5a6',
            userSelect: 'none',
            letterSpacing: '0.3px',
          }}
        >
          {t('app.copyright')}
        </div>
      </div>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
