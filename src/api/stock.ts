import API_URL from './config';

const mapStock = (s: any) => ({
  id: s.id,
  nomProduit: s.nomProduit || s.nom_produit || '',
  quantite: s.quantite,
  unite: s.unite,
  seuilAlerte: s.seuilAlerte ?? s.seuil_alerte ?? 0,
  prixUnitaire: s.prixUnitaire ?? s.prix_unitaire ?? 0,
  depense: s.depense ?? 0,
  prixTotal: s.prixTotal ?? s.prix_total ?? 0,
  utilisateurId: s.utilisateur_id || 0,
});

export const getStock = async () => {
  const res = await fetch(`${API_URL}/stocks`);
  const data = await res.json();
  return { data: Array.isArray(data) ? data.map(mapStock) : data, status: res.status };
};

export const createStock = async (data: any) => {
  const res = await fetch(`${API_URL}/stocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const updateStock = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/stocks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const deleteStock = async (id: number) => {
  const res = await fetch(`${API_URL}/stocks/${id}`, { method: 'DELETE' });
  return { data: await res.json(), status: res.status };
};