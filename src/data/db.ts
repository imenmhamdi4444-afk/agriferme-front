import { Utilisateur, Parcelle, Culture, Stock, Cheptel, LoginResponse, StatistiquesAdmin, StatistiquesDashboard, IndicateursFinanciers, RevenuDTO } from '../types';

const DB_PREFIX = 'agriculture_';

const keys = {
  UTILISATEURS: DB_PREFIX + 'utilisateurs',
  PARCELLES: DB_PREFIX + 'parcelles',
  CULTURES: DB_PREFIX + 'cultures',
  STOCK: DB_PREFIX + 'stock',
  CHEPTEL: DB_PREFIX + 'cheptel',
  RENDEZ_VOUS: DB_PREFIX + 'rendez_vous',
  NEXT_ID: DB_PREFIX + 'next_id',
};

function getNextId(): number {
  const id = parseInt(localStorage.getItem(keys.NEXT_ID) || '100', 10);
  localStorage.setItem(keys.NEXT_ID, String(id + 1));
  return id;
}

function getCollection<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function saveCollection<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function delay<T>(val: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(val), 50));
}

function makeResponse<T>(data: T): { data: T; status: number } {
  return { data, status: 200 };
}

// ==================== SEED ====================
function seed() {
  if (localStorage.getItem(keys.UTILISATEURS)) return;

  const users: Utilisateur[] = [
    { id: 1, nomComplet: 'Jean Agriculteur', email: 'jean@ferme.com', role: 'USER', telephone: '123456789', statut: 'ACTIF' },
    { id: 2, nomComplet: 'Admin Système', email: 'admin@gestion.com', role: 'ADMIN', telephone: '987654321', statut: 'ACTIF' },
  ];

  const parcelles: Parcelle[] = [
    { id: 1, nom: 'Champ Nord', surface: 5.5, localisation: 'Nord de la ferme', cultureActuelle: 'Blé', utilisateurId: 1 },
    { id: 2, nom: 'Verger Sud', surface: 3.2, localisation: 'Sud de la ferme', cultureActuelle: 'Pommes', utilisateurId: 1 },
    { id: 3, nom: 'Jardin Est', surface: 1.0, localisation: 'Est de la ferme', cultureActuelle: 'Légumes', utilisateurId: 1 },
  ];

  const cultures: Culture[] = [
    { id: 1, nom: 'Blé d\'hiver', dateSemis: '2025-10-15', dateRecoltePrevue: '2026-07-15', parcelleId: 1, statut: 'En cours', utilisateurId: 1 },
    { id: 2, nom: 'Pommes Golden', dateSemis: '2020-03-01', dateRecoltePrevue: '2026-09-15', parcelleId: 2, statut: 'Planifiée', utilisateurId: 1 },
    { id: 3, nom: 'Tomates', dateSemis: '2026-04-01', dateRecoltePrevue: '2026-08-01', parcelleId: 3, statut: 'Planifiée', utilisateurId: 1 },
  ];

  const stock: Stock[] = [
    { id: 1, nomProduit: 'Engrais NPK', quantite: 150, unite: 'kg', seuilAlerte: 50, prixUnitaire: 2.5, depense: 375, prixTotal: 375, utilisateurId: 1 },
    { id: 2, nomProduit: 'Semences blé', quantite: 30, unite: 'sacs', seuilAlerte: 10, prixUnitaire: 45, depense: 1350, prixTotal: 1350, utilisateurId: 1 },
    { id: 3, nomProduit: 'Pesticide', quantite: 8, unite: 'L', seuilAlerte: 10, prixUnitaire: 120, depense: 960, prixTotal: 960, utilisateurId: 1 },
  ];

  const cheptel: Cheptel[] = [
    { id: 1, nom: 'Marguerite', typeAnimal: 'Vache', dateNaissance: '2021-05-12', etatSante: 'Bon', maladie: '', quantiteVendue: 0, prixUnitaire: 0, prixTotal: 0, utilisateurId: 1 },
    { id: 2, nom: 'Blanchette', typeAnimal: 'Chèvre', dateNaissance: '2022-08-20', etatSante: 'Malade', maladie: 'Mammite', quantiteVendue: 0, prixUnitaire: 0, prixTotal: 0, utilisateurId: 1 },
    { id: 3, nom: 'Poulets', typeAnimal: 'Poulet', dateNaissance: '2026-01-10', etatSante: 'Bon', maladie: '', quantiteVendue: 50, prixUnitaire: 8, prixTotal: 400, utilisateurId: 1 },
    { id: 4, nom: 'Rustique', typeAnimal: 'Taureau', dateNaissance: '2020-11-05', etatSante: 'Malade', maladie: 'Boiterie', quantiteVendue: 0, prixUnitaire: 0, prixTotal: 0, utilisateurId: 1 },
  ];

  localStorage.setItem(keys.UTILISATEURS, JSON.stringify(users));
  localStorage.setItem(keys.PARCELLES, JSON.stringify(parcelles));
  localStorage.setItem(keys.CULTURES, JSON.stringify(cultures));
  localStorage.setItem(keys.STOCK, JSON.stringify(stock));
  localStorage.setItem(keys.CHEPTEL, JSON.stringify(cheptel));
  localStorage.setItem(keys.RENDEZ_VOUS, JSON.stringify([]));
  localStorage.setItem(keys.NEXT_ID, '200');
}

