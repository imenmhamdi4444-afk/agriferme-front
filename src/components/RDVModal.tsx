import React, { useState, useEffect } from 'react';
import { getVeterinaires, createRendezVous, Veterinaire } from '../api/veterinaires';
import { sendRdvEmail } from '../api/emailjs';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import { Search, MapPin, Stethoscope, Calendar, X, Phone, Mail, CheckCircle } from 'lucide-react';

interface Props {
  animalNom: string;
  animalType: string;
  maladie: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RDVModal: React.FC<Props> = ({ animalNom, animalType, maladie, onClose, onSuccess }) => {
  const { toast, showToast, hideToast } = useToast();
  const [vets, setVets] = useState<Veterinaire[]>([]);
  const [filteredVets, setFilteredVets] = useState<Veterinaire[]>([]);
  const [search, setSearch] = useState('');
  const [selectedVet, setSelectedVet] = useState<Veterinaire | null>(null);
  const [dateRdv, setDateRdv] = useState('');
  const [motif, setMotif] = useState(maladie || '');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'done'>('select');

  useEffect(() => {
    loadVets();
  }, []);

  useEffect(() => {
    if (!search) { setFilteredVets(vets); return; }
    const s = search.toLowerCase();
    setFilteredVets(vets.filter(v =>
      v.nom.toLowerCase().includes(s) ||
      v.ville?.toLowerCase().includes(s) ||
      v.specialite?.toLowerCase().includes(s)
    ));
  }, [search, vets]);

  const loadVets = async () => {
    try {
      const res = await getVeterinaires();
      setVets(Array.isArray(res.data) ? res.data : []);
      setFilteredVets(Array.isArray(res.data) ? res.data : []);
    } catch { showToast('Erreur chargement vétérinaires', 'error'); }
  };

  const handleBook = async () => {
    if (!selectedVet) { showToast('Sélectionnez un vétérinaire', 'warning'); return; }
    if (!dateRdv) { showToast('Choisissez une date', 'warning'); return; }
    setLoading(true);
    try {
      // Save RDV in DB
      await createRendezVous({
        animalNom, animalType,
        veterinaireId: selectedVet.id,
        veterinaireNom: selectedVet.nom,
        dateRdv, motif,
      });

      // Send email to vet
      await sendRdvEmail({
        animalNom, typeAnimal: animalType,
        maladie: motif, dateRdv,
        motif, vet_email: selectedVet.email,
      });

      setStep('done');
      onSuccess();
    } catch (e) {
      showToast('Erreur lors de la réservation', 'error');
    } finally { setLoading(false); }
  };

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  };
  const modal: React.CSSProperties = {
    backgroundColor: 'white', borderRadius: 14, width: '100%', maxWidth: 560,
    maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  };
  const ipt: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid #bdc3c7', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
  };

  if (step === 'done') return (
    <div style={overlay}>
      <div style={{ ...modal, padding: 36, textAlign: 'center' }}>
        <CheckCircle size={56} color="#27ae60" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#2c3e50', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>RDV confirmé !</h2>
        <p style={{ color: '#7f8c8d', fontSize: 15, margin: '0 0 6px' }}>
          Votre demande a été envoyée à <strong>{selectedVet?.nom}</strong>
        </p>
        <p style={{ color: '#7f8c8d', fontSize: 14, margin: '0 0 24px' }}>
          📅 {dateRdv} · 🐄 {animalNom}
        </p>
        <p style={{ color: '#95a5a6', fontSize: 13, margin: '0 0 24px' }}>
          Le vétérinaire a reçu un email et vous contactera pour confirmer.
        </p>
        <button onClick={onClose} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Fermer
        </button>
      </div>
    </div>
  );

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#2c3e50', fontSize: 20, fontWeight: 700, margin: 0 }}>Prendre un RDV vétérinaire</h2>
            <p style={{ color: '#7f8c8d', fontSize: 13, margin: '4px 0 0' }}>🐄 {animalNom} · {animalType}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7f8c8d' }}><X size={22} /></button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Search vets */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#2c3e50', display: 'block', marginBottom: 8 }}>
              Choisir un vétérinaire partenaire
            </label>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={16} color="#7f8c8d" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, ville, spécialité..."
                style={{ ...ipt, paddingLeft: 36 }}
                onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
                onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            </div>

            {/* Vet list */}
            <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid #ecf0f1', borderRadius: 8 }}>
              {filteredVets.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#95a5a6', fontSize: 14 }}>Aucun vétérinaire trouvé</div>
              ) : filteredVets.map(vet => (
                <div key={vet.id} onClick={() => setSelectedVet(vet)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: '1px solid #f8f9fa',
                    backgroundColor: selectedVet?.id === vet.id ? '#e8f5e9' : 'transparent',
                    border: selectedVet?.id === vet.id ? '2px solid #27ae60' : '1px solid transparent',
                    borderRadius: selectedVet?.id === vet.id ? 8 : 0,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedVet?.id !== vet.id) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                  onMouseLeave={e => { if (selectedVet?.id !== vet.id) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  
                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Stethoscope size={20} color="#27ae60" />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#2c3e50' }}>{vet.nom}</div>
                    <div style={{ fontSize: 12, color: '#7f8c8d', display: 'flex', gap: 10, marginTop: 2 }}>
                      <span><Stethoscope size={11} style={{ verticalAlign: 'middle' }} /> {vet.specialite}</span>
                      <span><MapPin size={11} style={{ verticalAlign: 'middle' }} /> {vet.ville}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 2, display: 'flex', gap: 10 }}>
                      <span><Phone size={11} style={{ verticalAlign: 'middle' }} /> {vet.telephone}</span>
                      <span><Mail size={11} style={{ verticalAlign: 'middle' }} /> {vet.email}</span>
                    </div>
                  </div>

                  {selectedVet?.id === vet.id && <CheckCircle size={20} color="#27ae60" />}
                </div>
              ))}
            </div>
          </div>

          {/* Date & Motif */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#2c3e50', display: 'block', marginBottom: 6 }}>
                <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Date souhaitée
              </label>
              <input type="date" value={dateRdv} onChange={e => setDateRdv(e.target.value)}
                min={new Date().toISOString().split('T')[0]} style={ipt}
                onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
                onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#2c3e50', display: 'block', marginBottom: 6 }}>
                Motif / Symptômes
              </label>
              <input value={motif} onChange={e => setMotif(e.target.value)} placeholder="Fièvre, boiterie..."
                style={ipt}
                onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
                onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            </div>
          </div>

          {/* Selected vet summary */}
          {selectedVet && (
            <div style={{ backgroundColor: '#e8f5e9', borderRadius: 8, padding: '12px 16px', marginBottom: 16, border: '1px solid #a9dfbf' }}>
              <p style={{ margin: 0, fontSize: 14, color: '#1e8449', fontWeight: 600 }}>
                ✅ Vétérinaire sélectionné: {selectedVet.nom} — {selectedVet.ville}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#27ae60' }}>
                Un email de demande RDV sera envoyé automatiquement à ce vétérinaire.
              </p>
            </div>
          )}

          {/* Book button */}
          <button onClick={handleBook} disabled={loading || !selectedVet || !dateRdv}
            style={{
              width: '100%', padding: '13px', backgroundColor: selectedVet && dateRdv ? '#27ae60' : '#bdc3c7',
              color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
              cursor: selectedVet && dateRdv ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (selectedVet && dateRdv) e.currentTarget.style.backgroundColor = '#1e8449'; }}
            onMouseLeave={e => { if (selectedVet && dateRdv) e.currentTarget.style.backgroundColor = '#27ae60'; }}>
            {loading ? 'Envoi en cours...' : '📅 Confirmer le RDV'}
          </button>
        </div>
      </div>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default RDVModal;