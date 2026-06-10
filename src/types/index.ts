export interface Utilisateur {
  id: number;
  nomComplet: string;
  email: string;
  role: string;
  statut: string;
  telephone: string;
}

export interface Parcelle {
  id: number;
  nom: string;
  surface: number | null;
  localisation: string;
  cultureActuelle: string;
  utilisateurId: number;
}

export interface Culture {
  id: number;
  nom: string;
  dateSemis: string;
  dateRecoltePrevue: string;
  parcelleId: number | null;
  parcelleNom?: string;
  statut: string;
  utilisateurId: number;
}

export interface Stock {
  id: number;
  nomProduit: string;
  quantite: number | null;
  unite: string;
  seuilAlerte: number | null;
  prixUnitaire: number | null;
  depense: number | null;
  prixTotal: number | null;
  utilisateurId: number;
}

export interface Cheptel {
  id: number;
  nom: string;
  typeAnimal: string;
  dateNaissance: string;
  etatSante: string;
  maladie: string;
  quantiteVendue: number | null;
  prixUnitaire: number | null;
  prixTotal: number | null;
  utilisateurId: number;
}

export interface RevenuDTO {
  source: string;
  montant: number;
  date: string;
  description: string;
}

export interface StatistiquesAdmin {
  totalUtilisateurs: number;
  totalAdmins: number;
  totalAgriculteurs: number;
  totalActifs: number;
  totalBloques: number;
  avecTelephone: number;
  sansTelephone: number;
  tauxActifs: number;
  tauxAdmins: number;
}

export interface StatistiquesDashboard {
  nbParcelles: number;
  nbCultures: number;
  nbAnimaux: number;
  nbAlertes: number;
  totalRevenus: number;
  revenusStock: number;
  revenusCheptel: number;
}

export interface IndicateursFinanciers {
  totalRevenus: number;
  totalDepenses: number;
  benefice: number;
  marge: number;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  nomComplet: string;
  role: string;
  statut: string;
}
