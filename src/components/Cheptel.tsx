import Toast from './Toast';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import Spinner from './Spinner';
import { useToast } from '../hooks/useToast';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCheptel, getAnimauxMalades, createCheptel, updateCheptel, deleteCheptel, prendreRdv } from '../api/cheptel';
import { sendRdvEmail } from '../api/emailjs';
import { Cheptel as CheptelType } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Beef, Plus, Pencil, Trash2, RefreshCw, AlertTriangle, CheckCircle, AlertCircle, Calendar, Circle } from 'lucide-react';
import VetAssistant from './VetAssistant';

const Cheptel: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [animaux, setAnimaux] = useState<CheptelType[]>([]);
  const [malades, setMalades] = useState<CheptelType[]>([]);
  const [nom, setNom] = useState('');
  const [typeAnimal, setTypeAnimal] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [etatSante, setEtatSante] = useState('Bon');
  const [maladie, setMaladie] = useState('');
  const [quantiteVendue, setQuantiteVendue] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showMalades, setShowMalades] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const { toast, showToast, hideToast } = useToast();
  const [rdvAnimal, setRdvAnimal] = useState('');
  const [rdvDate, setRdvDate] = useState('');
  const [rdvMotif, setRdvMotif] = useState('');
  const maladesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
    if (location.state?.openRdv) {
      setShowMalades(true);
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    if (showMalades && maladesRef.current) {
      setTimeout(() => maladesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [showMalades]);

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, mRes] = await Promise.all([getCheptel(), getAnimauxMalades()]);
      setAnimaux(aRes.data);
      setMalades(mRes.data);
    } catch (err) { showToast('Erreur de chargement', 'error'); } finally { setLoading(false); }
  };

  const qty = parseFloat(quantiteVendue) || 0;
  const pu = parseFloat(prixUnitaire) || 0;
  const prixTotalCalc = qty * pu;

  const resetForm = () => {
    setNom(''); setTypeAnimal(''); setDateNaissance(''); setEtatSante('Bon');
    setMaladie(''); setQuantiteVendue(''); setPrixUnitaire(''); setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!nom.trim()) { showToast('Le nom est requis', 'warning'); return; }
    if (!typeAnimal.trim()) { showToast('Le type animal est requis', 'warning'); return; }
    try {
      const data = { nom, typeAnimal, dateNaissance, etatSante, maladie: etatSante === 'Malade' ? maladie : '', quantiteVendue: qty, prixUnitaire: pu, prixTotal: qty * pu };
      if (editingId) { await updateCheptel(editingId, data); }
      else { await createCheptel(data); }
      resetForm(); load();
      showToast(editingId ? 'Animal modifie !' : 'Animal ajoute !', 'success');
    } catch (err) { showToast('Erreur lors de la sauvegarde', 'error'); }
  };

  const handleEdit = (a: CheptelType) => {
    setEditingId(a.id); setNom(a.nom); setTypeAnimal(a.typeAnimal || '');
    setDateNaissance(a.dateNaissance || ''); setEtatSante(a.etatSante || 'Bon');
    setMaladie(a.maladie || ''); setQuantiteVendue(String(a.quantiteVendue ?? ''));
    setPrixUnitaire(String(a.prixUnitaire ?? ''));
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    if (window.confirm(t('cheptel.confirmDelete'))) { await deleteCheptel(editingId); resetForm(); load(); }
  };

  const handleRdv = async () => {
    if (!rdvAnimal || !rdvDate) { alert(t('cheptel.selectAnimalDate')); return; }
    const selected = malades[parseInt(rdvAnimal)];
    if (!selected) return;
    try {
      await prendreRdv({ animalId: selected.id, animalNom: selected.nom, dateRdv: rdvDate, motif: rdvMotif, statut: 'En attente' });
      await sendRdvEmail({
        animalNom: selected.nom,
        typeAnimal: selected.typeAnimal,
        maladie: selected.maladie,
        dateRdv: rdvDate,
        motif: rdvMotif,
      });
      alert('RDV enregistré ! Un email de confirmation a été envoyé.');
      setRdvAnimal(''); setRdvDate(''); setRdvMotif('');
      load();
    } catch (err) { console.error(err); }
  };

  const ipt: React.CSSProperties = {
    padding: '10px 14px', borderRadius: 6, border: '1.5px solid #bdc3c7', fontSize: 15,
    backgroundColor: 'white', outline: 'none', transition: 'border-color 0.2s',
  };
  const btn = (bg: string): React.CSSProperties => ({
    backgroundColor: bg, color: 'white', border: 'none', borderRadius: 6, padding: '10px 16px',
    cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.25s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  });

  const filtered = animaux.filter(a => a.nom?.toLowerCase().includes(search.toLowerCase()) || a.typeAnimal?.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalAnimaux = animaux.length;
  const enBonneSante = animaux.filter((a) => a.etatSante === 'Bon').length;
  const nbMalades = animaux.filter((a) => a.etatSante === 'Malade').length;
  const totalRevenus = animaux.reduce((sum, a) => sum + (a.prixTotal || 0), 0);

  return (
    <div style={{ padding: '20px 24px', flex: 1 }}>
      <style>{`
        @media (max-width: 768px) {
          .cheptel-form { flex-direction: column; }
          .cheptel-form > div { min-width: 100% !important; }
        }
      `}</style>
      <h2 style={{ color: '#2c3e50', fontSize: 28, fontWeight: 'bold', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Beef size={30} /> {t('cheptel.title')}
      </h2>
      <div className="cheptel-form" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 100px', minWidth: 100 }}>
          <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.nom')}</label>
          <input placeholder={t('cheptel.nom')} value={nom} onChange={(e) => setNom(e.target.value)} style={{ ...ipt, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 100px', minWidth: 100 }}>
          <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.type')}</label>
          <input placeholder={t('cheptel.type')} value={typeAnimal} onChange={(e) => setTypeAnimal(e.target.value)} style={{ ...ipt, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 130px', minWidth: 130 }}>
          <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.dateNaissance')}</label>
          <input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} style={{ ...ipt, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 130px', minWidth: 130 }}>
          <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.etatSante')}</label>
          <select value={etatSante} onChange={(e) => { setEtatSante(e.target.value); if (e.target.value !== 'Malade') setMaladie(''); }} style={{ ...ipt, width: '100%' }}>
            <option value="Bon">{t('cheptel.bon')}</option><option value="Malade">{t('cheptel.malade')}</option><option value="Traitement">{t('cheptel.traitement')}</option><option value="En convalescence">{t('cheptel.convalescence')}</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 120px', minWidth: 120 }}>
          <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.maladie')}</label>
          <input placeholder={t('cheptel.maladie')} value={maladie} onChange={(e) => setMaladie(e.target.value)} disabled={etatSante !== 'Malade'} style={{ ...ipt, width: '100%', backgroundColor: etatSante !== 'Malade' ? '#ecf0f1' : 'white' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 100px', minWidth: 100 }}>
          <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.qteVendue')}</label>
          <input placeholder={t('cheptel.qteVendue')} value={quantiteVendue} onChange={(e) => setQuantiteVendue(e.target.value)} style={{ ...ipt, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 110px', minWidth: 110 }}>
          <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.prixUnitaire')}</label>
          <input placeholder={t('cheptel.prixUnitaire')} value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} style={{ ...ipt, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 110px', minWidth: 110 }}>
          <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.prixTotal')}</label>
          <input placeholder={t('cheptel.prixTotal')} value={`${prixTotalCalc.toFixed(3)} DT`} readOnly style={{ ...ipt, width: '100%', backgroundColor: '#ecf0f1', fontWeight: 600, color: '#27ae60' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {editingId && <span style={{ fontSize: 13, color: '#27ae60', fontWeight: 600, padding: '4px 12px', backgroundColor: '#d5f5e3', borderRadius: 4 }}>{t('cheptel.editionMode')}</span>}
        <button onClick={handleSubmit} style={btn(editingId ? '#3498db' : '#27ae60')}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = editingId ? '#2980b9' : '#219a52'; e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = editingId ? '#3498db' : '#27ae60'; e.currentTarget.style.transform = 'scale(1)'; }}>
          {editingId ? <><Pencil size={16} /> {t('cheptel.modifier')}</> : <><Plus size={16} /> {t('cheptel.ajouter')}</>}
        </button>
        <button onClick={handleDelete} disabled={editingId === null} style={{ ...btn('#e74c3c'), opacity: editingId === null ? 0.5 : 1 }}
          onMouseEnter={(e) => { if (editingId !== null) { e.currentTarget.style.backgroundColor = '#c0392b'; e.currentTarget.style.transform = 'scale(1.04)'; } }}
          onMouseLeave={(e) => { if (editingId !== null) { e.currentTarget.style.backgroundColor = '#e74c3c'; e.currentTarget.style.transform = 'scale(1)'; } }}>
          <Trash2 size={16} /> {t('cheptel.supprimer')}
        </button>
        <button onClick={load} style={btn('#2c3e50')}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a252f'; e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2c3e50'; e.currentTarget.style.transform = 'scale(1)'; }}>
          <RefreshCw size={16} /> {t('cheptel.actualiser')}
        </button>
        {editingId && <button onClick={resetForm} style={{ ...btn('#95a5a6'), fontSize: 13 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7f8c8d'; e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#95a5a6'; e.currentTarget.style.transform = 'scale(1)'; }}>{t('cheptel.annuler')}</button>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder='Rechercher un animal...' />
        <span style={{ fontSize: 13, color: '#7f8c8d' }}>{filtered.length} animal(aux)</span>
      </div>
      <Pagination currentPage={page} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} />
      <div style={{ backgroundColor: 'white', borderRadius: 10, overflow: 'auto', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxHeight: 380, transition: 'box-shadow 0.3s' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', position: 'sticky', top: 0 }}>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 50 }}>{t('cheptel.id')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 130 }}>{t('cheptel.nom')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 100 }}>{t('cheptel.type')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 120 }}>{t('cheptel.naissance')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 100 }}>{t('cheptel.sante')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 120 }}>{t('cheptel.maladie')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 100 }}>{t('cheptel.qteVendue')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 130 }}>{t('cheptel.prixUnitaire')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 130 }}>{t('cheptel.prixTotal')}</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 120 }}>{t('cheptel.alerte')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((a) => (
              <tr key={a.id} onClick={() => handleEdit(a)} style={{ borderBottom: '1px solid #ecf0f1', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f4f8')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <td style={{ padding: '10px' }}>{a.id}</td>
                <td style={{ padding: '10px', fontWeight: 500 }}>{a.nom}</td>
                <td style={{ padding: '10px' }}>{a.typeAnimal}</td>
                <td style={{ padding: '10px' }}>{a.dateNaissance}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: a.etatSante === 'Bon' ? '#27ae60' : a.etatSante === 'Malade' ? '#e74c3c' : a.etatSante === 'Traitement' ? '#e67e22' : '#f39c12', fontWeight: 600, fontSize: 14 }}>
                    {a.etatSante === 'Bon' ? <CheckCircle size={14} /> : a.etatSante === 'Malade' ? <AlertCircle size={14} /> : a.etatSante === 'Traitement' ? <AlertTriangle size={14} /> : <Circle size={14} />}
                    {a.etatSante}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{a.maladie}</td>
                <td style={{ padding: '10px' }}>{a.quantiteVendue}</td>
                <td style={{ padding: '10px' }}>{a.prixUnitaire?.toFixed(3)}</td>
                <td style={{ padding: '10px', fontWeight: 600, color: '#27ae60' }}>{a.prixTotal?.toFixed(3)}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: a.etatSante === 'Malade' ? '#e74c3c' : '#27ae60', fontWeight: 600 }}>
                    {a.etatSante === 'Malade' ? <><AlertTriangle size={14} /> {t('cheptel.besoinRDV')}</> : <><CheckCircle size={14} /> {t('cheptel.ok')}</>}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ padding: 30, textAlign: 'center', color: '#95a5a6', fontSize: 15 }}>{t('cheptel.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}>
        <div style={{ minWidth: 140 }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 6px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, color: '#7f8c8d' }}>
            <Beef size={18} color="#2c3e50" /> {t('cheptel.totalAnimaux')}
          </p>
          <p style={{ fontSize: 26, fontWeight: 'bold', margin: 0, color: '#2c3e50' }}>{totalAnimaux}</p>
        </div>
        <div style={{ minWidth: 140 }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 6px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, color: '#7f8c8d' }}>
            <CheckCircle size={18} color="#27ae60" /> {t('cheptel.enBonneSante')}
          </p>
          <p style={{ fontSize: 26, color: '#27ae60', fontWeight: 'bold', margin: 0 }}>{enBonneSante}</p>
        </div>
        <div style={{ minWidth: 140 }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 6px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, color: '#7f8c8d' }}>
            <AlertCircle size={18} color="#e74c3c" /> {t('cheptel.malades')}
          </p>
          <p style={{ fontSize: 26, color: '#e74c3c', fontWeight: 'bold', margin: 0 }}>{nbMalades}</p>
        </div>
        <div style={{ minWidth: 140 }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 6px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, color: '#7f8c8d' }}>
            <span style={{ fontWeight:'bold', fontSize:14, color:'#e67e22' }}>DT</span> {t('cheptel.totalRevenus')}
          </p>
          <p style={{ fontSize: 26, color: '#e67e22', fontWeight: 'bold', margin: 0 }}>{totalRevenus.toFixed(3)} DT</p>
        </div>
        <div style={{ minWidth: 140 }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 6px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, color: '#7f8c8d' }}>
            <AlertTriangle size={18} color="#e67e22" /> {t('cheptel.alertesRDV')}
          </p>
          <p style={{ fontSize: 26, color: '#e67e22', fontWeight: 'bold', margin: 0 }}>{malades.length}</p>
        </div>
      </div>
      <div ref={maladesRef} style={{ backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'box-shadow 0.3s' }}>
        <div onClick={() => setShowMalades(!showMalades)} style={{ padding: '14px 20px', backgroundColor: '#f8f9fa', cursor: 'pointer', fontWeight: 'bold', fontSize: 15, borderBottom: showMalades ? '1px solid #dee2e6' : 'none', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#2c3e50' }}>
          <AlertTriangle size={18} color="#e67e22" /> {t('cheptel.maladesTitle')}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#7f8c8d' }}>{showMalades ? '▲' : '▼'}</span>
        </div>
        {showMalades && (
          <div style={{ padding: 20 }}>
            <p style={{ fontWeight: 'bold', fontSize: 15, margin: '0 0 12px 0', color: '#2c3e50' }}>{t('cheptel.listeRDV')}</p>
            <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 350px', minWidth: 280 }}>
                <div style={{ maxHeight: 300, overflowY: 'auto', border: '1.5px solid #bdc3c7', borderRadius: 6 }}>
                  {malades.length === 0 ? (
                    <div style={{ padding: 15, fontSize: 14, color: '#7f8c8d' }}>{t('cheptel.aucunMalade')}</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 150 }}>{t('cheptel.nom')}</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 100 }}>{t('cheptel.type')}</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>{t('cheptel.maladie')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {malades.map((m, i) => (
                          <tr key={m.id} onClick={() => setRdvAnimal(String(i))} style={{ borderBottom: '1px solid #dee2e6', cursor: 'pointer', backgroundColor: rdvAnimal === String(i) ? '#eef2f7' : 'transparent' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 500 }}>{m.nom}</td>
                            <td style={{ padding: '8px 12px' }}>{m.typeAnimal}</td>
                            <td style={{ padding: '8px 12px', color: '#e74c3c' }}>{m.maladie || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <div style={{ flex: '1 1 350px', minWidth: 280 }}>
                <VetAssistant onRequestRdv={() => setShowMalades(true)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '2 1 200px', minWidth: 180 }}>
                <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.animal')}</label>
                <select value={rdvAnimal} onChange={(e) => setRdvAnimal(e.target.value)} style={{ ...ipt, width: '100%' }}>
                  <option value="">{t('cheptel.selectPlaceholder')}</option>
                  {malades.map((m, i) => <option key={m.id} value={i}>{m.nom} - {m.typeAnimal}{m.maladie ? ` (${m.maladie})` : ''}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 140px', minWidth: 130 }}>
                <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.dateRDV')}</label>
                <input type="date" value={rdvDate} onChange={(e) => setRdvDate(e.target.value)} style={{ ...ipt, width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '2 1 180px', minWidth: 150 }}>
                <label style={{ fontSize: 12, color: '#7f8c8d', fontWeight: 600 }}>{t('cheptel.motif')}</label>
                <input placeholder={t('cheptel.motif')} value={rdvMotif} onChange={(e) => setRdvMotif(e.target.value)} style={{ ...ipt, width: '100%' }} />
              </div>
              <button onClick={handleRdv} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.25s', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2980b9'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3498db'; e.currentTarget.style.transform = 'scale(1)'; }}>
                <Calendar size={16} /> {t('cheptel.prendreRDV')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cheptel;