seed();

// ==================== AUTH ====================
export function loginLocal(email: string, motDePasse: string): LoginResponse {
  const users = getCollection<Utilisateur>(keys.UTILISATEURS);
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error('Email ou mot de passe incorrect');
  const passwordMap: Record<string, string> = {
    'admin@gestion.com': 'admin123',
    'jean@ferme.com': 'user123',
  };
  if (passwordMap[email] !== motDePasse) throw new Error('Email ou mot de passe incorrect');
  if (user.statut === 'INACTIF') throw new Error('Compte bloqué ! Contactez l\'administrateur.');
  return {
    token: 'local_token_' + user.id,
    type: 'Bearer',
    id: user.id,
    email: user.email,
    nomComplet: user.nomComplet,
    role: user.role,
    statut: user.statut,
  };
}

// ==================== UTILISATEURS ====================
export function getUtilisateurs(): Utilisateur[] {
  return getCollection<Utilisateur>(keys.UTILISATEURS);
}

export function getStatistiquesAdmin(): StatistiquesAdmin {
  const users = getUtilisateurs();
  const total = users.length;
  const admins = users.filter((u) => u.role === 'ADMIN').length;
  const agriculteurs = users.filter((u) => u.role === 'USER').length;
  const actifs = users.filter((u) => u.statut === 'ACTIF').length;
  const bloques = users.filter((u) => u.statut === 'INACTIF').length;
  const avecTelephone = users.filter((u) => u.telephone && u.telephone !== '').length;
  return {
    totalUtilisateurs: total, totalAdmins: admins, totalAgriculteurs: agriculteurs,
    totalActifs: actifs, totalBloques: bloques,
    avecTelephone, sansTelephone: total - avecTelephone,
    tauxActifs: total > 0 ? Math.round((actifs / total) * 1000) / 10 : 0,
    tauxAdmins: total > 0 ? Math.round((admins / total) * 1000) / 10 : 0,
  };
}

export function createUtilisateur(data: any): Utilisateur {
  const users = getUtilisateurs();
  if (users.find((u) => u.email === data.email)) throw new Error('Email existe déjà');
  const user: Utilisateur = { id: getNextId(), nomComplet: data.nomComplet, email: data.email, role: data.role || 'USER', telephone: data.telephone || '', statut: 'ACTIF' };
  users.push(user);
  saveCollection(keys.UTILISATEURS, users);
  return user;
}

export function updateUtilisateur(id: number, data: any): Utilisateur {
  const users = getUtilisateurs();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Utilisateur non trouvé');
  users[idx] = { ...users[idx], nomComplet: data.nomComplet, email: data.email, role: data.role, telephone: data.telephone };
  saveCollection(keys.UTILISATEURS, users);
  return users[idx];
}

export function deleteUtilisateur(id: number) {
  const users = getUtilisateurs().filter((u) => u.id !== id);
  saveCollection(keys.UTILISATEURS, users);
}

export function setStatutUtilisateur(id: number, statut: string) {
  const users = getUtilisateurs();
  const idx = users.findIndex((u) => u.id === id);
  if (idx !== -1) { users[idx].statut = statut; saveCollection(keys.UTILISATEURS, users); }
}

// ==================== PARCELLES ====================
export function getParcelles(userId: number): Parcelle[] {
  return getCollection<Parcelle>(keys.PARCELLES).filter((p) => p.utilisateurId === userId);
}

export function createParcelle(data: any, userId: number): Parcelle {
  const items = getCollection<Parcelle>(keys.PARCELLES);
  const item: Parcelle = { id: getNextId(), nom: data.nom, surface: data.surface ?? null, localisation: data.localisation || '', cultureActuelle: data.cultureActuelle || '', utilisateurId: userId };
  items.push(item);
  saveCollection(keys.PARCELLES, items);
  return item;
}

