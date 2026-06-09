import API_URL, { getAuthHeaders } from './config';

const mapCulture = (c: any) => ({
  id: c.id,
  nom: c.nom,
  dateSemis: c.dateSemis || c.date_semis || '',
  dateRecoltePrevue: c.dateRecoltePrevue || c.date_recolte_prevue || '',
  parcelleNom: c.parcelleNom || c.parcelle_nom || '',
  parcelleId: c.parcelleId || c.parcelle_id || null,
  statut: c.statut || '',
  utilisateurId: c.utilisateur_id || 0,
});

export const getCultures = async () => {
  const res = await fetch(`${API_URL}/cultures`, { headers: getAuthHeaders() });
  const data = await res.json();
  return { data: Array.isArray(data) ? data.map(mapCulture) : data, status: res.status };
};

export const createCulture = async (data: any) => {
  let parcelleNom = data.parcelleNom || '';
  if (data.parcelleId) {
    try {
      const pRes = await fetch(`${API_URL}/parcelles`, { headers: getAuthHeaders() });
      const parcelles = await pRes.json();
      const found = parcelles.find((p: any) => p.id === Number(data.parcelleId));
      if (found) parcelleNom = found.nom;
    } catch {}
  }
  const res = await fetch(`${API_URL}/cultures`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ ...data, parcelleNom }),
  });
  return { data: await res.json(), status: res.status };
};

export const updateCulture = async (id: number, data: any) => {
  let parcelleNom = data.parcelleNom || '';
  if (data.parcelleId) {
    try {
      const pRes = await fetch(`${API_URL}/parcelles`, { headers: getAuthHeaders() });
      const parcelles = await pRes.json();
      const found = parcelles.find((p: any) => p.id === Number(data.parcelleId));
      if (found) parcelleNom = found.nom;
    } catch {}
  }
  const res = await fetch(`${API_URL}/cultures/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ ...data, parcelleNom }),
  });
  return { data: await res.json(), status: res.status };
};

export const deleteCulture = async (id: number) => {
  const res = await fetch(`${API_URL}/cultures/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};