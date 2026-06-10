import Toast from './Toast';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import { useToast } from '../hooks/useToast';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParcelles, createParcelle, updateParcelle, deleteParcelle } from '../api/parcelles';
import { Parcelle } from '../types';
import { useAuth } from '../context/AuthContext';
import { Sprout, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const Parcelles: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const { toast, showToast, hideToast } = useToast();
  const [nom, setNom] = useState('');
  const [surface, setSurface] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [culture, setCulture] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getParcelles();
      setParcelles(res.data);
    } catch (err) { showToast('Erreur de chargement', 'error'); } finally { setLoading(false); }
  };

  const resetForm = () => { setNom(''); setSurface(''); setLocalisation(''); setCulture(''); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateParcelle(editingId, { nom, surface: parseFloat(surface), localisation, cultureActuelle: culture });
      } else {
        await createParcelle({ nom, surface: parseFloat(surface), localisation, cultureActuelle: culture });
      }
      resetForm();
      load();
      showToast(editingId ? 'Parcelle modifiee !' : 'Parcelle ajoutee !', 'success');
    } catch (err) { console.error(err); }
  };

  const handleEdit = (p: Parcelle) => {
    setEditingId(p.id);
    setNom(p.nom);
    setSurface(String(p.surface ?? ''));
    setLocalisation(p.localisation);
    setCulture(p.cultureActuelle);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('parcelles.confirmDelete'))) {
      await deleteParcelle(id);
      load();
    }
  };

  const filtered = parcelles.filter(p =>
    p.nom?.toLowerCase().includes(search.toLowerCase()) ||
    p.localisation?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const ipt = { padding: '8px 12px', borderRadius: 5, border: '1.5px solid #bdc3c7', fontSize: 13, color: '#2c3e50', backgroundColor: 'white', outline: 'none', transition: 'all 0.3s ease', boxSizing: 'border-box' as const, height: 38 };
  const btn = (bg: string, hover: string): React.CSSProperties => ({ backgroundColor: bg, color: 'white', border: 'none', borderRadius: 5, padding: '6px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 38, minWidth: 38 });
  const th = { padding: '12px 10px', textAlign: 'left' as const, fontWeight: 700, color: '#2c3e50', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', fontSize: 13, whiteSpace: 'nowrap' as const };
  const td = { padding: '10px', borderBottom: '1px solid #ecf0f1', color: '#2c3e50' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: 20 }}>
      <h2 style={{ color: '#2c3e50', fontSize: 24, fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sprout size={24} color="#2c3e50" /> {t('parcelles.title')}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder={t('parcelles.nom')} value={nom} onChange={(e) => setNom(e.target.value)} style={{ ...ipt, width: 150 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }} />
        <input placeholder={t('parcelles.surface')} value={surface} onChange={(e) => setSurface(e.target.value)} style={{ ...ipt, width: 100 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }} />
        <input placeholder={t('parcelles.localisation')} value={localisation} onChange={(e) => setLocalisation(e.target.value)} style={{ ...ipt, width: 200 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }} />
        <input placeholder={t('parcelles.culture')} value={culture} onChange={(e) => setCulture(e.target.value)} style={{ ...ipt, width: 150 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#3498db'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,152,219,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#bdc3c7'; e.currentTarget.style.boxShadow = 'none'; }} />
        <button type="submit" style={btn('#27ae60', '#1e8449')}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e8449'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#27ae60'; e.currentTarget.style.transform = 'scale(1)'; }}>
          {editingId ? <Pencil size={16} /> : <Plus size={18} />}
        </button>
        <button type="button" onClick={handleSubmit} style={btn('#3498db', '#2980b9')}
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
              <th style={{ ...th, width: 50 }}>{t('parcelles.id')}</th>
              <th style={{ ...th, width: 150 }}>{t('parcelles.nom')}</th>
              <th style={{ ...th, width: 100 }}>{t('parcelles.surface')}</th>
              <th style={{ ...th, width: 200 }}>{t('parcelles.localisation')}</th>
              <th style={{ ...th, width: 150 }}>{t('parcelles.culture')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} onClick={() => handleEdit(p)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <td style={td}>{p.id}</td>
                <td style={td}>{p.nom}</td>
                <td style={td}>{p.surface}</td>
                <td style={td}>{p.localisation}</td>
                <td style={td}>{p.cultureActuelle}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#95a5a6', padding: 30 }}>{t('parcelles.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Parcelles;
