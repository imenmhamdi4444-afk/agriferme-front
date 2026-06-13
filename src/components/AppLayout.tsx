import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useDarkMode } from '../context/DarkModeContext';
import { Bell, AlertTriangle, AlertCircle, LogOut, LayoutDashboard, Sprout, Wheat, Package, Beef, BarChart3, Shield, User, Menu, X, Globe, Moon, Sun as SunIcon } from 'lucide-react';
import { LANGUAGES } from '../i18n/translations';
import { getStock } from '../api/stock';
import { getCheptels } from '../api/cheptel';

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
  const { t, lang, setLang, dir } = useTranslation();
  const { darkMode, toggleDarkMode, bg, navBg, subNavBg, text, cardBg, border } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path: string) => location.pathname === path;

  const [alerts, setAlerts] = React.useState<{ type: 'stock' | 'cheptel'; nom: string; detail: string; link: string }[]>([]);
  const [showNotif, setShowNotif] = React.useState(false);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;
      setNotifLoading(true);
      try {
        const [stockRes, cheptelRes] = await Promise.all([getStock(), getCheptels()]);
        const stocks = Array.isArray(stockRes.data) ? stockRes.data : [];
        const cheptels = Array.isArray(cheptelRes.data) ? cheptelRes.data : [];
        const items: { type: 'stock' | 'cheptel'; nom: string; detail: string; link: string }[] = [];
        stocks.forEach((s: any) => {
          const qty = parseFloat(s.quantite) || 0;
          const seuil = parseFloat(s.seuilAlerte ?? s.seuil_alerte) || 0;
          if (seuil > 0 && qty <= seuil) {
            items.push({ type: 'stock', nom: s.nomProduit, detail: `${qty}/${seuil} ${s.unite || ''}`, link: '/stock' });
          }
        });
        cheptels.forEach((c: any) => {
          if (c.etatSante === 'Malade' || c.etat_sante === 'Malade') {
            items.push({ type: 'cheptel', nom: c.nom, detail: c.typeAnimal, link: '/cheptel' });
          }
        });
        setAlerts(items);
      } catch { /* ignore */ } finally { setNotifLoading(false); }
    };
    fetchAlerts();
  }, [user]);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

        {/* Notifications */}
        {user && (
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              style={{
                background: 'none', border: 'none', color: 'white', cursor: 'pointer',
                padding: '6px 10px', borderRadius: 6, position: 'relative',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              <Bell size={18} />
              {alerts.length > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 2,
                  backgroundColor: '#e74c3c', color: 'white',
                  fontSize: 10, fontWeight: 700,
                  minWidth: 16, height: 16,
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {alerts.length}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{
                position: 'fixed', top: 60, right: 16,
                width: 360, maxHeight: 400, overflowY: 'auto',
                backgroundColor: '#ffffff', borderRadius: 10, border: '1px solid #dee2e6',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                zIndex: 99999,
              }}>
                <div style={{
                  padding: '12px 16px', borderBottom: '1px solid #eee',
                  fontSize: 14, fontWeight: 700, color: '#2c3e50', backgroundColor: '#ffffff',
                }}>
                  {t('notif.title')} ({alerts.length})
                </div>
                {notifLoading ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#95a5a6', fontSize: 13 }}>
                    {t('notif.loading')}
                  </div>
                ) : alerts.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#95a5a6', fontSize: 13 }}>
                    {t('notif.empty')}
                  </div>
                ) : (
                  alerts.map((a, i) => (
                    <div
                      key={i}
                      onClick={() => { navigate(a.link); setShowNotif(false); }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      style={{
                        padding: '10px 16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        borderBottom: i < alerts.length - 1 ? '1px solid #f5f5f5' : 'none',
                        transition: 'background 0.2s',
                      }}
                    >
                      {a.type === 'stock' ? (
                        <AlertTriangle size={18} color="#e67e22" style={{ flexShrink: 0, marginTop: 2 }} />
                      ) : (
                        <AlertCircle size={18} color="#e74c3c" style={{ flexShrink: 0, marginTop: 2 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#2c3e50', fontWeight: 500 }}>
                          {a.type === 'stock' ? t('notif.stockBas') : t('notif.animalMalade')}: <strong>{a.nom}</strong>
                        </div>
                        <div style={{ fontSize: 11, color: '#95a5a6', marginTop: 2 }}>
                          {a.detail}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
