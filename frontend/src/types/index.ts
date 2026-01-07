// ============================================
// ENUMS
// ============================================

export enum Role {
  PARENT = "PARENT",
  ADMIN = "ADMIN",
  EDUCATEUR = "EDUCATEUR",
}

export enum StatutPreinscription {
  EN_ATTENTE = "EN_ATTENTE",
  DEJA_CONTACTE = "DEJA_CONTACTE",
  VALIDE = "VALIDE",
  REFUSE = "REFUSE",
  ANNULE = "ANNULE",
}

export enum Classe {
  MATERNELLE = "MATERNELLE",
  ELEMENTAIRE = "ELEMENTAIRE",
  COLLEGE = "COLLEGE",
}

export enum SituationFamiliale {
  MARIES = "MARIES",
  PACSES = "PACSES",
  UNION_LIBRE = "UNION_LIBRE",
  SEPARES = "SEPARES",
  DIVORCES = "DIVORCES",
  FAMILLE_MONOPARENTALE = "FAMILLE_MONOPARENTALE",
  AUTRE = "AUTRE",
}

export enum TypeRepas {
  MIDI = "MIDI",
  GOUTER = "GOUTER",
}

// ============================================
// USER & AUTH
// ============================================

export interface User {
  id: number;
  email: string;
  name: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  role: Role;
  actif: boolean;
  premiereConnexion: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
}

// ============================================
// PREINSCRIPTION
// ============================================

export interface CreatePreinscriptionRequest {
  // Enfant
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: string;
  lieuNaissance?: string;
  nationalite?: string;
  allergies?: string;
  classeSouhaitee: Classe;
  etablissementPrecedent?: string;

  // Parent 1
  civiliteParent?: string;
  nomParent: string;
  prenomParent: string;
  emailParent: string;
  telephoneParent: string;
  lienParente?: string;
  adresseParent?: string;
  professionParent?: string;

  // Parent 2 (optionnel)
  civiliteParent2?: string;
  nomParent2?: string;
  prenomParent2?: string;
  emailParent2?: string;
  telephoneParent2?: string;
  lienParente2?: string;
  adresseParent2?: string;
  professionParent2?: string;

  // Informations complémentaires
  dateIntegration?: string;
  situationFamiliale?: SituationFamiliale;
  decouverte?: string;
  pedagogieMontessori?: string;
  difficultes?: string;
}

export interface Preinscription {
  id: number;
  numeroDossier: string;
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: string;
  lieuNaissance?: string;
  nationalite?: string;
  allergies?: string;
  classeSouhaitee: Classe;
  etablissementPrecedent?: string;
  classeActuelle?: string;

  // Parent 1
  civiliteParent?: string;
  nomParent: string;
  prenomParent: string;
  emailParent: string;
  telephoneParent: string;
  lienParente?: string;
  adresseParent?: string;
  professionParent?: string;

  // Parent 2
  civiliteParent2?: string;
  nomParent2?: string;
  prenomParent2?: string;
  emailParent2?: string;
  telephoneParent2?: string;
  lienParente2?: string;
  adresseParent2?: string;
  professionParent2?: string;

  // Statut
  dateIntegration?: string;
  dateDemande: string;
  statut: StatutPreinscription;
  compteCree: boolean;
  commentaireRefus?: string;

  // Infos complémentaires
  situationFamiliale?: SituationFamiliale;
  decouverte?: string;
  pedagogieMontessori?: string;
  difficultes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PreinscriptionStats {
  total: number;
  enAttente: number;
  dejaContacte: number;
  valide: number;
  refuse: number;
}

// ============================================
// ENFANT
// ============================================

export interface Enfant {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  classe?: Classe;
  parent1Id: number;
  parent2Id?: number;
  preinscriptionId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnfantStats {
  total: number;
  parClasse: {
    MATERNELLE: number;
    ELEMENTAIRE: number;
    COLLEGE: number;
  };
}

// ============================================
// REPAS
// ============================================

export interface Repas {
  id: number;
  enfantId: number;
  dateRepas: string;
  type: TypeRepas;
  valide?: boolean;
  enfant?: Enfant;
}

export interface CommanderRepasRequest {
  enfantId: number;
  date: string;
  type?: TypeRepas;
}

export interface CommanderRepasMultipleRequest {
  enfantId: number;
  dates: string[];
  type?: TypeRepas;
}

export interface RepasStats {
  total: number;
  midi: number;
  gouter: number;
  parJour: Record<string, number>;
}

// ============================================
// PERISCOLAIRE
// ============================================

export interface Periscolaire {
  id: number;
  enfantId: number;
  datePeriscolaire: string;
  enfant?: Enfant;
}

// ============================================
// API RESPONSE
// ============================================

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

