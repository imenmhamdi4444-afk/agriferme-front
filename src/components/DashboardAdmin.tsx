import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUtilisateurs, getStatistiquesAdmin, createUtilisateur, updateUtilisateur, deleteUtilisateur, donnerAcces, bloquerAcces } from '../api/utilisateurs';
import { Utilisateur, StatistiquesAdmin } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { Users, BarChart3, Plus, Pencil, Trash2, RefreshCw, CheckCircle, Shield, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([getUtilisateurs(), getStatistiquesAdmin()]);
      setUtilisateurs(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
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
        {activeTab === 'reports' && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div style={{ color: '#2c3e50', fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
              {t('admin.userStats')}
            </div>

            <div className="stats-wrap" style={{ display: 'flex', gap: 15 }}>
              {renderStatVBox(<Users size={16} />, 'Utilisateurs actifs', stats?.totalActifs ?? 0, '#27ae60', 28)}
              {renderStatVBox(<AlertCircle size={16} />, t('admin.bloques'), stats?.totalBloques ?? 0, '#e74c3c', 28)}
              {renderStatVBox(<Shield size={16} />, 'Administrateurs', stats?.totalAdmins ?? 0, '#3498db', 28)}
              {renderStatVBox(<Users size={16} />, t('admin.agriculteurs'), stats?.totalAgriculteurs ?? 0, '#27ae60', 28)}
            </div>

            <button onClick={loadData} className="btn-hover" style={{
              backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: 5,
              padding: '10px 24px', fontSize: 14, fontWeight: 'bold', marginTop: 5,
              display: 'flex', alignItems: 'center', gap: 7, width: 'fit-content',
            }}>
              <RefreshCw size={16} /> {t('admin.refreshStats')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;
