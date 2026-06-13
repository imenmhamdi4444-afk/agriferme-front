import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../api/profile';
import { useToast } from '../hooks/useToast';
import { useDarkMode } from '../context/DarkModeContext';
import Toast from './Toast';
import { User, Phone, Mail, Lock, Save, Key, Camera, Edit3 } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { cardBg, text, textSecondary, border, inputBg, bg } = useDarkMode();
  const { toast, showToast, hideToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nomComplet, setNomComplet] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string>('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Generate initials avatar from name
  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  // Generate color from name
  const getAvatarColor = (name: string) => {
    const colors = ['#27ae60', '#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    loadProfile();
    const saved = localStorage.getItem('userAvatar');
    if (saved) setAvatar(saved);
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      const data = res.data;
      setNomComplet(data.nom_complet || data.nomComplet || '');
      setTelephone(data.telephone || '');
      setEmail(data.email || '');
      setRole(data.role || '');
    } catch {
      showToast('Erreur de chargement', 'error');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image trop grande (max 2MB)', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
      localStorage.setItem('userAvatar', result);
      showToast('Photo mise à jour !', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!nomComplet.trim()) { showToast('Le nom est requis', 'warning'); return; }
    setLoading(true);
    try {
      await updateProfile({ nomComplet, telephone });
      showToast('Profil mis à jour !', 'success');
    } catch {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { showToast('Remplissez tous les champs', 'warning'); return; }
    if (newPassword !== confirmPassword) { showToast('Les mots de passe ne correspondent pas', 'warning'); return; }
    if (newPassword.length < 6) { showToast('Minimum 6 caractères', 'warning'); return; }
    setPwdLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.status === 200) {
        showToast('Mot de passe modifié !', 'success');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        showToast(res.data.error || 'Erreur', 'error');
      }
    } catch { showToast('Erreur', 'error'); }
    finally { setPwdLoading(false); }
  };

  const avatarColor = getAvatarColor(nomComplet || email || 'User');
  const initials = getInitials(nomComplet || email || 'U');
  const roleBadge = role === 'ADMIN' ? { bg: '#e8f5e9', color: '#27ae60', label: 'Administrateur' } : { bg: '#e3f2fd', color: '#3498db', label: 'Agriculteur' };

  const card: React.CSSProperties = { backgroundColor: cardBg, borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 20, border: `1px solid ${border}` };
  const ipt: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 8, border: `1.5px solid ${border}`, fontSize: 14, outline: 'none', backgroundColor: inputBg, color: text, boxSizing: 'border-box' as const };
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 6, display: 'block' };

  return (
    <div style={{ padding: '30px', maxWidth: 750, margin: '0 auto', backgroundColor: bg, minHeight: '100%' }}>

      {/* Avatar + Name header */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {avatar ? (
            <img src={avatar} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${avatarColor}` }} />
          ) : (
            <div style={{ width: 90, height: 90, borderRadius: '50%', backgroundColor: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white', border: `3px solid ${avatarColor}` }}>
              {initials}
            </div>
          )}
          <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', backgroundColor: '#27ae60', border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={13} color="white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
        </div>

        {/* Name + info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: text, margin: '0 0 4px 0' }}>
            {nomComplet || email}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: textSecondary }}>{email}</span>
            <span style={{ backgroundColor: roleBadge.bg, color: roleBadge.color, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
              {roleBadge.label}
            </span>
          </div>
          {telephone && (
            <div style={{ fontSize: 13, color: textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Phone size={13} /> {telephone}
            </div>
          )}
        </div>

        {/* Edit hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: textSecondary, fontSize: 12 }}>
          <Edit3 size={13} /> Cliquez sur la photo pour changer
        </div>
      </div>

      {/* Edit info */}
      <div style={card}>
        <h3 style={{ color: text, fontSize: 16, margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <User size={18} color="#27ae60" /> Modifier mes informations
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={lbl}><User size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Nom complet</label>
            <input value={nomComplet} onChange={e => setNomComplet(e.target.value)} style={ipt} placeholder="Votre nom complet"
              onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
              onBlur={e => e.currentTarget.style.borderColor = border} />
          </div>
          <div>
            <label style={lbl}><Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Téléphone</label>
            <input value={telephone} onChange={e => setTelephone(e.target.value)} style={ipt} placeholder="Votre numéro"
              onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
              onBlur={e => e.currentTarget.style.borderColor = border} />
          </div>
          <div>
            <label style={lbl}><Mail size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Email</label>
            <input value={email} disabled style={{ ...ipt, opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={lbl}>Rôle</label>
            <input value={roleBadge.label} disabled style={{ ...ipt, opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
        </div>
        <button onClick={handleSaveProfile} disabled={loading} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: 8, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e8449'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#27ae60'}>
          <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>

      {/* Change password */}
      <div style={card}>
        <h3 style={{ color: text, fontSize: 16, margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <Key size={18} color="#3498db" /> Changer le mot de passe
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {[
            { label: 'Mot de passe actuel', val: currentPassword, set: setCurrentPassword },
            { label: 'Nouveau mot de passe', val: newPassword, set: setNewPassword },
            { label: 'Confirmer le nouveau mot de passe', val: confirmPassword, set: setConfirmPassword },
          ].map((field, i) => (
            <div key={i}>
              <label style={lbl}><Lock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {field.label}</label>
              <input type="password" value={field.val} onChange={e => field.set(e.target.value)} style={ipt}
                onFocus={e => e.currentTarget.style.borderColor = '#3498db'}
                onBlur={e => e.currentTarget.style.borderColor = border} />
            </div>
          ))}
        </div>
        <button onClick={handleChangePassword} disabled={pwdLoading} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: 8, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2980b9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#3498db'}>
          <Key size={16} /> {pwdLoading ? 'Modification...' : 'Changer le mot de passe'}
        </button>
      </div>

      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
};

export default Profile;