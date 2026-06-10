import { envoyerEmailRDV } from './emailjs';
import API_URL, { getAuthHeaders } from './config';

const mapCheptel = (c: any) => ({
  id: c.id, nom: c.nom,
  typeAnimal: c.typeAnimal || c.type_animal || '',
  dateNaissance: c.dateNaissance || c.date_naissance || '',
  etatSante: c.etatSante || c.etat_sante || 'Bon',
  maladie: c.maladie || '',
  quantiteVendue: c.quantiteVendue ?? c.quantite_vendue ?? 0,
  prixUnitaire: c.prixUnitaire ?? c.prix_unitaire ?? 0,
  prixTotal: c.prixTotal ?? c.prix_total ?? 0,
  utilisateurId: c.utilisateur_id || 0,
});

export const getCheptels = async () => {
  const res = await fetch(`${API_URL}/cheptels`, { headers: getAuthHeaders() });
  const data = await res.json();
  return { data: Array.isArray(data) ? data.map(mapCheptel) : data, status: res.status };
};
export const getCheptel = getCheptels;

export const getAnimauxMalades = async () => {
  const res = await fetch(`${API_URL}/cheptels`, { headers: getAuthHeaders() });
  const all = await res.json();
  const malades = all.filter((a: any) => (a.etat_sante || a.etatSante) === 'Malade' || (a.etat_sante || a.etatSante) === 'Critique').map(mapCheptel);
  return { data: malades, status: res.status };
};

export const createCheptel = async (data: any) => {
  const res = await fetch(`${API_URL}/cheptels`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const updateCheptel = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/cheptels/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const deleteCheptel = async (id: number) => {
  const res = await fetch(`${API_URL}/cheptels/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const prendreRdv = async (rdvData: any) => {
  const id = typeof rdvData === 'number' ? rdvData : rdvData.animalId;
  // Send email notification
  try {
    await envoyerEmailRDV({
      animal_nom: rdvData.animalNom || 'Animal',
      type_animal: rdvData.typeAnimal || '',
      maladie: rdvData.motif || '',
      date_rdv: rdvData.dateRdv || '',
      motif: rdvData.motif || '',
    });
  } catch (emailErr) {
    console.error('Email error:', emailErr);
  }
  const res = await fetch(API_URL + '/cheptels/' + id, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ etatSante: 'Critique' }),
  });
  return { data: await res.json(), status: res.status };
};
