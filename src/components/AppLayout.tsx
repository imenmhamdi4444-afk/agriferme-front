import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { LogOut, LayoutDashboard, Sprout, Wheat, Package, Beef, BarChart3, Shield, User, Menu, X, Globe } from 'lucide-react';
import { LANGUAGES } from '../i18n/translations';

const userNavItems = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/parcelles', labelKey: 'nav.parcelles', icon: Sprout },
  { path: '/cultures', labelKey: 'nav.cultures', icon: Wheat },
  { path: '/stock', labelKey: 'nav.stock', icon: Package },
  { path: '/cheptel', labelKey: 'nav.cheptel', icon: Beef },
  { path: '/rapports', labelKey: 'nav.rapports', icon: BarChart3 },
];

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, lang, setLang, isRTL, dir } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ecf0f1' }} dir={dir}>
      <div style={{
        backgroundColor: '#2c3e50',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 100,
        position: 'sticky',
        top: 0,
      }}>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none', border: 'none', color: 'white', cursor: 'pointer',
            padding: 4,
          }}
          className="mobile-menu-btn"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div
          onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <Sprout size={26} color="#27ae60" />
          <span style={{ color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }}>
            {t('app.title')}{user?.role === 'ADMIN' ? ' - ADMIN' : ''}
          </span>
        </div>
        <div style={{ flex: 1 }} />

        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 6,
              padding: '6px 30px 6px 10px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} style={{ color: '#2c3e50', backgroundColor: 'white' }}>
                {l.native}
              </option>
            ))}
          </select>
          <Globe size={14} color="white" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }} />
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ecf0f1', fontSize: 13 }}>
            <User size={15} />
            <span>{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c0392b'; e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; e.currentTarget.style.transform = 'scale(1)'; }}
          style={{
            backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: 6,
            padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.3s ease',
          }}
        >
          <LogOut size={15} /> {t('app.logout')}
        </button>
      </div>

      {user?.role !== 'ADMIN' && (
        <div style={{
          backgroundColor: '#34495e',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 99,
          position: 'sticky',
          top: 52,
        }}>
          {userNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  transition: 'all 0.25s ease',
                  borderBottom: active ? '2px solid #27ae60' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                {t(item.labelKey)}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>

      <div style={{
        backgroundColor: '#bdc3c7',
        padding: '5px 20px',
        display: 'flex',
        alignItems: 'center',
        fontSize: 11,
        color: '#2c3e50',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {user?.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
          <span>{t('app.connectedAs')} {user?.role === 'ADMIN' ? t('app.admin') : t('app.agriculteur')}</span>
        </div>
        <div style={{ flex: 1 }} />
        <span>{t('app.copyright')}</span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
