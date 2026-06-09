import API_URL, { getAuthHeaders } from './config';

const mapUser = (u: any) => ({
  id: u.id,
  nomComplet: u.nomComplet || u.nom_complet || '',
  email: u.email, role: u.role,
  telephone: u.telephone || '',
  statut: u.statut || 'ACTIF',
});

export const getUtilisateurs = async () => {
  const res = await fetch(`${API_URL}/utilisateurs`, { headers: getAuthHeaders() });
  const data = await res.json();
  return { data: Array.isArray(data) ? data.map(mapUser) : data, status: res.status };
};

export const getStatistiquesAdmin = async () => {
  const res = await fetch(`${API_URL}/utilisateurs/stats`, { headers: getAuthHeaders() });
  const raw = await res.json();
  return {
    data: {
      totalUtilisateurs: raw.total, totalAdmins: raw.admins,
      totalAgriculteurs: raw.agriculteurs, totalActifs: raw.actifs,
      totalBloques: raw.inactifs, avecTelephone: raw.avecTelephone,
      sansTelephone: raw.sansTelephone, tauxActifs: raw.tauxActifs, tauxAdmins: raw.tauxAdmins,
    },
    status: res.status,
  };
};

export const createUtilisateur = async (data: any) => {
  const res = await fetch(`${API_URL}/utilisateurs`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const updateUtilisateur = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/utilisateurs/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const deleteUtilisateur = async (id: number) => {
  const res = await fetch(`${API_URL}/utilisateurs/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const donnerAcces = async (id: number) => {
  const res = await fetch(`${API_URL}/utilisateurs/${id}/activer`, { method: 'PUT', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const bloquerAcces = async (id: number) => {
  const res = await fetch(`${API_URL}/utilisateurs/${id}/bloquer`, { method: 'PUT', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};