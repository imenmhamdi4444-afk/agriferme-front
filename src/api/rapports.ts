import API_URL, { getAuthHeaders } from './config';

export const getIndicateurs = async () => {
  const [revenusRes, stocksRes, cheptelsRes] = await Promise.all([
    fetch(`${API_URL}/revenus/stats`, { headers: getAuthHeaders() }),
    fetch(`${API_URL}/stocks`, { headers: getAuthHeaders() }),
    fetch(`${API_URL}/cheptels`, { headers: getAuthHeaders() }),
  ]);
  const revenusStats = await revenusRes.json();
  const stocks = await stocksRes.json();
  const cheptels = await cheptelsRes.json();
  const totalDepensesStock = stocks.reduce((sum: number, s: any) => sum + (parseFloat(s.depense) || 0), 0);
  const totalRevenusCheptel = cheptels.reduce((sum: number, c: any) => sum + (parseFloat(c.prix_total) || 0), 0);
  const totalRevenus = (parseFloat(revenusStats.totalRevenus) || 0) + totalRevenusCheptel;
  const benefice = totalRevenus - totalDepensesStock;
  return { data: { totalRevenus, totalDepenses: totalDepensesStock, benefice, marge: totalRevenus > 0 ? Math.round((benefice / totalRevenus) * 100) : 0 }, status: 200 };
};

export const getDepenses = async () => {
  const res = await fetch(`${API_URL}/stocks`, { headers: getAuthHeaders() });
  const data = await res.json();
  return { data: data.map((s: any) => ({ id: s.id, nomProduit: s.nomProduit || s.nom_produit || '', quantite: s.quantite, unite: s.unite, seuilAlerte: s.seuilAlerte ?? s.seuil_alerte ?? 0, prixUnitaire: s.prixUnitaire ?? s.prix_unitaire ?? 0, depense: s.depense ?? 0, prixTotal: s.prixTotal ?? s.prix_total ?? 0 })), status: res.status };
};

export const getRevenus = async () => {
  const res = await fetch(`${API_URL}/cheptels`, { headers: getAuthHeaders() });
  const data = await res.json();
  return { data: data.map((c: any) => ({ id: c.id, nom: c.nom, typeAnimal: c.typeAnimal || c.type_animal || '', dateNaissance: c.dateNaissance || c.date_naissance || '', etatSante: c.etatSante || c.etat_sante || 'Bon', maladie: c.maladie || '', quantiteVendue: c.quantiteVendue ?? c.quantite_vendue ?? 0, prixUnitaire: c.prixUnitaire ?? c.prix_unitaire ?? 0, prixTotal: c.prixTotal ?? c.prix_total ?? 0 })), status: res.status };
};

export const getAllRevenus = async () => {
  const res = await fetch(`${API_URL}/revenus`, { headers: getAuthHeaders() });
  const data = await res.json();
  return { data: data.map((r: any) => ({ source: r.source, montant: parseFloat(r.montant) || 0, date: r.date || '', description: r.description || '' })), status: res.status };
};

export const createRevenu = async (data: any) => {
  const res = await fetch(`${API_URL}/revenus`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const getDashboard = async () => {
  const [parcellesRes, culturesRes, cheptelsRes, stocksRes, revenusRes] = await Promise.all([
    fetch(`${API_URL}/parcelles`, { headers: getAuthHeaders() }),
    fetch(`${API_URL}/cultures`, { headers: getAuthHeaders() }),
    fetch(`${API_URL}/cheptels`, { headers: getAuthHeaders() }),
    fetch(`${API_URL}/stocks`, { headers: getAuthHeaders() }),
    fetch(`${API_URL}/revenus/stats`, { headers: getAuthHeaders() }),
  ]);
  const parcelles = await parcellesRes.json();
  const cultures = await culturesRes.json();
  const cheptels = await cheptelsRes.json();
  const stocks = await stocksRes.json();
  const revenusStats = await revenusRes.json();
  const malades = Array.isArray(cheptels) ? cheptels.filter((c: any) => (c.etat_sante || c.etatSante) === 'Malade' || (c.etat_sante || c.etatSante) === 'Critique').map((c: any) => ({ id: c.id, nom: c.nom, typeAnimal: c.typeAnimal || c.type_animal || '', etatSante: c.etatSante || c.etat_sante || 'Bon', maladie: c.maladie || '', quantiteVendue: c.quantiteVendue ?? c.quantite_vendue ?? 0, prixUnitaire: c.prixUnitaire ?? c.prix_unitaire ?? 0, prixTotal: c.prixTotal ?? c.prix_total ?? 0, dateNaissance: c.dateNaissance || c.date_naissance || '', utilisateurId: c.utilisateur_id || 0 })) : [];
  const nbAlertes = stocks.filter((s: any) => { const qty = parseFloat(s.quantite) || 0; const seuil = parseFloat(s.seuil_alerte || s.seuilAlerte) || 0; return qty <= seuil; }).length + malades.length;
  const totalRevenusCheptel = cheptels.reduce((s: number, c: any) => s + (parseFloat(c.prix_total || c.prixTotal) || 0), 0);
  const revenusStock = stocks.reduce((s: number, i: any) => s + (parseFloat(i.prix_total || i.prixTotal) || 0), 0);
  const totalRevenus = (parseFloat(revenusStats.totalRevenus) || 0) + totalRevenusCheptel;
  return { data: { nbParcelles: Array.isArray(parcelles) ? parcelles.length : 0, nbCultures: Array.isArray(cultures) ? cultures.length : 0, nbAnimaux: Array.isArray(cheptels) ? cheptels.length : 0, nbAlertes, totalRevenus, revenusStock, revenusCheptel: totalRevenusCheptel, malades }, status: 200 };
};

export const getCultures = async () => {
  const res = await fetch(API_URL + '/cultures', { headers: getAuthHeaders() });
  const data = await res.json();
  return { data: Array.isArray(data) ? data : [], status: res.status };
};