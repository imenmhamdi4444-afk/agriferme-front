import React, { useState, useEffect, useCallback } from 'react';
import Toast from './Toast';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import Spinner from './Spinner';
import { useToast } from '../hooks/useToast';
import { getStock, createStock, updateStock, deleteStock } from '../api/stock';
import { Stock as StockItem } from '../types';
import { Package, Plus, Pencil, Trash2, RefreshCw, DollarSign, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const Stock: React.FC = () => {
  const { t } = useTranslation();
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [nomProduit, setNomProduit] = useState('');
  const [quantite, setQuantite] = useState('');
  const [unite, setUnite] = useState('kg');
  const [seuilAlerte, setSeuilAlerte] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [depense, setDepense] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStock();
      setStocks(res.data);
    } catch (err) { showToast('Erreur lors du chargement', 'error'); } finally { setLoading(false); }
  };

  const qty = parseFloat(quantite) || 0;
  const pu = parseFloat(prixUnitaire) || 0;
  const prixTotal = qty * pu;

  const resetForm = () => { setNomProduit(''); setQuantite(''); setUnite('kg'); setSeuilAlerte(''); setPrixUnitaire(''); setDepense(''); setEditingId(null); };

  const handleSubmit = async () => {
    if (!nomProduit.trim()) { showToast('Le nom du produit est requis', 'warning'); return; }
    if (!quantite || parseFloat(quantite) < 0) { showToast('La quantite doit etre positive', 'warning'); return; }
    if (!unite.trim()) { showToast('L unite est requise', 'warning'); return; }
    try {
      const data = {
        nomProduit, quantite: qty, unite, seuilAlerte: parseFloat(seuilAlerte) || 10,
        prixUnitaire: pu, depense: parseFloat(depense) || 0, prixTotal: qty * pu
      };
      if (editingId) { await updateStock(editingId, data); }
      else { await createStock(data); }
      resetForm(); load(); showToast(editingId ? 'Stock modifie !' : 'Stock ajoute !', 'success');
    } catch (err) { showToast('Erreur lors de la sauvegarde', 'error'); }
  };

  const handleEdit = (s: StockItem) => {
    setEditingId(s.id); setNomProduit(s.nomProduit); setQuantite(String(s.quantite ?? ''));
    setUnite(s.unite || 'kg'); setSeuilAlerte(String(s.seuilAlerte ?? ''));
    setPrixUnitaire(String(s.prixUnitaire ?? '')); setDepense(String(s.depense ?? ''));
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    if (window.confirm(t('stock.confirmDelete'))) { await deleteStock(editingId); resetForm(); load(); }
  };

  const valeurTotale = stocks.reduce((sum, s) => sum + (s.quantite || 0) * (s.prixUnitaire || 0), 0);
  const totalDepenses = stocks.reduce((sum, s) => sum + (s.depense || 0), 0);
  const nbAlertes = stocks.filter((s) => (s.quantite || 0) <= (s.seuilAlerte || 0)).length;

  const filtered = stocks.filter(s => s.nomProduit?.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const ipt: React.CSSProperties = { padding: '6px 10px', borderRadius: 5, border: '1px solid #bdc3c7', fontSize: 13, backgroundColor: 'white', outline: 'none' };
  const btn = (bg: string): React.CSSProperties => ({
    backgroundColor: bg, color: 'white', border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontSize: 12, transition: 'all .2s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: 20 }}>
      <h2 style={{ color: '#2c3e50', fontSize: 24, fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Package size={24} color="#2c3e50" /> {t('stock.title')}
      </h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder={t('stock.produit')} value={nomProduit} onChange={(e) => setNomProduit(e.target.value)} style={{ ...ipt, width: 120 }} />
        <input placeholder={t('stock.quantite')} value={quantite} onChange={(e) => setQuantite(e.target.value)} style={{ ...ipt, width: 80 }} />
        <select value={unite} onChange={(e) => setUnite(e.target.value)} style={{ ...ipt, width: 70 }}>
          <option>{t('stock.kg')}</option><option>{t('stock.l')}</option><option>{t('stock.unites')}</option><option>{t('stock.sacs')}</option><option>{t('stock.bottes')}</option>
        </select>
        <input placeholder={t('stock.seuil')} value={seuilAlerte} onChange={(e) => setSeuilAlerte(e.target.value)} style={{ ...ipt, width: 80 }} />
        <input placeholder={t('stock.prixUnitaire')} value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} style={{ ...ipt, width: 110 }} />
        <input placeholder={t('stock.depense')} value={depense} onChange={(e) => setDepense(e.target.value)} style={{ ...ipt, width: 100 }} />
        <span style={{ fontSize: 13 }}>{t('stock.prixTotal')}</span>
        <span style={{ fontWeight: 'bold', color: '#27ae60', fontSize: 13, width: 90 }}>{prixTotal.toFixed(3)} DT</span>
        <button onClick={handleSubmit} style={btn('#27ae60')} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#219a52')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#27ae60')}>{editingId ? <><Pencil size={14} /> {t('admin.modifier')}</> : <><Plus size={16} /> {t('admin.ajouter')}</>}</button>
        <button onClick={() => { if (editingId !== null) { const s = stocks.find(x => x.id === editingId); if (s) handleEdit(s); } }} style={btn('#3498db')} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}><Pencil size={14} /> {t('admin.modifier')}</button>
        <button onClick={handleDelete} style={btn('#e74c3c')} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c0392b')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e74c3c')}><Trash2 size={14} /> {t('admin.supprimer')}</button>
        <button onClick={load} style={btn('#2c3e50')} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a252f')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2c3e50')}><RefreshCw size={14} /> {t('admin.actualiser')}</button>
        {editingId && <button onClick={resetForm} style={{ ...btn('#95a5a6'), fontSize: 11 }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7f8c8d')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#95a5a6')}>{t('admin.annuler')}</button>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder='Rechercher un produit...' />
        <span style={{ fontSize: 13, color: '#7f8c8d' }}>{filtered.length} produit(s)</span>
      </div>
      <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} />
      <div style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxHeight: 380 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', position: 'sticky', top: 0 }}>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 50 }}>{t('stock.id')}</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 130 }}>{t('stock.produit')}</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 80 }}>{t('stock.quantite')}</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 70 }}>{t('stock.unite')}</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 90 }}>{t('stock.seuil')}</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 90 }}>Statut</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 120 }}>{t('stock.prixUnitaire')}</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 100 }}>{t('stock.depense')}</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 120 }}>{t('stock.prixTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s) => (
              <tr key={s.id} onClick={() => handleEdit(s)} style={{ borderBottom: '1px solid #dee2e6', cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <td style={{ padding: '6px 8px' }}>{s.id}</td>
                <td style={{ padding: '6px 8px' }}>{s.nomProduit}</td>
                <td style={{ padding: '6px 8px' }}>{s.quantite}</td>
                <td style={{ padding: '6px 8px' }}>{s.unite}</td>
                <td style={{ padding: '6px 8px' }}>{s.seuilAlerte}</td>
                <td style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {(s.quantite || 0) <= (s.seuilAlerte || 0) ? (
                      <><AlertTriangle size={14} color="#e74c3c" /><span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{t('stock.stockBas')}</span></>
                    ) : (
                      <><CheckCircle size={14} color="#27ae60" /><span style={{ color: '#27ae60', fontWeight: 'bold' }}>{t('stock.ok')}</span></>
                  )}
                </td>
                <td style={{ padding: '6px 8px' }}>{s.prixUnitaire?.toFixed(3)}</td>
                <td style={{ padding: '6px 8px' }}>{s.depense?.toFixed(3)}</td>
                <td style={{ padding: '6px 8px' }}>{s.prixTotal?.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: 'white', borderRadius: 10, padding: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minWidth: 160, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <DollarSign size={18} color="#27ae60" />
            <span style={{ fontWeight: 'bold', fontSize: 13 }}>{t('stock.valeurTotale')}</span>
          </div>
          <span style={{ fontSize: 18, color: '#27ae60', fontWeight: 'bold' }}>{valeurTotale.toFixed(3)} DT</span>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: 10, padding: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minWidth: 160, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TrendingDown size={18} color="#e74c3c" />
            <span style={{ fontWeight: 'bold', fontSize: 13 }}>{t('stock.totalDepenses')}</span>
          </div>
          <span style={{ fontSize: 18, color: '#e74c3c', fontWeight: 'bold' }}>{totalDepenses.toFixed(3)} DT</span>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: 10, padding: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minWidth: 160, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={18} color="#e67e22" />
            <span style={{ fontWeight: 'bold', fontSize: 13 }}>{t('stock.alertes')}</span>
          </div>
          <span style={{ fontSize: 18, color: '#e67e22', fontWeight: 'bold' }}>{nbAlertes}</span>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: 10, padding: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minWidth: 160, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={18} color="#2c3e50" />
            <span style={{ fontWeight: 'bold', fontSize: 13 }}>{t('stock.nbProduits')}</span>
          </div>
          <span style={{ fontSize: 18, color: '#2c3e50', fontWeight: 'bold' }}>{stocks.length}</span>
        </div>
      </div>
  </div>
  );
};

export default Stock;
