import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useDarkMode } from '../context/DarkModeContext';
import { LogOut, LayoutDashboard, Sprout, Wheat, Package, Beef, BarChart3, Shield, User, Menu, X, Globe, Moon, Sun as SunIcon } from 'lucide-react';
import { LANGUAGES } from '../i18n/translations';
import NotificationBell from './NotificationBell';
import WeatherWidget from './WeatherWidget';

const userNavItems = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/parcelles', labelKey: 'nav.parcelles', icon: Sprout },
  { path: '/cultures', labelKey: 'nav.cultures', icon: Wheat },
  { path: '/stock', labelKey: 'nav.stock', icon: Package },
  { path: '/cheptel', labelKey: 'nav.cheptel', icon: Beef },
  { path: '/rapports', labelKey: 'nav.rapports', icon: BarChart3 },
  { path: '/profile', labelKey: 'nav.profile', icon: User },
];

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, lang, setLang, dir } = useTranslation();
  const { darkMode, toggleDarkMode, bg, navBg, subNavBg, text, cardBg, border } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: bg, color: text }} dir={dir}>

      {/* Main navbar */}
      <div style={{
        backgroundColor: navBg, padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 100,
        position: 'sticky', top: 0, flexWrap: 'wrap',
      }}>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} className="mobile-menu-btn">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <Sprout size={24} color="#27ae60" />
          <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            {t('app.title')}{user?.role === 'ADMIN' ? ' - ADMIN' : ''}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Weather widget */}
        <div className="hide-mobile">
          <WeatherWidget />
        </div>

        {/* Dark mode toggle */}
        <button onClick={toggleDarkMode} title={darkMode ? 'Mode clair' : 'Mode sombre'} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: 'white',
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
        }}>
          {darkMode ? <SunIcon size={16} /> : <Moon size={16} />}
        </button>

        {/* Language selector */}
        <div style={{ position: 'relative' }}>
          <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} style={{
            backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6,
            padding: '6px 28px 6px 10px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', outline: 'none', appearance: 'none',
          }}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} style={{ color: '#2c3e50', backgroundColor: 'white' }}>{l.native}</option>
            ))}
          </select>
          <Globe size={13} color="white" style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* User email - clickable to profile */}
        {user && (
          <div onClick={() => navigate('/profile')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#ecf0f1', fontSize: 13, cursor: 'pointer',
            padding: '4px 8px', borderRadius: 6, transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <User size={15} />
            <span>{user.email}</span>
          </div>
        )}

        <button onClick={handleLogout} style={{
          backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: 6,
          padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 5,
        }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#c0392b'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e74c3c'}>
          <LogOut size={15} /> {t('app.logout')}
        </button>
      </div>

      {/* Sub navbar for user */}
      {user?.role !== 'ADMIN' && (
        <div style={{
          backgroundColor: subNavBg, padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 99, position: 'sticky', top: 52,
        }}>
          {userNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white', border: 'none', borderRadius: 6,
                  padding: '7px 12px', cursor: 'pointer', fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  display: 'flex', alignItems: 'center', gap: 6,
                  borderBottom: active ? '2px solid #27ae60' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = active ? 'rgba(255,255,255,0.2)' : 'transparent'; }}>
                <Icon size={15} /> {t(item.labelKey)}
              </button>
            );
          })}
        </div>
      )}

      {/* Page content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: bg, color: text }}>
        <Outlet />
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: darkMode ? navBg : '#bdc3c7', padding: '5px 20px', display: 'flex', alignItems: 'center', fontSize: 12, color: darkMode ? '#ecf0f1' : '#2c3e50', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {user?.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
          <span>{t('app.connectedAs')} {user?.role === 'ADMIN' ? t('app.admin') : t('app.agriculteur')}</span>
        </div>
        <div style={{ flex: 1 }} />
        <span>{t('app.copyright')}</span>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;