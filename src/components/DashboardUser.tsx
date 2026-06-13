import { useDarkMode } from '../context/DarkModeContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard, getAllRevenus } from '../api/rapports';
import { StatistiquesDashboard, RevenuDTO, Cheptel as CheptelType } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Sprout, Wheat, PawPrint, AlertTriangle, RefreshCw, Package, Calendar } from 'lucide-react';

const DashboardUser: React.FC = () => {
  const { user } = useAuth();
  const dm = useDarkMode(); const c = { cardBg: dm.cardBg, text: dm.text, textSecondary: dm.textSecondary, bg: dm.bg, border: dm.border };
  const [dashboard, setDashboard] = useState<StatistiquesDashboard | null>(null);
  const [revenus, setRevenus] = useState<RevenuDTO[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, revRes] = await Promise.all([getDashboard(), getAllRevenus()]);
      setDashboard(dashRes.data);
      setRevenus(revRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const userName = user?.email?.split('@')[0] || user?.nomComplet || '';
  const alerteMessages: string[] = [];
  if (dashboard && dashboard.nbAlertes > 0) {
    alerteMessages.push(`${dashboard.nbAlertes} stock(s) bas`);
  }
  const hasAlertes = alerteMessages.length > 0;
  const maladesList = dashboard?.malades ?? [];
  const hasMalades = maladesList.length > 0;

  const { t } = useTranslation();

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: 15, flex: 1 }}>
      <div style={styles.welcome}>{t('user.welcome')}, {userName} !</div>

      <div style={styles.cardsRow}>
        <div
          style={{
            ...styles.cardBase,
            backgroundColor: '#ffffff',
            transform: hoveredCard === 'parcelles' ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredCard === 'parcelles' ? '0 6px 12px rgba(0,0,0,0.15)' : '0 3px 5px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={() => setHoveredCard('parcelles')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Sprout size={30} color="#27ae60" />
          <span style={styles.cardLabel}>{t('user.parcelles')}</span>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#27ae60', margin: 0 }}>
            {dashboard?.nbParcelles ?? 0}
          </span>
        </div>

        <div
          style={{
            ...styles.cardBase,
            backgroundColor: '#ffffff',
            transform: hoveredCard === 'cultures' ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredCard === 'cultures' ? '0 6px 12px rgba(0,0,0,0.15)' : '0 3px 5px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={() => setHoveredCard('cultures')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Wheat size={30} color="#3498db" />
          <span style={styles.cardLabel}>{t('user.cultures')}</span>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#3498db', margin: 0 }}>
            {dashboard?.nbCultures ?? 0}
          </span>
        </div>

        <div
          style={{
            ...styles.cardBase,
            backgroundColor: '#ffffff',
            transform: hoveredCard === 'animaux' ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredCard === 'animaux' ? '0 6px 12px rgba(0,0,0,0.15)' : '0 3px 5px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={() => setHoveredCard('animaux')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <PawPrint size={30} color="#e67e22" />
          <span style={styles.cardLabel}>{t('user.animaux')}</span>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#e67e22', margin: 0 }}>
            {dashboard?.nbAnimaux ?? 0}
          </span>
        </div>

        <div
          style={{
            ...styles.cardBase,
            backgroundColor: '#fdebd0',
            transform: hoveredCard === 'alertes' ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredCard === 'alertes' ? '0 6px 12px rgba(0,0,0,0.15)' : '0 3px 5px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={() => setHoveredCard('alertes')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <AlertTriangle size={30} color="#e74c3c" />
          <span style={styles.cardLabel}>{t('user.alertes')}</span>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#e74c3c', margin: 0 }}>
            {dashboard?.nbAlertes ?? 0}
          </span>
        </div>

        <div
          style={{
            ...styles.cardBase,
            backgroundColor: '#d5f5e3',
            transform: hoveredCard === 'revenus' ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredCard === 'revenus' ? '0 6px 12px rgba(0,0,0,0.15)' : '0 3px 5px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={() => setHoveredCard('revenus')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span style={{ fontWeight:'bold', fontSize:22, color:'#27ae60' }}>DT</span>
          <span style={styles.cardLabel}>{t('user.totalRevenus')}</span>
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#27ae60', margin: 0 }}>
            {(dashboard?.totalRevenus ?? 0).toFixed(3)} DT
          </span>
        </div>
      </div>

      <div style={styles.alerteBox}>
        <div style={styles.alerteTitle}>
          <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
          {t('user.alertesImportantes')}
        </div>
        <div style={styles.alerteText}>
          {hasAlertes ? alerteMessages.join('\n') : ''}
        </div>
        {hasMalades && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#c0392b', marginBottom: 6 }}>
              Animaux malades ({maladesList.length})
            </div>
            <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid #e74c3c', borderRadius: 4, backgroundColor: '#ffffff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: '#fdebd0', borderBottom: '1px solid #e74c3c' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: '#c0392b', width: 120 }}>Nom</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: '#c0392b', width: 90 }}>Type</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, color: '#c0392b' }}>Maladie</th>
                  </tr>
                </thead>
                <tbody>
                  {maladesList.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #fdebd0' }}>
                      <td style={{ padding: '4px 8px', fontWeight: 500 }}>{m.nom}</td>
                      <td style={{ padding: '4px 8px' }}>{m.typeAnimal}</td>
                      <td style={{ padding: '4px 8px', color: '#e74c3c' }}>{m.maladie || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={() => navigate('/cheptel', { state: { openRdv: true } })} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: 4, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={14} /> Prendre RDV vétérinaire →
              </button>
            </div>
          </div>
        )}
        {!hasAlertes && !hasMalades && (
          <div style={styles.alerteText}>Aucune alerte pour le moment</div>
        )}
      </div>

      <div style={styles.revenuCard}>
        <div style={styles.revenuTitle}>
          <span style={{ fontWeight:'bold', fontSize:13, verticalAlign:'middle', marginRight:5 }}>DT</span>
          {t('user.listeRevenus')}
        </div>

        <div style={styles.summaryRow}>
          <div style={{ ...styles.summaryCard, backgroundColor: '#d5f5e3' }}>
            <p style={styles.summaryLabel}><Package size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} /> {t('user.stock')}</p>
            <p style={{ ...styles.summaryValue, color: '#27ae60' }}>
              {(dashboard?.revenusStock ?? 0).toFixed(3)} DT
            </p>
          </div>
          <div style={{ ...styles.summaryCard, backgroundColor: '#d6eaf8' }}>
            <p style={styles.summaryLabel}><PawPrint size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} /> {t('user.cheptel')}</p>
            <p style={{ ...styles.summaryValue, color: '#3498db' }}>
              {(dashboard?.revenusCheptel ?? 0).toFixed(3)} DT
            </p>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 250 }}>{t('user.source')}</th>
                <th style={{ ...styles.th, width: 120 }}>{t('user.montant')} (DT)</th>
                <th style={{ ...styles.th, width: 120 }}>{t('user.date')}</th>
                <th style={{ ...styles.th, width: 350 }}>{t('user.description')}</th>
              </tr>
            </thead>
            <tbody>
              {revenus.map((r, i) => (
                <tr key={i}>
                  <td style={styles.td}>{r.source}</td>
                  <td style={styles.td}>{r.montant.toFixed(3)}</td>
                  <td style={styles.td}>{r.date}</td>
                  <td style={styles.td}>{r.description}</td>
                </tr>
              ))}
              {revenus.length === 0 && (
                <tr>
                  <td style={{ ...styles.td, textAlign: 'center', color: '#95a5a6' }} colSpan={4}>
                    Aucun revenu enregistré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={loadData}
            style={{ ...styles.refreshBtn, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2980b9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3498db'; }}
          >
            <RefreshCw size={13} /> {t('user.actualiser')}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  welcome: {
    color: '#2c3e50',
    fontSize: 20,
    fontWeight: 'bold',
    margin: 0,
  },
  cardsRow: {
    display: 'flex',
    gap: 15,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  cardBase: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    borderRadius: 8,
    padding: 10,
    boxShadow: '0 3px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    gap: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    margin: '3px 0',
  },
  alerteBox: {
    backgroundColor: '#fdebd0',
    borderRadius: 8,
    padding: 10,
    border: '1px solid #e74c3c',
  },
  alerteTitle: {
    fontWeight: 'bold',
    color: '#e74c3c',
    margin: '0 0 5px 0',
    fontSize: 14,
  },
  alerteText: {
    fontSize: 12,
    color: '#c0392b',
    margin: 0,
    whiteSpace: 'pre-line',
  },
  revenuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    boxShadow: '0 3px 5px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  revenuTitle: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: 'bold',
    margin: 0,
  },
  summaryRow: {
    display: 'flex',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 5,
    padding: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11,
    margin: 0,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: 'bold',
    margin: 0,
  },
  tableContainer: {
    maxHeight: 320,
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
    tableLayout: 'fixed',
  },
  th: {
    padding: 8,
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #dee2e6',
    backgroundColor: '#f8f9fa',
  },
  td: {
    padding: '6px 8px',
    borderBottom: '1px solid ' + '#dee2e6',
  },
  refreshBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: 12,
    transition: 'background-color 0.2s',
  },
};

export default DashboardUser;
