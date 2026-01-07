// Types partagés entre frontend et backend

// ============================================
// ENUMS
// ============================================

export enum Role {
  PARENT = 'PARENT',
  ADMIN = 'ADMIN',
  EDUCATEUR = 'EDUCATEUR',
}

export enum StatutPreinscription {
  EN_ATTENTE = 'EN_ATTENTE',
  DEJA_CONTACTE = 'DEJA_CONTACTE',
  VALIDE = 'VALIDE',
  REFUSE = 'REFUSE',
  ANNULE = 'ANNULE',
}

export enum StatutInscription {
  EN_COURS = 'EN_COURS',
  ACTIVE = 'ACTIVE',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export enum Classe {
  MATERNELLE = 'MATERNELLE',
  ELEMENTAIRE = 'ELEMENTAIRE',
  COLLEGE = 'COLLEGE',
}

export enum SituationFamiliale {
  MARIES = 'MARIES',
  PACSES = 'PACSES',
  UNION_LIBRE = 'UNION_LIBRE',
  SEPARES = 'SEPARES',
  DIVORCES = 'DIVORCES',
  FAMILLE_MONOPARENTALE = 'FAMILLE_MONOPARENTALE',
  AUTRE = 'AUTRE',
}

export enum TypeRepas {
  MIDI = 'MIDI',
  GOUTER = 'GOUTER',
}

// ============================================
// USER TYPES
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
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// ============================================
// ENFANT TYPES
// ============================================

export interface Enfant {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  classe?: Classe;
  parent1?: User;
  parent2?: User;
}

// ============================================
// PREINSCRIPTION TYPES
// ============================================

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
  civiliteParent?: string;
  nomParent: string;
  prenomParent: string;
  emailParent: string;
  telephoneParent: string;
  lienParente?: string;
  adresseParent?: string;
  professionParent?: string;
  civiliteParent2?: string;
  nomParent2?: string;
  prenomParent2?: string;
  emailParent2?: string;
  telephoneParent2?: string;
  lienParente2?: string;
  adresseParent2?: string;
  professionParent2?: string;
  dateIntegration?: string;
  dateDemande: string;
  statut: StatutPreinscription;
  compteCree: boolean;
  commentaireRefus?: string;
  situationFamiliale?: SituationFamiliale;
  decouverte?: string;
  pedagogieMontessori?: string;
  difficultes?: string;
}

export interface CreatePreinscriptionDto {
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: string;
  lieuNaissance?: string;
  nationalite?: string;
  allergies?: string;
  classeSouhaitee: Classe;
  etablissementPrecedent?: string;
  civiliteParent?: string;
  nomParent: string;
  prenomParent: string;
  emailParent: string;
  telephoneParent: string;
  lienParente?: string;
  adresseParent?: string;
  professionParent?: string;
  civiliteParent2?: string;
  nomParent2?: string;
  prenomParent2?: string;
  emailParent2?: string;
  telephoneParent2?: string;
  lienParente2?: string;
  adresseParent2?: string;
  professionParent2?: string;
  dateIntegration?: string;
  situationFamiliale?: SituationFamiliale;
  decouverte?: string;
  pedagogieMontessori?: string;
  difficultes?: string;
}

// ============================================
// REPAS & PERISCOLAIRE TYPES
// ============================================

export interface Repas {
  id: number;
  enfantId: number;
  dateRepas: string;
  type: TypeRepas;
  valide?: boolean;
}

export interface Periscolaire {
  id: number;
  enfantId: number;
  datePeriscolaire: string;
}

// ============================================
// SIGNATURE TYPES
// ============================================

export interface SignatureReglement {
  id: number;
  enfantId: number;
  parentId: number;
  parentName: string;
  parentEmail: string;
  enfantName: string;
  parentAccepte: boolean;
  parentDateSignature?: string;
}

export interface SignatureStatus {
  signed: boolean;
  signature?: {
    id: number;
    parentAccepte: boolean;
    parentDateSignature?: string;
    parentName: string;
    parentEmail: string;
  };
}

// ============================================
// FACTURATION TYPES
// ============================================

export interface Facture {
  id: number;
  numero: string;
  parentId: number;
  montantTotal: number;
  montantPaye: number;
  dateEmission: string;
  dateEcheance: string;
  statut: string;
  type: string;
  periode?: string;
  description?: string;
  lignes?: LigneFacture[];
}

export interface LigneFacture {
  id: number;
  factureId: number;
  description: string;
  quantite: number;
  prixUnit: number;
  montant: number;
}

// ============================================
// STATS TYPES
// ============================================

export interface PreinscriptionStats {
  total: number;
  enAttente: number;
  dejaContacte: number;
  valide: number;
  refuse: number;
}

export interface EnfantStats {
  total: number;
  maternelle: number;
  elementaire: number;
  college: number;
}

export interface RepasStats {
  total: number;
  parClasse: Record<string, number>;
  periode: string;
}

