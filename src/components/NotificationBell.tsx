import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, Heart, Wheat, X } from 'lucide-react';
import { getNotifications } from '../api/profile';

interface Notification {
  type: string;
  severity: string;
  message: string;
  icon: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const load = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
      setCount(res.data.count || 0);
    } catch {}
  };

  const colors: Record<string, string> = {
    warning: '#e67e22',
    error: '#e74c3c',
    info: '#3498db',
    success: '#27ae60',
  };

  const icons: Record<string, React.ReactNode> = {
    package: <Package size={16} />,
    heart: <Heart size={16} />,
    wheat: <Wheat size={16} />,
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', padding: '4px 8px', display: 'flex', alignItems: 'center',
        }}
      >
        <Bell size={22} color="white" />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            backgroundColor: '#e74c3c', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 1000,
          backgroundColor: 'white', borderRadius: 10, width: 320,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          border: '1px solid #ecf0f1',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #ecf0f1',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#2c3e50' }}>
              Notifications {count > 0 && `(${count})`}
            </span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#7f8c8d" />
            </button>
          </div>

          <div style={{ maxHeight: 350, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#7f8c8d', fontSize: 14 }}>
                ✅ Aucune alerte pour le moment
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f8f9fa',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{
                    color: colors[n.severity] || '#7f8c8d',
                    marginTop: 2, flexShrink: 0,
                  }}>
                    {icons[n.icon] || <Bell size={16} />}
                  </span>
                  <span style={{ fontSize: 13, color: '#2c3e50', lineHeight: 1.4 }}>
                    {n.message}
                  </span>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '8px 16px', borderTop: '1px solid #ecf0f1', textAlign: 'center' }}>
            <button onClick={load} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: '#3498db', fontWeight: 600,
            }}>
              Actualiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;