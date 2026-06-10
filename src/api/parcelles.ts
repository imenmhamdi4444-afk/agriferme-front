import API_URL, { getAuthHeaders } from './config';

const mapParcelle = (p: any) => ({
  id: p.id,
  nom: p.nom,
  surface: p.surface,
  localisation: p.localisation,
  cultureActuelle: p.cultureActuelle || p.culture_actuelle || '',
  utilisateurId: p.utilisateur_id || 0,
});

export const getParcelles = async () => {
  const res = await fetch(`${API_URL}/parcelles`, { headers: getAuthHeaders() });
  const data = await res.json();
  return { data: Array.isArray(data) ? data.map(mapParcelle) : data, status: res.status };
};

export const createParcelle = async (data: any) => {
  const res = await fetch(`${API_URL}/parcelles`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const updateParcelle = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/parcelles/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const deleteParcelle = async (id: number) => {
  const res = await fetch(`${API_URL}/parcelles/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};