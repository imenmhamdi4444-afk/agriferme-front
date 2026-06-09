import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCultures, createCulture, updateCulture, deleteCulture } from '../api/cultures';
import { getParcelles } from '../api/parcelles';
import { Culture, Parcelle } from '../types';
import { useAuth } from '../context/AuthContext';
import { Wheat, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const statutOptions = ['PlanifiÃ©e', 'En cours', 'RÃ©coltÃ©e', 'TerminÃ©e'];
const statutLabels: Record<string, string> = {
  'PlanifiÃ©e': 'cultures.planifiee',
  'En cours': 'cultures.enCours',
  'RÃ©coltÃ©e': 'cultures.recoltee',
  'TerminÃ©e': 'cultures.terminee',
};

const Cultures: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [nom, setNom] = useState('');
  const [dateSemis, setDateSemis] = useState('');
  const [dateRecolte, setDateRecolte] = useState('');
  const [parcelleId, setParcelleId] = useState<number | string>('');
  const [statut, setStatut] = useState('PlanifiÃ©e');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [cRes, pRes] = await Promise.all([getCultures(), getParcelles()]);
      setCultures(cRes.data);
      setParcelles(pRes.data);
    } catch (err) { console.error(err); }
  };

  const resetForm = () => { setNom(''); setDateSemis(''); setDateRecolte(''); setParcelleId(''); setStatut('PlanifiÃ©e'); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { nom, dateSemis, dateRecoltePrevue: dateRecolte, parcelleId: parcelleId ? Number(parcelleId) : null, statut };
      if (editingId) {
        await updateCulture(editingId, data);
      } else {
        await createCulture(data);
      }
      resetForm();
      load();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (c: Culture) => {
    setEditingId(c.id);
    setNom(c.nom);
    setDateSemis(c.dateSemis || '');
    setDateRecolte(c.dateRecoltePrevue || '');
    setParcelleId(c.parcelleId ?? '');
    setStatut(c.statut || 'PlanifiÃ©e');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('cultures.confirmDelete'))) {
      await deleteCulture(id);
      load();
    }
  };

  const getStatutColor = (s: string) => {
    switch (s) {
      case 'RÃ©coltÃ©e': return '#27ae60';
      case 'TerminÃ©e': return '#3498db';
      case 'En cours': return '#e67e22';
      default: return '#95a5a6';
    }
  };

  const ipt = { padding: '8px 12px', borderRadius: 5, border: '1.5px solid #bdc3c7', fontSize: 13, color: '#2c3e50', backgroundColor: 'white', outline: 'none', transition: 'all 0.3s ease', boxSizing: 'border-box' as const, height: 38 };
  const sel = { padding: '8px 12px', borderRadius: 5, border: '1.5px solid #bdc3c7', fontSize: 13, color: '#2c3e50', backgroundColor: 'white', outline: 'none', transition: 'all 0.3s ease', boxSizing: 'border-box' as const, height: 38, cursor: 'pointer' as const };
  const btn = (bg: string, hover: string): React.CSSProperties => ({ backgroundColor: bg, color: 'white', border: 'none', borderRadius: 5, padding: '6px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 38, minWidth: 38 });
  const th = { padding: '12px 10px', textAlign: 'left' as const, fontWeight: 700, color: '#2c3e50', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', fontSize: 13, whiteSpace: 'nowrap' as const };
  const td = { padding: '10px', borderBottom: '1px solid #ecf0f1', color: '#2c3e50' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: 20 }}>
      <h2 style={{ color: '#2c3e50', fontSize: 24, fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Wheat size={24} color="#2c3e50" /> {t('cultures.title')}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder={t('cultures.nom')} value={nom} onChange={(e) => setNom(e.target.value)} style={{ ...ipt, width: 150 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }} />
        <input type="date" value={dateSemis} onChange={(e) => setDateSemis(e.target.value)} style={{ ...ipt, width: 130 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }} />
        <input type="date" value={dateRecolte} onChange={(e) => setDateRecolte(e.target.value)} style={{ ...ipt, width: 130 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }} />
        <select value={parcelleId} onChange={(e) => setParcelleId(e.target.value)} style={{ ...sel, width: 150 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }}>
          <option value="">{t('cultures.select')}</option>
          {parcelles.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
        <select value={statut} onChange={(e) => setStatut(e.target.value)} style={{ ...sel, width: 120 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }}>
          {statutOptions.map((opt) => <option key={opt} value={opt}>{t(statutLabels[opt])}</option>)}
        </select>
        <button type="submit" style={btn('#27ae60', '#1e8449')}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e8449'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#27ae60'; e.currentTarget.style.transform = 'scale(1)'; }}>
          {editingId ? <Pencil size={16} /> : <Plus size={18} />}
        </button>
        <button type="button" onClick={() => { if (editingId) handleSubmit({ preventDefault: () => {} } as any); }} style={btn('#3498db', '#2980b9')}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2980b9'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3498db'; e.currentTarget.style.transform = 'scale(1)'; }}>
          <Pencil size={16} />
        </button>
        <button type="button" onClick={() => editingId && handleDelete(editingId)} style={btn('#e74c3c', '#c0392b')}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c0392b'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; e.currentTarget.style.transform = 'scale(1)'; }}>
          <Trash2 size={16} />
        </button>
        <button type="button" onClick={load} style={btn('#2c3e50', '#1a252f')}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a252f'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2c3e50'; e.currentTarget.style.transform = 'scale(1)'; }}>
          <RefreshCw size={16} />
        </button>
      </form>
      <div style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 50 }}>{t('cultures.id')}</th>
              <th style={{ ...th, width: 150 }}>{t('cultures.nom')}</th>
              <th style={{ ...th, width: 100 }}>{t('cultures.dateSemis')}</th>
              <th style={{ ...th, width: 100 }}>{t('cultures.dateRecolte')}</th>
              <th style={{ ...th, width: 150 }}>{t('cultures.parcelle')}</th>
              <th style={{ ...th, width: 100 }}>{t('cultures.statut')}</th>
            </tr>
          </thead>
          <tbody>
            {cultures.map((c) => (
              <tr key={c.id} onClick={() => handleEdit(c)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <td style={td}>{c.id}</td>
                <td style={td}>{c.nom}</td>
                <td style={td}>{c.dateSemis}</td>
                <td style={td}>{c.dateRecoltePrevue}</td>
                <td style={td}>{parcelles.find((p) => p.id === c.parcelleId)?.nom || '-'}</td>
                <td style={td}><span style={{ backgroundColor: getStatutColor(c.statut) + '20', color: getStatutColor(c.statut), padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>{t(statutLabels[c.statut] || c.statut)}</span></td>
              </tr>
            ))}
            {cultures.length === 0 && (
              <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#95a5a6', padding: 30 }}>{t('cultures.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cultures;
