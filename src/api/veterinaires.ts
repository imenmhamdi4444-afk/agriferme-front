import API_URL, { getAuthHeaders } from './config';

export interface Veterinaire {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  specialite: string;
  ville: string;
  statut: string;
}

export const getVeterinaires = async (ville?: string, specialite?: string) => {
  let url = `${API_URL}/veterinaires`;
  const params = [];
  if (ville) params.push(`ville=${encodeURIComponent(ville)}`);
  if (specialite) params.push(`specialite=${encodeURIComponent(specialite)}`);
  if (params.length) url += '?' + params.join('&');
  const res = await fetch(url, { headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const getAllVeterinaires = async () => {
  const res = await fetch(`${API_URL}/veterinaires/all`, { headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const createVeterinaire = async (data: Partial<Veterinaire>) => {
  const res = await fetch(`${API_URL}/veterinaires`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const updateVeterinaire = async (id: number, data: Partial<Veterinaire>) => {
  const res = await fetch(`${API_URL}/veterinaires/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const activerVet = async (id: number) => {
  const res = await fetch(`${API_URL}/veterinaires/${id}/activer`, { method: 'PUT', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const desactiverVet = async (id: number) => {
  const res = await fetch(`${API_URL}/veterinaires/${id}/desactiver`, { method: 'PUT', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const deleteVeterinaire = async (id: number) => {
  const res = await fetch(`${API_URL}/veterinaires/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const createRendezVous = async (data: any) => {
  const res = await fetch(`${API_URL}/rendez-vous`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const getRendezVous = async () => {
  const res = await fetch(`${API_URL}/rendez-vous`, { headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};