export function updateParcelle(id: number, data: any, userId: number): Parcelle {
  const items = getCollection<Parcelle>(keys.PARCELLES);
  const idx = items.findIndex((p) => p.id === id && p.utilisateurId === userId);
  if (idx === -1) throw new Error('Parcelle non trouvée');
  items[idx] = { ...items[idx], nom: data.nom, surface: data.surface ?? items[idx].surface, localisation: data.localisation ?? items[idx].localisation, cultureActuelle: data.cultureActuelle ?? items[idx].cultureActuelle };
  saveCollection(keys.PARCELLES, items);
  return items[idx];
}

export function deleteParcelle(id: number, userId: number) {
  const items = getCollection<Parcelle>(keys.PARCELLES).filter((p) => !(p.id === id && p.utilisateurId === userId));
  saveCollection(keys.PARCELLES, items);
}

// ==================== CULTURES ====================
export function getCultures(userId: number): Culture[] {
  return getCollection<Culture>(keys.CULTURES).filter((c) => c.utilisateurId === userId);
}

export function createCulture(data: any, userId: number): Culture {
  const items = getCollection<Culture>(keys.CULTURES);
  const item: Culture = { id: getNextId(), nom: data.nom, dateSemis: data.dateSemis || '', dateRecoltePrevue: data.dateRecoltePrevue || '', parcelleId: data.parcelleId ?? null, statut: data.statut || 'Planifiée', utilisateurId: userId };
  items.push(item);
  saveCollection(keys.CULTURES, items);
  return item;
}

export function updateCulture(id: number, data: any, userId: number): Culture {
  const items = getCollection<Culture>(keys.CULTURES);
  const idx = items.findIndex((c) => c.id === id && c.utilisateurId === userId);
  if (idx === -1) throw new Error('Culture non trouvée');
  items[idx] = { ...items[idx], nom: data.nom, dateSemis: data.dateSemis ?? items[idx].dateSemis, dateRecoltePrevue: data.dateRecoltePrevue ?? items[idx].dateRecoltePrevue, parcelleId: data.parcelleId ?? items[idx].parcelleId, statut: data.statut ?? items[idx].statut };
  saveCollection(keys.CULTURES, items);
  return items[idx];
}

export function deleteCulture(id: number, userId: number) {
  const items = getCollection<Culture>(keys.CULTURES).filter((c) => !(c.id === id && c.utilisateurId === userId));
  saveCollection(keys.CULTURES, items);
}

// ==================== STOCK ====================
export function getStock(userId: number): Stock[] {
  return getCollection<Stock>(keys.STOCK).filter((s) => s.utilisateurId === userId);
}

export function createStock(data: any, userId: number): Stock {
  const items = getCollection<Stock>(keys.STOCK);
  const q = data.quantite || 0;
  const pu = data.prixUnitaire || 0;
  const item: Stock = { id: getNextId(), nomProduit: data.nomProduit, quantite: q, unite: data.unite || 'kg', seuilAlerte: data.seuilAlerte ?? 10, prixUnitaire: pu, depense: data.depense || 0, prixTotal: q * pu, utilisateurId: userId };
  items.push(item);
  saveCollection(keys.STOCK, items);
  return item;
}

export function updateStock(id: number, data: any, userId: number): Stock {
  const items = getCollection<Stock>(keys.STOCK);
  const idx = items.findIndex((s) => s.id === id && s.utilisateurId === userId);
  if (idx === -1) throw new Error('Produit non trouvé');
  const q = data.quantite ?? items[idx].quantite ?? 0;
  const pu = data.prixUnitaire ?? items[idx].prixUnitaire ?? 0;
  items[idx] = { ...items[idx], nomProduit: data.nomProduit ?? items[idx].nomProduit, quantite: q, unite: data.unite ?? items[idx].unite, seuilAlerte: data.seuilAlerte ?? items[idx].seuilAlerte, prixUnitaire: pu, depense: data.depense ?? items[idx].depense, prixTotal: q * pu };
  saveCollection(keys.STOCK, items);
  return items[idx];
}

export function deleteStock(id: number, userId: number) {
  const items = getCollection<Stock>(keys.STOCK).filter((s) => !(s.id === id && s.utilisateurId === userId));
  saveCollection(keys.STOCK, items);
}

// ==================== CHEPTEL ====================
export function getCheptel(userId: number): Cheptel[] {
  return getCollection<Cheptel>(keys.CHEPTEL).filter((a) => a.utilisateurId === userId);
}

export function getAnimauxMalades(userId: number): Cheptel[] {
  return getCheptel(userId).filter((a) => a.etatSante === 'Malade');
}

