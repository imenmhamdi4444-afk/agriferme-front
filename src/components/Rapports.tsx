import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIndicateurs, getDepenses, getRevenus, getCultures } from '../api/rapports';
import { IndicateursFinanciers, Stock, Cheptel, Culture } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { BarChart3, TrendingDown, TrendingUp, Calendar, PieChart as PieChartIcon, RefreshCw, Sprout, Heart, Package } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS_DEPENSES = ['#e74c3c', '#c0392b', '#e67e22', '#d35400'];
const COLORS_REVENUS = ['#27ae60', '#2ecc71', '#1e8449', '#229954'];

const Rapports: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [indicateurs, setIndicateurs] = useState<IndicateursFinanciers | null>(null);
  const [depenses, setDepenses] = useState<Stock[]>([]);
  const [revenus, setRevenus] = useState<Cheptel[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [annee, setAnnee] = useState(2025);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [iRes, dRes, rRes, cRes] = await Promise.all([getIndicateurs(), getDepenses(), getRevenus(), getCultures()]);
      setIndicateurs(iRes.data);
      setDepenses(dRes.data);
      setRevenus(rRes.data);
      setCultures(cRes.data);
    } catch (err) { console.error(err); }
  };

  const depensesData = depenses.map((d) => ({ name: d.nomProduit, value: d.prixTotal || 0 }));
  const revenusData = revenus.map((r) => ({ name: r.nom, value: r.prixTotal || 0 }));

  const categories = [...new Set([...depenses.map((d) => d.nomProduit), ...revenus.map((r) => r.nom)])];
  const barData = categories.map((cat) => {
    const dep = depenses.find((d) => d.nomProduit === cat);
    const rev = revenus.find((r) => r.nom === cat);
    return {
      name: cat,
      'Dépenses (Stock)': dep?.prixTotal || 0,
      'Revenus (Cheptel)': rev?.prixTotal || 0,
    };
  });

  const ipt: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 6, border: '1.5px solid #bdc3c7',
    fontSize: 14, backgroundColor: 'white', outline: 'none',
  };

  const cardHover = (e: React.MouseEvent<HTMLDivElement>, enter: boolean) => {
    e.currentTarget.style.transform = enter ? 'translateY(-3px)' : 'translateY(0)';
    e.currentTarget.style.boxShadow = enter ? '0 6px 20px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.1)';
  };

  return (
    <div style={{ padding: '20px 24px', flex: 1 }}>
      <h2 style={{ color: '#2c3e50', fontSize: 28, fontWeight: 'bold', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <BarChart3 size={28} /> {t('rapports.title')}
      </h2>

      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { icon: () => <span style={{fontWeight:'bold',fontSize:14,color:'#27ae60'}}>DT</span>, color: '#27ae60', label: t('rapports.revenus'), value: `${(indicateurs?.totalRevenus ?? 0).toFixed(3)} DT` },
          { icon: TrendingDown, color: '#e74c3c', label: t('rapports.depenses'), value: `${(indicateurs?.totalDepenses ?? 0).toFixed(3)} DT` },
          { icon: TrendingUp, color: '#3498db', label: t('rapports.benefice'), value: `${(indicateurs?.benefice ?? 0).toFixed(3)} DT` },
          { icon: BarChart3, color: '#2c3e50', label: t('rapports.marge'), value: `${(indicateurs?.marge ?? 0).toFixed(1)}%` },
          { icon: Calendar, color: '#2c3e50', label: t('rapports.annee'), value: annee },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} style={{
              backgroundColor: 'white', borderRadius: 10, padding: '16px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s',
              textAlign: 'center', flex: 1, minWidth: 150, cursor: 'default',
            }}
              onMouseEnter={(e) => cardHover(e, true)}
              onMouseLeave={(e) => cardHover(e, false)}>
              <p style={{ fontSize: 14, fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#7f8c8d' }}>
                <Icon size={18} color={item.color} /> {item.label}
              </p>
              <p style={{ fontSize: 22, color: item.color, fontWeight: 'bold', margin: 0 }}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          backgroundColor: 'white', borderRadius: 10, padding: 18, flex: 1, minWidth: 350,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s',
        }}
          onMouseEnter={(e) => cardHover(e, true)}
          onMouseLeave={(e) => cardHover(e, false)}>
          <p style={{ fontSize: 15, fontWeight: 'bold', color: '#e74c3c', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <PieChartIcon size={18} /> {t('rapports.depensesProduit')}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={depensesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name} (${value.toFixed(0)} DT)`}>
                {depensesData.map((_, i) => <Cell key={i} fill={COLORS_DEPENSES[i % COLORS_DEPENSES.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          backgroundColor: 'white', borderRadius: 10, padding: 18, flex: 1, minWidth: 350,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s',
        }}
          onMouseEnter={(e) => cardHover(e, true)}
          onMouseLeave={(e) => cardHover(e, false)}>
          <p style={{ fontSize: 15, fontWeight: 'bold', color: '#27ae60', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <PieChartIcon size={18} /> {t('rapports.revenusAnimal')}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={revenusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name} (${value.toFixed(0)} DT)`}>
                {revenusData.map((_, i) => <Cell key={i} fill={COLORS_REVENUS[i % COLORS_REVENUS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white', borderRadius: 10, padding: 18, marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s',
      }}
        onMouseEnter={(e) => cardHover(e, true)}
        onMouseLeave={(e) => cardHover(e, false)}>
        <p style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart3 size={18} /> {t('rapports.comparaison')}
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 13 }} label={{ value: t('rapports.montant'), angle: -90, position: 'insideLeft', style: { fontSize: 13 } }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 13 }} formatter={(value) => value === 'Revenus (Cheptel)' ? t('rapports.revenusAnimal') : t('rapports.depensesProduit')} />
            <Bar dataKey="Revenus (Cheptel)" fill="#27ae60" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Dépenses (Stock)" fill="#e74c3c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cultures by status */}
      <div style={{ display: 'flex', gap: 25, flexWrap: 'wrap', marginTop: 5 }}>
        <div style={{
          backgroundColor: 'white', borderRadius: 10, padding: 18, flex: 1, minWidth: 300,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s',
        }}
          onMouseEnter={(e) => cardHover(e, true)}
          onMouseLeave={(e) => cardHover(e, false)}>
          <p style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sprout size={18} /> Cultures par statut
          </p>
          {(() => {
            const statusCount: Record<string, number> = {};
            cultures.forEach((c) => {
              statusCount[c.statut] = (statusCount[c.statut] || 0) + 1;
            });
            const data = Object.entries(statusCount).map(([name, value]) => ({ name, value }));
            return data.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7f8c8d' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#7f8c8d' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={['#3498db', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6'][i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: '#95a5a6', textAlign: 'center', padding: 30, fontSize: 13 }}>Aucune culture</p>;
          })()}
        </div>

        <div style={{
          backgroundColor: 'white', borderRadius: 10, padding: 18, flex: 1, minWidth: 300,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s',
        }}
          onMouseEnter={(e) => cardHover(e, true)}
          onMouseLeave={(e) => cardHover(e, false)}>
          <p style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Heart size={18} /> Santé des animaux
          </p>
          {(() => {
            const healthCount: Record<string, number> = {};
            revenus.forEach((a) => {
              const sante = a.etatSante || 'Inconnu';
              healthCount[sante] = (healthCount[sante] || 0) + 1;
            });
            const data = Object.entries(healthCount).map(([name, value]) => ({ name, value }));
            const COLORS_HEALTH: Record<string, string> = { 'Bon': '#27ae60', 'Malade': '#e74c3c', 'Critique': '#f39c12', 'Inconnu': '#95a5a6' };
            return data.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 260 }}>
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                      {data.map((d) => <Cell key={d.name} fill={COLORS_HEALTH[d.name] || '#95a5a6'} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.map((d) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS_HEALTH[d.name] || '#95a5a6' }} />
                      {d.name}: <strong>{d.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p style={{ color: '#95a5a6', textAlign: 'center', padding: 30, fontSize: 13 }}>Aucun animal</p>;
          })()}
        </div>
      </div>

      {/* Animals by type */}
      <div style={{ marginTop: 5 }}>
        <div style={{
          backgroundColor: 'white', borderRadius: 10, padding: 18, flex: 1, minWidth: 300,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s',
        }}
          onMouseEnter={(e) => cardHover(e, true)}
          onMouseLeave={(e) => cardHover(e, false)}>
          <p style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package size={18} /> Animaux par type
          </p>
          {(() => {
            const typeCount: Record<string, number> = {};
            revenus.forEach((a) => {
              const type = a.typeAnimal || 'Inconnu';
              typeCount[type] = (typeCount[type] || 0) + 1;
            });
            const data = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
            const COLORS_TYPES = ['#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#f39c12', '#2c3e50'];
            return data.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#7f8c8d' }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#7f8c8d' }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS_TYPES[i % COLORS_TYPES.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: '#95a5a6', textAlign: 'center', padding: 30, fontSize: 13 }}>Aucun animal</p>;
          })()}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#2c3e50' }}>{t('rapports.filterAnnee')}</span>
        <select value={annee} onChange={(e) => setAnnee(Number(e.target.value))} style={ipt}>
          <option>2024</option><option>2025</option><option>2026</option>
        </select>
        <button onClick={load} style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.25s' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a252f'; e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2c3e50'; e.currentTarget.style.transform = 'scale(1)'; }}>
          <RefreshCw size={16} /> {t('rapports.actualiser')}
        </button>
      </div>
    </div>
  );
};

export default Rapports;
