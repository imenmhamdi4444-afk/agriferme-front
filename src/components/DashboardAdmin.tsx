import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUtilisateurs, getStatistiquesAdmin, createUtilisateur, updateUtilisateur, deleteUtilisateur, donnerAcces, bloquerAcces } from '../api/utilisateurs';
import { getAllVeterinaires, createVeterinaire, updateVeterinaire, deleteVeterinaire, activerVet, desactiverVet, getRendezVous, Veterinaire } from '../api/veterinaires';
import { Utilisateur, StatistiquesAdmin } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Users, BarChart3, Plus, Pencil, Trash2, RefreshCw, CheckCircle, Shield, AlertCircle, Percent, UserCheck, UserX, Stethoscope, TrendingUp, DollarSign, Ban, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DashboardAdmin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [stats, setStats] = useState<StatistiquesAdmin | null>(null);
  const [activeTab, setActiveTab] = useState('users');

  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState('AGRICULTEUR');
  const [telephone, setTelephone] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Veterinaires State
  const [vets, setVets] = useState<Veterinaire[]>([]);
  const [vetNom, setVetNom] = useState('');
  const [vetEmail, setVetEmail] = useState('');
  const [vetTelephone, setVetTelephone] = useState('');
  const [vetSpecialite, setVetSpecialite] = useState('');
  const [vetVille, setVetVille] = useState('');
  const [vetCommissionMontant, setVetCommissionMontant] = useState('');
  const [editingVetId, setEditingVetId] = useState<number | null>(null);

  // RendezVous (Referrals) State
  const [allRdvs, setAllRdvs] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [usersRes, statsRes, vetsRes, rdvRes] = await Promise.all([
        getUtilisateurs(),
        getStatistiquesAdmin(),
        getAllVeterinaires(),
        getRendezVous()
      ]);
      setUtilisateurs(usersRes.data);
      setStats(statsRes.data);
      setVets(Array.isArray(vetsRes.data) ? vetsRes.data : []);
      setAllRdvs(Array.isArray(rdvRes.data) ? rdvRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetNom.trim() || !vetEmail.trim() || !vetSpecialite.trim() || !vetVille.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    try {
      const payload = {
        nom: vetNom,
        email: vetEmail,
        telephone: vetTelephone,
        specialite: vetSpecialite,
        ville: vetVille,
        commissionMontant: parseFloat(vetCommissionMontant) || 0,
        statut: 'ACTIF'
      };
      if (editingVetId) {
        await updateVeterinaire(editingVetId, payload);
      } else {
        await createVeterinaire(payload);
      }
      resetVetForm();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEditVet = (v: Veterinaire) => {
    setEditingVetId(v.id);
    setVetNom(v.nom);
    setVetEmail(v.email);
    setVetTelephone(v.telephone || '');
    setVetSpecialite(v.specialite);
    setVetVille(v.ville);
  };

  const handleDeleteVet = async (id: number) => {
    if (window.confirm('Supprimer ce vétérinaire ?')) {
      await deleteVeterinaire(id);
      if (editingVetId === id) resetVetForm();
      loadData();
    }
  };

  const handleActiverVet = async (id: number) => {
    await activerVet(id);
    loadData();
  };

  const handleDesactiverVet = async (id: number) => {
    await desactiverVet(id);
    loadData();
  };

  const resetVetForm = () => {
    setEditingVetId(null);
    setVetNom('');
    setVetEmail('');
    setVetTelephone('');
    setVetSpecialite('');
    setVetVille('');
  };

  const groupRdvsByVet = () => {
    const grouped: Record<number, {
      vetId: number; vetNom: string; specialite: string; ville: string;
      commissionMontant: number; totalCount: number; monthCount: number;
    }> = {};
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    // seed all active vets so vets with 0 RDVs still appear
    vets.forEach((v: any) => {
      grouped[v.id] = {
        vetId: v.id, vetNom: v.nom, specialite: v.specialite,
        ville: v.ville, commissionMontant: parseFloat(v.commission_montant) || 0,
        totalCount: 0, monthCount: 0
      };
    });
    allRdvs.forEach((r: any) => {
      const vetId = r.veterinaire_id;
      if (vetId && grouped[vetId]) {
        grouped[vetId].totalCount += 1;
        const d = r.date_rdv || '';
        if (d.startsWith(currentMonthStr)) grouped[vetId].monthCount += 1;
      }
    });
    return Object.values(grouped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUtilisateur(editingId, { nomComplet, email, role, telephone });
      } else {
        await createUtilisateur({ nomComplet, email, motDePasse, role, telephone });
      }
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (u: Utilisateur) => {
    setEditingId(u.id);
    setNomComplet(u.nomComplet);
    setEmail(u.email);
    setRole(u.role);
    setTelephone(u.telephone);
    setMotDePasse('');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      await deleteUtilisateur(id);
      if (editingId === id) resetForm();
      loadData();
    }
  };

  const handleDeleteSelected = () => {
    if (editingId) handleDelete(editingId);
  };

  const resetForm = () => {
    setEditingId(null);
    setNomComplet('');
    setEmail('');
    setMotDePasse('');
    setRole('AGRICULTEUR');
    setTelephone('');
  };

  const renderStatVBox = (icon: React.ReactNode, label: string, value: number | string, color: string, valueSize: number = 24) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
      backgroundColor: 'white', borderRadius: 10, padding: '15px 20px',
      flex: 1, minWidth: 120, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, color: '#555' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: valueSize, fontWeight: 'bold', color, margin: 0 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <style>{`
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        .tab-btn:hover { background-color: #dfe6e9; }
        .btn-hover { transition: all 0.2s ease; cursor: pointer; }
        .btn-hover:hover { opacity: 0.85; transform: scale(1.04); }
        .row-hover { transition: background-color 0.15s ease; cursor: pointer; }
        .row-hover:hover { background-color: #f0f4f8 !important; }
        @media (max-width: 768px) {
          .form-wrap { flex-wrap: wrap; }
          .stats-wrap { flex-wrap: wrap; }
        }
      `}</style>

      {/* Tab Bar */}
      <div style={{ display: 'flex', paddingLeft: 20, paddingTop: 20, gap: 0 }}>
        <button
          className="tab-btn"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 22px', border: 'none', borderRadius: '8px 8px 0 0',
            fontSize: 14,
            backgroundColor: activeTab === 'users' ? '#ffffff' : '#bdc3c7',
            color: '#2c3e50',
            borderBottom: activeTab === 'users' ? '2px solid #ffffff' : '2px solid transparent',
            fontWeight: activeTab === 'users' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={16} /> {t('admin.usersTab')}
          </div>
        </button>
        <button
          className="tab-btn"
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '10px 22px', border: 'none', borderRadius: '8px 8px 0 0',
            fontSize: 14,
            backgroundColor: activeTab === 'reports' ? '#ffffff' : '#bdc3c7',
            color: '#2c3e50',
            borderBottom: activeTab === 'reports' ? '2px solid #ffffff' : '2px solid transparent',
            fontWeight: activeTab === 'reports' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={16} /> {t('admin.reportsTab')}
          </div>
        </button>
        <button
          className="tab-btn"
          onClick={() => setActiveTab('veterinaires')}
          style={{
            padding: '10px 22px', border: 'none', borderRadius: '8px 8px 0 0',
            fontSize: 14,
            backgroundColor: activeTab === 'veterinaires' ? '#ffffff' : '#bdc3c7',
            color: '#2c3e50',
            borderBottom: activeTab === 'veterinaires' ? '2px solid #ffffff' : '2px solid transparent',
            fontWeight: activeTab === 'veterinaires' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stethoscope size={16} /> {t('admin.vets')}
          </div>
        </button>
        <button
          className="tab-btn"
          onClick={() => setActiveTab('commissions')}
          style={{
            padding: '10px 22px', border: 'none', borderRadius: '8px 8px 0 0',
            fontSize: 14,
            backgroundColor: activeTab === 'commissions' ? '#ffffff' : '#bdc3c7',
            color: '#2c3e50',
            borderBottom: activeTab === 'commissions' ? '2px solid #ffffff' : '2px solid transparent',
            fontWeight: activeTab === 'commissions' ? 'bold' : 'normal',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} /> {t('admin.commissions')}
          </div>
        </button>
        <div style={{ flex: 1, borderBottom: '2px solid #bdc3c7' }} />
      </div>

      {/* Tab Content */}
      <div style={{
        backgroundColor: '#ffffff', margin: '0 20px 20px 20px',
        borderRadius: '0 8px 8px 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', flex: 1,
      }}>
        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div style={{ color: '#2c3e50', fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
              {t('admin.userList')}
            </div>

            <form onSubmit={handleSubmit} className="form-wrap" style={{
              display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <input placeholder={t('admin.nomComplet')} value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 5, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 36, width: 180 }} />
              <input placeholder={t('admin.email')} value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 5, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 36, width: 180 }} />
              <input type="password" placeholder={t('admin.password')} value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 5, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 36, width: 150 }} />
              <select value={role} onChange={(e) => setRole(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 5, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 36, width: 120, backgroundColor: 'white', cursor: 'pointer' }}>
                <option value="AGRICULTEUR">{t('app.agriculteur')}</option>
                <option value="ADMIN">{t('app.admin')}</option>
              </select>
              <input placeholder={t('admin.telephone')} value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 5, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 36, width: 120 }} />
              <button type="submit" className="btn-hover" style={{
                backgroundColor: editingId ? '#3498db' : '#27ae60', color: 'white', border: 'none',
                borderRadius: 5, padding: '6px 14px', fontSize: 13, fontWeight: 'bold', height: 36,
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
              }}>
                {editingId ? <Pencil size={14} /> : <Plus size={14} />}
                {editingId ? t('admin.modifier') : t('admin.ajouter')}
              </button>
              <button type="button" onClick={() => editingId ? (() => { const u = utilisateurs.find(x => x.id === editingId); if (u) handleEdit(u); })() : null}
                className="btn-hover" style={{
                  backgroundColor: '#3498db', color: 'white', border: 'none',
                  borderRadius: 5, padding: '6px 14px', fontSize: 13, fontWeight: 'bold', height: 36,
                  display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                }}>
                <Pencil size={14} /> {t('admin.modifier')}
              </button>
              <button type="button" onClick={handleDeleteSelected}
                className="btn-hover" style={{
                  backgroundColor: '#e74c3c', color: 'white', border: 'none',
                  borderRadius: 5, padding: '6px 14px', fontSize: 13, fontWeight: 'bold', height: 36,
                  display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                }}>
                <Trash2 size={14} /> {t('admin.supprimer')}
              </button>
              <button type="button" onClick={loadData} className="btn-hover" style={{
                backgroundColor: '#2c3e50', color: 'white', border: 'none',
                borderRadius: 5, padding: '6px 14px', fontSize: 13, fontWeight: 'bold', height: 36,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <RefreshCw size={14} />
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-hover" style={{
                  backgroundColor: '#95a5a6', color: 'white', border: 'none',
                  borderRadius: 5, padding: '6px 14px', fontSize: 13, height: 36,
                }}>
                  Annuler
                </button>
              )}
            </form>

            {/* Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e0e4e8', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 870 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', fontSize: 12, backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textTransform: 'uppercase', letterSpacing: 0.3, width: 50 }}>{t('admin.id')}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', fontSize: 12, backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textTransform: 'uppercase', letterSpacing: 0.3, width: 180 }}>{t('admin.nomComplet')}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', fontSize: 12, backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textTransform: 'uppercase', letterSpacing: 0.3, width: 200 }}>{t('admin.email')}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', fontSize: 12, backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textTransform: 'uppercase', letterSpacing: 0.3, width: 100 }}>{t('admin.role')}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', fontSize: 12, backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textTransform: 'uppercase', letterSpacing: 0.3, width: 120 }}>{t('admin.telephone')}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', fontSize: 12, backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textTransform: 'uppercase', letterSpacing: 0.3, width: 100 }}>{t('admin.statut')}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', fontSize: 12, backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textTransform: 'uppercase', letterSpacing: 0.3, width: 120 }}>{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {utilisateurs.map((u) => (
                    <tr key={u.id} className="row-hover"
                      style={{ borderBottom: '1px solid #eef0f2', backgroundColor: editingId === u.id ? '#eef5ff' : undefined }}
                      onClick={() => handleEdit(u)}>
                      <td style={{ padding: '8px 8px', verticalAlign: 'middle' }}>{u.id}</td>
                      <td style={{ padding: '8px 8px', verticalAlign: 'middle' }}>{u.nomComplet}</td>
                      <td style={{ padding: '8px 8px', verticalAlign: 'middle' }}>{u.email}</td>
                      <td style={{ padding: '8px 8px', verticalAlign: 'middle' }}>{u.role}</td>
                      <td style={{ padding: '8px 8px', verticalAlign: 'middle' }}>{u.telephone}</td>
                      <td style={{ padding: '8px 8px', verticalAlign: 'middle' }}>
                        <span style={{
                          color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 11,
                          fontWeight: 'bold', display: 'inline-flex', alignItems: 'center',
                          backgroundColor: u.statut === 'ACTIF' ? '#27ae60' : '#e74c3c',
                        }}>
                          {u.statut === 'ACTIF' ? <CheckCircle size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} /> : <AlertCircle size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
                          {u.statut}
                        </span>
                      </td>
                      <td style={{ padding: '8px 8px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={(e) => { e.stopPropagation(); donnerAcces(u.id).then(loadData); }}
                            className="btn-hover"
                            style={{ color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', backgroundColor: '#27ae60' }}>
                            <CheckCircle size={13} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); bloquerAcces(u.id).then(loadData); }}
                            className="btn-hover"
                            style={{ color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', backgroundColor: '#e74c3c' }}>
                            <AlertCircle size={13} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}
                            className="btn-hover"
                            style={{ color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', backgroundColor: '#c0392b' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {utilisateurs.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#95a5a6' }}>
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Stats Cards - VBox style matching FXML */}
            <div className="stats-wrap" style={{ display: 'flex', gap: 15 }}>
              {renderStatVBox(<Users size={14} />, t('admin.total'), stats?.totalUtilisateurs ?? 0, '#2c3e50')}
              {renderStatVBox(<Shield size={14} />, t('admin.admins'), stats?.totalAdmins ?? 0, '#3498db')}
              {renderStatVBox(<Users size={14} />, t('admin.agriculteurs'), stats?.totalAgriculteurs ?? 0, '#27ae60')}
              {renderStatVBox(<CheckCircle size={14} />, t('admin.actifs'), stats?.totalActifs ?? 0, '#27ae60')}
            </div>
          </div>
        )}

        {/* Tab 2: Reports */}
        {activeTab === 'reports' && stats && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#2c3e50', fontSize: 20, fontWeight: 'bold' }}>
                <BarChart3 size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                {t('admin.userStats')}
              </div>
              <button onClick={loadData} className="btn-hover" style={{
                backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: 6,
                padding: '8px 18px', fontSize: 13, fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <RefreshCw size={14} /> {t('admin.refreshStats')}
              </button>
            </div>

            {/* Big stat cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              {[
                { icon: <Users size={22} />, label: 'Total', value: stats.totalUtilisateurs, color: '#2c3e50', bg: '#eef2f7' },
                { icon: <UserCheck size={22} />, label: 'Actifs', value: stats.totalActifs, color: '#27ae60', bg: '#eafaf1' },
                { icon: <UserX size={22} />, label: 'Bloqués', value: stats.totalBloques, color: '#e74c3c', bg: '#fdedec' },
                { icon: <Shield size={22} />, label: 'Admins', value: stats.totalAdmins, color: '#3498db', bg: '#ebf5fb' },
                { icon: <Users size={22} />, label: 'Agriculteurs', value: stats.totalAgriculteurs, color: '#8e44ad', bg: '#f4ecf7' },
              ].map((card, i) => (
                <div key={i} style={{
                  background: card.bg, borderRadius: 12, padding: '18px 16px',
                  display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ color: card.color, opacity: 0.7 }}>{card.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: card.color, lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 13, color: '#7f8c8d', fontWeight: 500 }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{
                backgroundColor: '#fafafa', borderRadius: 12, padding: 20,
                border: '1px solid #edf2f7', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 }}>
                  <Shield size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Répartition par rôle
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ResponsiveContainer width="60%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Admins', value: stats.totalAdmins },
                          { name: 'Agriculteurs', value: stats.totalAgriculteurs },
                        ]}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                        dataKey="value" startAngle={90} endAngle={-270}
                      >
                        <Cell fill="#3498db" />
                        <Cell fill="#8e44ad" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#3498db' }} />
                      <span style={{ fontSize: 13, color: '#555' }}>Admins ({stats.totalAdmins})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#8e44ad' }} />
                      <span style={{ fontSize: 13, color: '#555' }}>Agriculteurs ({stats.totalAgriculteurs})</span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#95a5a6' }}>
                      Taux d'admin : <strong>{stats.totalUtilisateurs > 0 ? Math.round(stats.totalAdmins / stats.totalUtilisateurs * 100) : 0}%</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#fafafa', borderRadius: 12, padding: 20,
                border: '1px solid #edf2f7', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 }}>
                  <UserCheck size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Répartition par statut
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={[
                    { name: 'Actifs', value: stats.totalActifs, fill: '#27ae60' },
                    { name: 'Bloqués', value: stats.totalBloques, fill: '#e74c3c' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7f8c8d' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#7f8c8d' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {[{ fill: '#27ae60' }, { fill: '#e74c3c' }].map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom section: profils récents & email domains */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Derniers inscrits */}
              <div style={{
                backgroundColor: '#fafafa', borderRadius: 12, padding: 20,
                border: '1px solid #edf2f7', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 14 }}>
                  <Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Derniers inscrits
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {utilisateurs.slice(-4).reverse().map((u) => (
                    <div key={u.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', backgroundColor: 'white', borderRadius: 8,
                      border: '1px solid #eef1f4',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#2c3e50' }}>{u.nomComplet}</div>
                        <div style={{ fontSize: 11, color: '#95a5a6' }}>{u.email}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 'bold', padding: '2px 8px', borderRadius: 10,
                          color: 'white',
                          backgroundColor: u.role === 'ADMIN' ? '#3498db' : '#8e44ad',
                        }}>
                          {u.role === 'ADMIN' ? 'Admin' : 'Agri'}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 'bold', padding: '2px 8px', borderRadius: 10,
                          color: 'white',
                          backgroundColor: u.statut === 'ACTIF' ? '#27ae60' : '#e74c3c',
                        }}>
                          {u.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                  {utilisateurs.length === 0 && (
                    <div style={{ fontSize: 12, color: '#95a5a6', textAlign: 'center', padding: 12 }}>
                      Aucun utilisateur
                    </div>
                  )}
                </div>
              </div>

              {/* Fournisseurs email */}
              <div style={{
                backgroundColor: '#fafafa', borderRadius: 12, padding: 20,
                border: '1px solid #edf2f7', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 14 }}>
                  <Percent size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Répartition par domaine email
                </div>
                {(() => {
                  const domainCount: Record<string, number> = {};
                  utilisateurs.forEach((u) => {
                    const domain = u.email.split('@')[1] || 'inconnu';
                    domainCount[domain] = (domainCount[domain] || 0) + 1;
                  });
                  const domains = Object.entries(domainCount).sort((a, b) => b[1] - a[1]);
                  const maxVal = Math.max(...domains.map(([, c]) => c), 1);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {domains.map(([domain, count]) => (
                        <div key={domain}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: 13, color: '#555', marginBottom: 4,
                          }}>
                            <span>{domain}</span>
                            <span style={{ fontWeight: 600 }}>{count}</span>
                          </div>
                          <div style={{ height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${(count / maxVal) * 100}%`, borderRadius: 4,
                              background: 'linear-gradient(90deg, #3498db, #2ecc71)',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Vétérinaires */}
        {activeTab === 'veterinaires' && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div style={{ color: '#2c3e50', fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
              {t('admin.vets')}
            </div>

            {/* Vet Form */}
            <form onSubmit={handleVetSubmit} className="form-wrap" style={{
              display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
              backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input {...{placeholder: t('admin.vetName') + ' *'}} value={vetNom}
                  onChange={(e) => setVetNom(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 38, width: 160 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input type="email" {...{placeholder: t('admin.vetEmail') + ' *'}} value={vetEmail}
                  onChange={(e) => setVetEmail(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 38, width: 180 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input {...{placeholder: t('admin.vetPhone')}} value={vetTelephone}
                  onChange={(e) => setVetTelephone(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 38, width: 130 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input {...{placeholder: t('admin.vetSpeciality') + ' *'}} value={vetSpecialite}
                  onChange={(e) => setVetSpecialite(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 38, width: 140 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input {...{placeholder: t('admin.vetCity') + ' *'}} value={vetVille}
                  onChange={(e) => setVetVille(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 38, width: 120 }} />
              </div>
              
<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
<input type="number" min="0" step="0.5"
  placeholder="Commission/RDV (DT) — après accord"
  value={vetCommissionMontant}
  onChange={(e) => setVetCommissionMontant(e.target.value)}
  title="Montant fixe en DT par référencement, à remplir après accord avec le vétérinaire"
  style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #bdc3c7', fontSize: 13, outline: 'none', height: 38, width: 160 }} />
</div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button type="submit" className="btn-hover" style={{
                  backgroundColor: editingVetId ? '#3498db' : '#27ae60', color: 'white', border: 'none',
                  borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 'bold', height: 38,
                  display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                }}>
                  {editingVetId ? <Pencil size={14} /> : <Plus size={14} />}
                  {editingVetId ? 'Modifier' : 'Ajouter'}
                </button>
                {editingVetId && (
                  <button type="button" onClick={resetVetForm} className="btn-hover" style={{
                    backgroundColor: '#95a5a6', color: 'white', border: 'none',
                    borderRadius: 6, padding: '8px 16px', fontSize: 13, height: 38,
                  }}>
                    Annuler
                  </button>
                )}
              </div>
            </form>

            {/* Vets Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e0e4e8', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 50 }}>ID</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Nom</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Email</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 120 }}>Téléphone</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 130 }}>Spécialité</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 120 }}>Ville</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 100 }}>Statut</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50', width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vets.map((v) => (
                    <tr key={v.id} className="row-hover"
                      style={{ borderBottom: '1px solid #eef0f2', backgroundColor: editingVetId === v.id ? '#eef5ff' : undefined }}
                      onClick={() => handleEditVet(v)}>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>{v.id}</td>
                      <td style={{ padding: '10px', verticalAlign: 'middle', fontWeight: 600 }}>{v.nom}</td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>{v.email}</td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>{v.telephone || '-'}</td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                        <span style={{ backgroundColor: '#eef2f7', padding: '3px 8px', borderRadius: 4, color: '#2c3e50', fontWeight: 500 }}>
                          {v.specialite}
                        </span>
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>{v.ville}</td>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                        <span style={{
                          color: 'white', padding: '3px 10px', borderRadius: 12, fontSize: 11,
                          fontWeight: 'bold', display: 'inline-flex', alignItems: 'center',
                          backgroundColor: v.statut === 'ACTIF' ? '#27ae60' : '#e74c3c',
                        }}>
                          {v.statut === 'ACTIF' ? 'ACTIF' : 'INACTIF'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', verticalAlign: 'middle', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          {v.statut === 'ACTIF' ? (
                            <button onClick={() => handleDesactiverVet(v.id)}
                              className="btn-hover"
                              title="Désactiver"
                              style={{ color: 'white', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 12, backgroundColor: '#e67e22', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Ban size={13} /> Bloquer
                            </button>
                          ) : (
                            <button onClick={() => handleActiverVet(v.id)}
                              className="btn-hover"
                              title="Activer"
                              style={{ color: 'white', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 12, backgroundColor: '#27ae60', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle size={13} /> Activer
                            </button>
                          )}
                          <button onClick={() => handleEditVet(v)}
                            className="btn-hover"
                            style={{ color: 'white', border: 'none', borderRadius: 4, padding: '5px 8px', cursor: 'pointer', fontSize: 12, backgroundColor: '#3498db' }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteVet(v.id)}
                            className="btn-hover"
                            style={{ color: 'white', border: 'none', borderRadius: 4, padding: '5px 8px', cursor: 'pointer', fontSize: 12, backgroundColor: '#c0392b' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vets.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 30, textAlign: 'center', color: '#95a5a6' }}>
                        Aucun vétérinaire partenaire enregistré
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Vet Stats */}
            <div style={{ display: 'flex', gap: 15, marginTop: 10 }}>
              {renderStatVBox(<Stethoscope size={14} />, 'Total Partenaires', vets.length, '#2c3e50')}
              {renderStatVBox(<CheckCircle size={14} />, t('admin.vetStatus') + ' (Actif)', vets.filter(v => v.statut === 'ACTIF').length, '#27ae60')}
              {renderStatVBox(<Ban size={14} />, t('admin.vetStatus') + ' (Inactif)', vets.filter(v => v.statut !== 'ACTIF').length, '#e74c3c')}
            </div>
          </div>
        )}

        {/* Tab 4: RDV & Commissions */}
        {activeTab === 'commissions' && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#2c3e50', fontSize: 20, fontWeight: 'bold' }}>
                Suivi des Referrals & Commissions
              </div>
              <button onClick={loadData} className="btn-hover" style={{
                backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: 6,
                padding: '8px 18px', fontSize: 13, fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <RefreshCw size={14} /> Actualiser
              </button>
            </div>

            {/* Stats Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
              {[
                { label: 'Total Referrals (RDVs)', value: allRdvs.length, color: '#2c3e50', bg: '#f8f9fa', icon: <TrendingUp size={20} /> },
                { label: 'Referrals ce mois-ci', value: allRdvs.filter(r => {
                  const now = new Date();
                  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                  const rdvDateStr = r.dateRdv || r.date_rdv || '';
                  return rdvDateStr.startsWith(currentMonthStr);
                }).length, color: '#3498db', bg: '#eef2f7', icon: <Calendar size={20} /> },
                { label: 'Commissions dues ce mois', value: groupRdvsByVet().reduce((sum, g) => sum + (g.monthCount * (g.commissionMontant || 0)), 0).toFixed(2) + ' DT', color: '#27ae60', bg: '#eafaf1', icon: <DollarSign size={20} /> },





                { label: 'Total cumulé (taux négociés)', value: groupRdvsByVet().reduce((sum, g) => sum + (g.totalCount * (g.commissionMontant || 0)), 0).toFixed(2) + ' DT', color: '#e67e22', bg: '#fdf2e9', icon: <DollarSign size={20} /> }
              ].map((card, i) => (
                <div key={i} style={{
                  background: card.bg, borderRadius: 10, padding: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #edf2f7'
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#7f8c8d', fontWeight: 500, marginBottom: 5 }}>{card.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: card.color }}>{card.value}</div>
                  </div>
                  <div style={{ color: card.color }}>{card.icon}</div>
                </div>
              ))}
            </div>

            {/* Vets Referrals Table (Grouped by Vet) */}
            <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e0e4e8', padding: 15 }}>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 }}>
                Rapports par Vétérinaire Partenaire
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Vétérinaire</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 150 }}>Spécialité</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50', width: 120 }}>Ville</th>
                    <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50', width: 150 }}>Total RDVs</th>
                    <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50', width: 180 }}>RDVs ce mois-ci</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#27ae60', width: 180 }}>Dû ce mois</th>
                  </tr>
                </thead>
                <tbody>
                  {groupRdvsByVet().map((g, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eef0f2' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{g.vetNom}</td>
                      <td style={{ padding: '10px' }}>{g.specialite}</td>
                      <td style={{ padding: '10px' }}>{g.ville}</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 500 }}>{g.totalCount}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#3498db', fontWeight: 600 }}>{g.monthCount}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#27ae60', fontWeight: 'bold' }}>
                        {(g.monthCount * 10).toFixed(3)} DT
                      </td>
                    </tr>
                  ))}
                  {vets.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#95a5a6' }}>
                        Aucun vétérinaire trouvé pour le groupement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* All RDVs Table */}
            <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e0e4e8', padding: 15 }}>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 }}>
                Journal Complet des Rendez-vous
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Date</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Utilisateur</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Vétérinaire</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Animal</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Motif</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50', width: 100 }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRdvs.map((r, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eef0f2' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 500 }}>{r.dateRdv || r.date_rdv}</td>
                        <td style={{ padding: '8px 10px', color: '#3498db' }}>{r.utilisateur_email || r.utilisateur_id || '—'}</td>
                        <td style={{ padding: '8px 10px' }}>{r.veterinaireNom || r.veterinaire_nom}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <strong>{r.animalNom || r.animal_nom}</strong> <span style={{ color: '#7f8c8d', fontSize: 11 }}>({r.animalType || r.animal_type})</span>
                        </td>
                        <td style={{ padding: '8px 10px', color: '#555' }}>{r.motif}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 'bold',
                            backgroundColor: r.statut === 'Confirme' ? '#d5f5e3' : r.statut === 'Annule' ? '#fadbd8' : '#fef9e7',
                            color: r.statut === 'Confirme' ? '#27ae60' : r.statut === 'Annule' ? '#e74c3c' : '#f39c12',
                          }}>
                            {r.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {allRdvs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#95a5a6' }}>
                          Aucun rendez-vous enregistré.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;