export function createCheptel(data: any, userId: number): Cheptel {
  const items = getCollection<Cheptel>(keys.CHEPTEL);
  const q = data.quantiteVendue || 0;
  const pu = data.prixUnitaire || 0;
  const item: Cheptel = { id: getNextId(), nom: data.nom, typeAnimal: data.typeAnimal || '', dateNaissance: data.dateNaissance || '', etatSante: data.etatSante || 'Bon', maladie: data.maladie || '', quantiteVendue: q, prixUnitaire: pu, prixTotal: q * pu, utilisateurId: userId };
  items.push(item);
  saveCollection(keys.CHEPTEL, items);
  return item;
}

export function updateCheptel(id: number, data: any, userId: number): Cheptel {
  const items = getCollection<Cheptel>(keys.CHEPTEL);
  const idx = items.findIndex((a) => a.id === id && a.utilisateurId === userId);
  if (idx === -1) throw new Error('Animal non trouvé');
  const q = data.quantiteVendue ?? items[idx].quantiteVendue ?? 0;
  const pu = data.prixUnitaire ?? items[idx].prixUnitaire ?? 0;
  items[idx] = { ...items[idx], nom: data.nom ?? items[idx].nom, typeAnimal: data.typeAnimal ?? items[idx].typeAnimal, dateNaissance: data.dateNaissance ?? items[idx].dateNaissance, etatSante: data.etatSante ?? items[idx].etatSante, maladie: data.maladie ?? items[idx].maladie, quantiteVendue: q, prixUnitaire: pu, prixTotal: q * pu };
  saveCollection(keys.CHEPTEL, items);
  return items[idx];
}

export function deleteCheptel(id: number, userId: number) {
  const items = getCollection<Cheptel>(keys.CHEPTEL).filter((a) => !(a.id === id && a.utilisateurId === userId));
  saveCollection(keys.CHEPTEL, items);
}

export function prendreRdv(data: any) {
  const items = JSON.parse(localStorage.getItem(keys.RENDEZ_VOUS) || '[]');
  items.push({ id: getNextId(), animalId: data.animalId, animalNom: data.animalNom, dateRdv: data.dateRdv, motif: data.motif || '', statut: 'En attente', utilisateurId: data.utilisateurId });
  localStorage.setItem(keys.RENDEZ_VOUS, JSON.stringify(items));
}

// ==================== RAPPORTS ====================
export function getDashboardStats(userId: number): StatistiquesDashboard {
  const parcelles = getParcelles(userId);
  const cultures = getCultures(userId);
  const animaux = getCheptel(userId);
  const stock = getStock(userId);
  const nbAlertes = stock.filter((s) => (s.quantite || 0) <= (s.seuilAlerte || 0)).length;
  const revenusStock = stock.reduce((sum, s) => sum + (s.prixTotal || 0), 0);
  const revenusCheptel = animaux.reduce((sum, a) => sum + (a.prixTotal || 0), 0);
  return { nbParcelles: parcelles.length, nbCultures: cultures.length, nbAnimaux: animaux.length, nbAlertes, totalRevenus: revenusStock + revenusCheptel, revenusStock, revenusCheptel };
}

export function getIndicateursFinanciers(userId: number): IndicateursFinanciers {
  const stock = getStock(userId);
  const cheptel = getCheptel(userId);
  const totalDepenses = stock.reduce((s, it) => s + (it.prixTotal || 0), 0);
  const totalRevenus = cheptel.reduce((s, it) => s + (it.prixTotal || 0), 0);
  const benefice = totalRevenus - totalDepenses;
  const marge = totalRevenus > 0 ? (benefice / totalRevenus) * 100 : 0;
  return { totalRevenus, totalDepenses, benefice, marge };
}

export function getDepensesStock(userId: number): Stock[] {
  return getStock(userId).filter((s) => (s.prixTotal || 0) > 0);
}

export function getRevenusCheptel(userId: number): Cheptel[] {
  return getCheptel(userId).filter((a) => (a.prixTotal || 0) > 0);
}

export function getAllRevenus(userId: number): RevenuDTO[] {
  const result: RevenuDTO[] = [];
  getStock(userId).filter((s) => (s.prixTotal || 0) > 0).forEach((s) => result.push({ source: s.nomProduit, montant: s.prixTotal || 0, date: '', description: 'Revenu provenant de la vente de produit' }));
  getCheptel(userId).filter((a) => (a.prixTotal || 0) > 0).forEach((a) => result.push({ source: (a.typeAnimal || '') + ' - ' + a.nom, montant: a.prixTotal || 0, date: '', description: 'Revenu provenant de la vente d\'animal' }));
  return result;
}

export function getParcellesByNom(nom: string, userId: number): Parcelle[] {
  return getParcelles(userId).filter((p) => p.nom === nom);
}
