import { useTranslation } from '../context/LanguageContext';
import React, { useState, useEffect } from 'react';
import { getVeterinaires, createRendezVous, Veterinaire } from '../api/veterinaires';
import { sendRdvEmail } from '../api/emailjs';
import { useAuth } from '../context/AuthContext';
import { X, MapPin, Phone, Mail, Stethoscope, Calendar, Search } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

interface Props {
  animal: { id: number; nom: string; typeAnimal: string; maladie?: string };
  onClose: () => void;
  onSuccess: () => void;
}

const RDVModal: React.FC<Props> = ({ animal, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [vets, setVets] = useState<Veterinaire[]>([]);
  const [filtered, setFiltered] = useState<Veterinaire[]>([]);
  const [search, setSearch] = useState('');
  const [selectedVet, setSelectedVet] = useState<Veterinaire | null>(null);
  const [dateRdv, setDateRdv] = useState('');
  const [motif, setMotif] = useState(animal.maladie || '');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  useEffect(() => {
    loadVets();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFiltered(vets.filter(v =>
        v.nom.toLowerCase().includes(search.toLowerCase()) ||
        v.ville.toLowerCase().includes(search.toLowerCase()) ||
        v.specialite.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFiltered(vets);
    }
  }, [search, vets]);

  const loadVets = async () => {
    try {
      const res = await getVeterinaires();
      setVets(Array.isArray(res.data) ? res.data : []);
      setFiltered(Array.isArray(res.data) ? res.data : []);
    } catch { showToast('Erreur de chargement des vétérinaires', 'error'); }
  };

  const handleConfirm = async () => {
    if (!selectedVet) { showToast(t('vet.none'), 'warning'); return; }
    if (!dateRdv) { showToast('Choisissez une date', 'warning'); return; }
    setLoading(true);
    try {
      // Save RDV in DB
      await createRendezVous({
        animalNom: animal.nom,
        animalType: animal.typeAnimal,
        veterinaireId: selectedVet.id,
        veterinaireNom: selectedVet.nom,
        dateRdv,
        motif,
      });
      // Send email to vet
      try {
        await sendRdvEmail({
          animal_nom: animal.nom,
          type_animal: animal.typeAnimal,
          maladie: animal.maladie || motif,
          date_rdv: dateRdv,
          motif,
          vet_email: selectedVet.email,
          vet_nom: selectedVet.nom,
          farmer_email: user?.email || '',
        });
      } catch { /* email failure doesn't block RDV */ }
      showToast(`RDV confirmé avec ${selectedVet.nom} !`, 'success');
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch { showToast('Erreur lors de la réservation', 'error'); }
    finally { setLoading(false); }
  };

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  };
  const modal: React.CSSProperties = {
    backgroundColor: 'white', borderRadius: 12, width: '100%', maxWidth: 600,
    maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#2c3e50' }}>
              {step === 'select' ? 'Choisir un vétérinaire' : t('vet.confirm')}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#7f8c8d' }}>
              Animal: <strong>{animal.nom}</strong> ({animal.typeAnimal})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="#7f8c8d" />
          </button>
        </div>

        {/* Step 1 - Select vet */}
        {step === 'select' && (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#7f8c8d" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, ville ou spécialité..."
                  style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8, border: '1.5px solid #bdc3c7', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
                  onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#7f8c8d' }}>{t("vet.none")}</div>
              ) : filtered.map(vet => (
                <div key={vet.id} onClick={() => setSelectedVet(vet)}
                  style={{
                    padding: '14px 16px', borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                    border: `2px solid ${selectedVet?.id === vet.id ? '#27ae60' : '#ecf0f1'}`,
                    backgroundColor: selectedVet?.id === vet.id ? '#f0fdf4' : 'white',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (selectedVet?.id !== vet.id) e.currentTarget.style.borderColor = '#bdc3c7'; }}
                  onMouseLeave={e => { if (selectedVet?.id !== vet.id) e.currentTarget.style.borderColor = '#ecf0f1'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#2c3e50' }}>{vet.nom}</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: '#27ae60', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Stethoscope size={13} /> {vet.specialite}
                        </span>
                        <span style={{ fontSize: 13, color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} /> {vet.ville}
                        </span>
                        <span style={{ fontSize: 13, color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={13} /> {vet.telephone}
                        </span>
                      </div>
                    </div>
                    <span style={{ backgroundColor: '#e8f5e9', color: '#27ae60', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                      Disponible
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #ecf0f1' }}>
              <button onClick={() => { if (!selectedVet) { showToast(t('vet.none'), 'warning'); return; } setStep('confirm'); }}
                style={{ width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Continuer →
              </button>
            </div>
          </>
        )}

        {/* Step 2 - Confirm */}
        {step === 'confirm' && selectedVet && (
          <div style={{ padding: 20, overflowY: 'auto' }}>
            {/* Selected vet summary */}
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid #bbf7d0' }}>
              <div style={{ fontWeight: 700, color: '#2c3e50', marginBottom: 4 }}>{selectedVet.nom}</div>
              <div style={{ fontSize: 13, color: '#7f8c8d' }}>{selectedVet.specialite} • {selectedVet.ville}</div>
              <div style={{ fontSize: 13, color: '#7f8c8d', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={12} /> {selectedVet.email}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 6 }}>
                <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Date du RDV
              </label>
              <input type="date" value={dateRdv} onChange={e => setDateRdv(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #bdc3c7', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
                onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 6 }}>Motif / Symptômes</label>
              <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
                placeholder="Décrivez les symptômes ou la raison du RDV..."
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #bdc3c7', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
                onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('select')} style={{ flex: 1, padding: '12px', backgroundColor: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ← Retour
              </button>
              <button onClick={handleConfirm} disabled={loading} style={{ flex: 2, padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                {loading ? 'Envoi...' : '✓ Confirmer le RDV'}
              </button>
            </div>
          </div>
        )}
      </div>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default RDVModal;