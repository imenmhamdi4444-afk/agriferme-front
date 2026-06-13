import API_URL from '../api/config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendResetCodeEmail } from '../api/emailjs';
import { Mail, Key, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

type Step = 'email' | 'code' | 'password' | 'done';



const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ipt: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 8,
    border: '1.5px solid #bdc3c7', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const btn: React.CSSProperties = {
    width: '100%', padding: '12px', backgroundColor: '#27ae60',
    color: 'white', border: 'none', borderRadius: 8, fontSize: 15,
    fontWeight: 700, cursor: 'pointer', marginTop: 8,
  };

  // Step 1: Request code
  const handleRequestCode = async () => {
    if (!email.trim()) { setError('Entrez votre email'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      // Send code via EmailJS
      await sendResetCodeEmail(email, data.code);
      setStep('code');
    } catch { setError('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  // Step 2: Verify code
  const handleVerifyCode = () => {
    if (code.length !== 6) { setError('Entrez le code à 6 chiffres'); return; }
    setError('');
    setStep('password');
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { setError('Remplissez tous les champs'); return; }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (newPassword.length < 6) { setError('Minimum 6 caractères'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setStep('done');
    } catch { setError('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 36, width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>

        {/* Back button */}
        {step !== 'done' && (
          <button onClick={() => step === 'email' ? navigate('/') : setStep(step === 'code' ? 'email' : 'code')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 14, padding: 0 }}>
            <ArrowLeft size={16} /> Retour
          </button>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {step === 'done' ? <CheckCircle size={30} color="#27ae60" /> : step === 'password' ? <Lock size={26} color="#27ae60" /> : step === 'code' ? <Key size={26} color="#27ae60" /> : <Mail size={26} color="#27ae60" />}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2c3e50', margin: '0 0 6px' }}>
            {step === 'done' ? 'Mot de passe réinitialisé !' : step === 'password' ? 'Nouveau mot de passe' : step === 'code' ? 'Vérification' : 'Mot de passe oublié'}
          </h2>
          <p style={{ fontSize: 14, color: '#7f8c8d', margin: 0 }}>
            {step === 'done' ? 'Vous pouvez maintenant vous connecter.' : step === 'password' ? 'Choisissez un nouveau mot de passe.' : step === 'code' ? `Code envoyé à ${email}` : 'Entrez votre email pour recevoir un code.'}
          </p>
        </div>

        {/* Error */}
        {error && <div style={{ backgroundColor: '#fdedec', color: '#e74c3c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" style={ipt}
              onKeyDown={e => e.key === 'Enter' && handleRequestCode()}
              onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
              onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            <button onClick={handleRequestCode} disabled={loading} style={btn}>
              {loading ? 'Envoi en cours...' : 'Envoyer le code'}
            </button>
          </>
        )}

        {/* Step 2: Code */}
        {step === 'code' && (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 6 }}>Code à 6 chiffres</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"
              style={{ ...ipt, fontSize: 28, letterSpacing: 12, textAlign: 'center', fontWeight: 700 }}
              onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
              onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
              onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            <p style={{ fontSize: 12, color: '#7f8c8d', textAlign: 'center', margin: '8px 0 0' }}>Le code expire dans 15 minutes</p>
            <button onClick={handleVerifyCode} style={btn}>Vérifier le code</button>
          </>
        )}

        {/* Step 3: New password */}
        {step === 'password' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 6 }}>Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={ipt}
                onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
                onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'block', marginBottom: 6 }}>Confirmer le mot de passe</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={ipt}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                onFocus={e => e.currentTarget.style.borderColor = '#27ae60'}
                onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'} />
            </div>
            <button onClick={handleResetPassword} disabled={loading} style={btn}>
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <button onClick={() => navigate('/')} style={btn}>
            Se connecter
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;