import React, { useState, useEffect } from 'react';
import { getVeterinaires, createRendezVous, getRendezVous, Veterinaire } from '../api/veterinaires';
import { sendRdvEmail } from '../api/emailjs';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import Spinner from './Spinner';
import { Stethoscope, MapPin, Phone, Mail, Calendar, Clock, CheckCircle, Search, X } from 'lucide-react';

const RendezVous: React.FC = () => {
  const { toast, showToast, hideToast } = useToast();
  const [vets, setVets] = useState<Veterinaire[]>([]);
  const [filteredVets, setFilteredVets] = useState<Veterinaire[]>([]);
  const [rdvHistory, setRdvHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState<Veterinaire | null>(null);
  const [searchVille, setSearchVille] = useState('');
  const [searchSpecialite, setSearchSpecialite] = useState('');
  const [animalNom, setAnimalNom] = useState('');
  const [animalType, setAnimalType] = useState('');
  const [dateRdv, setDateRdv] = useState('');
  const [motif, setMotif] = useState('');
  const [booking, setBooking] = useState(false);
  const [tab, setTab] = useState<'book' | 'history'>('book');

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let filtered = vets;
    if (searchVille) filtered = filtered.filter(v => v.ville?.toLowerCase().includes(searchVille.toLowerCase()));
    if (searchSpecialite) filtered = filtered.filter(v => v.specialite?.toLowerCase().includes(searchSpecialite.toLowerCase()));
    setFilteredVets(filtered);
  }, [searchVille, searchSpecialite, vets]);

  const load = async () => {
    setLoading(true);
    try {
      const [vetsRes, rdvRes] = await Promise.all([getVeterinaires(), getRendezVous()]);
      setVets(Array.isArray(vetsRes.data) ? vetsRes.data : []);
      setFilteredVets(Array.isArray(vetsRes.data) ? vetsRes.data : []);
      setRdvHistory(Array.isArray(rdvRes.data) ? rdvRes.data : []);
    } catch { showToast('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  };

  const handleBook = async () => {
    if (!selectedVet) { showToast('Sélectionnez un vétérinaire', 'warning'); return; }
    if (!animalNom.trim()) { showToast('Entrez le nom de l\'animal', 'warning'); return; }
    if (!dateRdv) { showToast('Choisissez une date', 'warning'); return; }
    if (!motif.trim()) { showToast('Décrivez le motif', 'warning'); return; }

    setBooking(true);
    try {
      // Save RDV to DB
      await createRendezVous({
        animalNom, animalType,
        veterinaireId: selectedVet.id,
        veterinaireNom: selectedVet.nom,
        dateRdv, motif,
      });

      // Send email to vet
      await sendRdvEmail({
        vet_email: selectedVet.email,
        animal_nom: animalNom,
        type_animal: animalType,
        maladie: motif,
        date_rdv: dateRdv,
        motif,
      });

      showToast(`RDV confirmé avec ${selectedVet.nom} !`, 'success');
      setSelectedVet(null);
      setAnimalNom(''); setAnimalType(''); setDateRdv(''); setMotif('');
      load();
      setTab('history');
    } catch (e) {
      showToast('Erreur lors de la réservation', 'error');
    } finally { setBooking(false); }
  };

  const ipt: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #bdc3c7', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const };
  const card: React.CSSProperties = { backgroundColor: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 };

  if (loading) return <Spinner message="Chargement des vétérinaires..." />;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50', fontSize: 24, fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Stethoscope size={26} color="#27ae60" /> Rendez-vous Vétérinaires
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #ecf0f1' }}>
        {[{ key: 'book', label: '📅 Prendre RDV' }, { key: 'history', label: `📋 Mes RDV (${rdvHistory.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            backgroundColor: 'transparent', borderBottom: tab === t.key ? '2px solid #27ae60' : '2px solid transparent',
            color: tab === t.key ? '#27ae60' : '#7f8c8d', marginBottom: -2,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'book' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Vet selection */}
          <div>
            <div style={card}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2c3e50', margin: '0 0 14px' }}>1. Choisir un vétérinaire</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7f8c8d' }} />
                  <input placeholder="Ville..." value={searchVille} onChange={e => setSearchVille(e.target.value)} style={{ ...ipt, paddingLeft: 30 }} />
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7f8c8d' }} />
                  <input placeholder="Spécialité..." value={searchSpecialite} onChange={e => setSearchSpecialite(e.target.value)} style={{ ...ipt, paddingLeft: 30 }} />
                </div>
              </div>

              <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredVets.length === 0 ? (
                  <p style={{ color: '#7f8c8d', textAlign: 'center', padding: 20 }}>Aucun vétérinaire trouvé</p>
                ) : filteredVets.map(vet => (
                  <div key={vet.id} onClick={() => setSelectedVet(selectedVet?.id === vet.id ? null : vet)}
                    style={{
                      padding: 14, borderRadius: 10, border: `2px solid ${selectedVet?.id === vet.id ? '#27ae60' : '#ecf0f1'}`,
                      backgroundColor: selectedVet?.id === vet.id ? '#f0faf3' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (selectedVet?.id !== vet.id) e.currentTarget.style.borderColor = '#bdc3c7'; }}
                    onMouseLeave={e => { if (selectedVet?.id !== vet.id) e.currentTarget.style.borderColor = '#ecf0f1'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#2c3e50' }}>{vet.nom}</div>
                        <div style={{ fontSize: 12, color: '#27ae60', fontWeight: 600, marginTop: 2 }}>{vet.specialite}</div>
                      </div>
                      {selectedVet?.id === vet.id && <CheckCircle size={20} color="#27ae60" />}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: '#7f8c8d' }}>
                      {vet.ville && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{vet.ville}</span>}
                      {vet.telephone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} />{vet.telephone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: RDV form */}
          <div>
            <div style={card}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2c3e50', margin: '0 0 14px' }}>
                2. Détails du rendez-vous
                {selectedVet && <span style={{ fontSize: 13, color: '#27ae60', fontWeight: 600, marginLeft: 8 }}>avec {selectedVet.nom}</span>}
              </h3>

              {!selectedVet ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#7f8c8d' }}>
                  <Stethoscope size={40} color="#bdc3c7" style={{ marginBottom: 10 }} />
                  <p>Sélectionnez un vétérinaire à gauche</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 5 }}>Nom de l'animal *</label>
                      <input value={animalNom} onChange={e => setAnimalNom(e.target.value)} placeholder="Ex: Vache 01" style={ipt} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 5 }}>Type d'animal</label>
                      <input value={animalType} onChange={e => setAnimalType(e.target.value)} placeholder="Ex: Vache, Mouton..." style={ipt} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 5 }}><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Date souhaitée *</label>
                    <input type="date" value={dateRdv} onChange={e => setDateRdv(e.target.value)} min={new Date().toISOString().split('T')[0]} style={ipt} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 5 }}>Motif / Symptômes *</label>
                    <textarea value={motif} onChange={e => setMotif(e.target.value)} placeholder="Décrivez les symptômes de l'animal..." rows={4}
                      style={{ ...ipt, resize: 'vertical' as const }} />
                  </div>

                  {/* Selected vet summary */}
                  <div style={{ backgroundColor: '#f0faf3', borderRadius: 8, padding: 12, border: '1px solid #27ae60' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#27ae60', marginBottom: 6 }}>✅ Vétérinaire sélectionné</div>
                    <div style={{ fontSize: 13, color: '#2c3e50' }}><strong>{selectedVet.nom}</strong> — {selectedVet.specialite}</div>
                    <div style={{ fontSize: 12, color: '#7f8c8d', marginTop: 3, display: 'flex', gap: 12 }}>
                      <span><MapPin size={11} style={{ verticalAlign: 'middle' }} /> {selectedVet.ville}</span>
                      <span><Mail size={11} style={{ verticalAlign: 'middle' }} /> {selectedVet.email}</span>
                    </div>
                  </div>

                  <button onClick={handleBook} disabled={booking} style={{
                    backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: 8,
                    padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e8449'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#27ae60'}>
                    <Calendar size={18} /> {booking ? 'Envoi en cours...' : 'Confirmer le RDV'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={card}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2c3e50', margin: '0 0 16px' }}>Mes rendez-vous</h3>
          {rdvHistory.length === 0 ? (
            <p style={{ color: '#7f8c8d', textAlign: 'center', padding: 30 }}>Aucun rendez-vous enregistré</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {['Animal', 'Vétérinaire', 'Date', 'Motif', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #dee2e6' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rdvHistory.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ecf0f1' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.animal_nom} <span style={{ color: '#7f8c8d', fontWeight: 400 }}>({r.animal_type})</span></td>
                    <td style={{ padding: '10px 12px' }}>{r.veterinaire_nom}</td>
                    <td style={{ padding: '10px 12px' }}>{r.date_rdv}</td>
                    <td style={{ padding: '10px 12px', color: '#7f8c8d' }}>{r.motif?.substring(0, 40)}{r.motif?.length > 40 ? '...' : ''}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        backgroundColor: r.statut === 'Confirme' ? '#d5f5e3' : r.statut === 'Annule' ? '#fadbd8' : '#fef9e7',
                        color: r.statut === 'Confirme' ? '#27ae60' : r.statut === 'Annule' ? '#e74c3c' : '#f39c12',
                      }}>{r.statut}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default RendezVous;