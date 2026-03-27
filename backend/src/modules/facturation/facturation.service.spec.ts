import { Test, TestingModule } from '@nestjs/testing';
import { FacturationService } from './facturation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { StatutInscription, StatutFacture, TypeFacture } from '@prisma/client';

// ============================================
// Données de test partagées
// ============================================

const mockParent = {
  id: 1,
  email: 'parent@test.fr',
  nom: 'Dupont',
  prenom: 'Jean',
  frequencePaiement: 'MENSUEL',
  reductionRFR: false,
  tauxReductionRFR: null,
  modePaiementPref: null,
  destinataireFacture: null,
};

const mockParentRFR = {
  ...mockParent,
  id: 2,
  reductionRFR: true,
  tauxReductionRFR: 6.0,
};

const mockEnfant1 = {
  id: 1,
  nom: 'Dupont',
  prenom: 'Marie',
  dateNaissance: new Date('2018-03-15'),
  classe: 'MATERNELLE',
  parent1Id: 1,
  parent2Id: null,
  parent1: mockParent,
  tarifMensuelOverride: null,
  inscriptions: [
    { anneeScolaire: '2025-2026', statut: StatutInscription.ACTIVE },
  ],
  deletedAt: null,
};

const mockEnfant2 = {
  id: 2,
  nom: 'Dupont',
  prenom: 'Lucas',
  dateNaissance: new Date('2020-06-20'),
  classe: 'MATERNELLE',
  parent1Id: 1,
  parent2Id: null,
  parent1: mockParent,
  tarifMensuelOverride: null,
  inscriptions: [
    { anneeScolaire: '2025-2026', statut: StatutInscription.ACTIVE },
  ],
  deletedAt: null,
};

const mockEnfantCollege = {
  id: 3,
  nom: 'Martin',
  prenom: 'Sophie',
  dateNaissance: new Date('2013-01-10'),
  classe: 'COLLEGE',
  parent1Id: 2,
  parent2Id: null,
  parent1: mockParentRFR,
  tarifMensuelOverride: null,
  inscriptions: [
    { anneeScolaire: '2025-2026', statut: StatutInscription.ACTIVE },
  ],
  deletedAt: null,
};

// Mock tarifs
const mockTarifs: Record<string, number> = {
  SCOLARITE_MENSUEL: 575.0,
  SCOLARITE_FRATRIE_MENSUEL: 540.0,
  SCOLARITE_TRIMESTRIEL: 1725.0,
  SCOLARITE_FRATRIE_TRIMESTRIEL: 1620.0,
  SCOLARITE_SEMESTRIEL: 3450.0,
  SCOLARITE_FRATRIE_SEMESTRIEL: 3240.0,
  SCOLARITE_ANNUEL: 6900.0,
  SCOLARITE_FRATRIE_ANNUEL: 6480.0,
  SCOLARITE_COLLEGE_MENSUEL: 710.0,
  SCOLARITE_COLLEGE_FRATRIE_MENSUEL: 640.0,
  SCOLARITE_COLLEGE_TRIMESTRIEL: 2130.0,
  SCOLARITE_COLLEGE_SEMESTRIEL: 4260.0,
  SCOLARITE_COLLEGE_ANNUEL: 8520.0,
  INSCRIPTION_PREMIERE_ANNEE: 350.0,
  INSCRIPTION_FRATRIE_PREMIERE: 150.0,
  INSCRIPTION_ANNEES_SUIVANTES: 165.0,
  INSCRIPTION_FRATRIE_SUIVANTES: 150.0,
  FONCTIONNEMENT_MATERNELLE: 65.0,
  FONCTIONNEMENT_ELEMENTAIRE: 85.0,
  FONCTIONNEMENT_COLLEGE: 95.0,
  REPAS_MIDI: 5.45,
  PERISCOLAIRE_SEANCE: 6.2,
};

// ============================================
// Helper : créer un mock Prisma avec $transaction
// ============================================

function createMockPrisma() {
  const mock = {
    enfant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    inscription: {
      count: jest.fn(),
    },
    repas: {
      count: jest.fn(),
    },
    periscolaire: {
      count: jest.fn(),
    },
    configTarif: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    articlePersonnalise: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    facture: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    ligneFacture: {
      create: jest.fn(),
      createMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    paiement: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  };

  // Par défaut, $transaction exécute le callback avec le mock lui-même
  mock.$transaction.mockImplementation(async (fn: (tx: typeof mock) => Promise<unknown>) => {
    return fn(mock);
  });

  return mock;
}

function setupTarifMock(prisma: ReturnType<typeof createMockPrisma>) {
  prisma.configTarif.findUnique.mockImplementation(
    ({ where }: { where: { cle_anneeScolaire: { cle: string } } }) => {
      const cle = where.cle_anneeScolaire.cle;
      if (mockTarifs[cle] !== undefined) {
        return Promise.resolve({ cle, valeur: mockTarifs[cle] });
      }
      return Promise.resolve(null);
    },
  );
}

// ============================================
// BLOC 1 : Moteur de Calcul
// ============================================

describe('FacturationService - Moteur de Calcul', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: EmailService,
          useValue: { sendFactureNotification: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
    jest.clearAllMocks();
    setupTarifMock(mockPrisma);
  });

  // ============================================
  // Tests: isPremiereAnnee
  // ============================================

  describe('isPremiereAnnee', () => {
    it('devrait retourner true si aucune inscription précédente', async () => {
      mockPrisma.inscription.count.mockResolvedValue(0);

      const result = await service.isPremiereAnnee(1, '2025-2026');

      expect(result).toBe(true);
      expect(mockPrisma.inscription.count).toHaveBeenCalledWith({
        where: {
          enfantId: 1,
          statut: {
            in: [StatutInscription.ACTIVE, StatutInscription.TERMINEE],
          },
          anneeScolaire: { lt: '2025-2026' },
        },
      });
    });

    it('devrait retourner false si inscriptions précédentes existent', async () => {
      mockPrisma.inscription.count.mockResolvedValue(1);

      const result = await service.isPremiereAnnee(1, '2025-2026');

      expect(result).toBe(false);
    });

    it('devrait retourner false avec plusieurs inscriptions passées', async () => {
      mockPrisma.inscription.count.mockResolvedValue(3);

      const result = await service.isPremiereAnnee(1, '2025-2026');

      expect(result).toBe(false);
    });
  });

  // ============================================
  // Tests: countFratrie
  // ============================================

  describe('countFratrie', () => {
    it('devrait compter les enfants actifs du parent', async () => {
      mockPrisma.enfant.count.mockResolvedValue(2);

      const result = await service.countFratrie(1, '2025-2026');

      expect(result).toBe(2);
    });

    it('devrait retourner 0 si aucun enfant actif', async () => {
      mockPrisma.enfant.count.mockResolvedValue(0);

      const result = await service.countFratrie(1, '2025-2026');

      expect(result).toBe(0);
    });
  });

  // ============================================
  // Tests: calculerScolarite
  // ============================================

  describe('calculerScolarite', () => {
    it('devrait calculer 575€ pour 1 enfant maternelle mensuel', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrisma.user.findMany.mockResolvedValue([mockParent]);

      const result = await service.calculerScolarite(1, 'MENSUEL', 1, '2025-2026');

      expect(result.montantBase).toBe(575.0);
      expect(result.estFratrie).toBe(false);
      expect(result.reductionRFR).toBe(0);
      expect(result.montantFinal).toBe(575.0);
    });

    it('devrait calculer 540€ pour fratrie maternelle mensuel', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfant2);
      mockPrisma.user.findMany.mockResolvedValue([mockParent]);

      const result = await service.calculerScolarite(2, 'MENSUEL', 2, '2025-2026');

      expect(result.montantBase).toBe(540.0);
      expect(result.estFratrie).toBe(true);
      expect(result.reductionFratrie).toBe(35); // 575 - 540
    });

    it('devrait calculer 710€ pour collège mensuel', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfantCollege);
      mockPrisma.user.findMany.mockResolvedValue([mockParentRFR]);

      const result = await service.calculerScolarite(3, 'MENSUEL', 1, '2025-2026');

      expect(result.montantBase).toBe(710.0);
    });

    it('devrait calculer 1725€ pour trimestriel', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrisma.user.findMany.mockResolvedValue([mockParent]);

      const result = await service.calculerScolarite(1, 'TRIMESTRIEL', 1, '2025-2026');

      expect(result.montantBase).toBe(1725.0);
    });

    it('devrait calculer 6900€ pour annuel', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrisma.user.findMany.mockResolvedValue([mockParent]);

      const result = await service.calculerScolarite(1, 'ANNUEL', 1, '2025-2026');

      expect(result.montantBase).toBe(6900.0);
    });

    it('devrait appliquer la réduction RFR sur le montant final', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfantCollege);
      mockPrisma.user.findMany.mockResolvedValue([mockParentRFR]);

      const result = await service.calculerScolarite(3, 'MENSUEL', 1, '2025-2026');

      // 710 * 6% = 42.60, final = 710 - 42.60 = 667.40
      expect(result.montantBase).toBe(710.0);
      expect(result.reductionRFR).toBe(42.6);
      expect(result.montantFinal).toBe(667.4);
    });

    it('devrait utiliser le tarif override si défini', async () => {
      const enfantOverride = {
        ...mockEnfant1,
        tarifMensuelOverride: 400,
      };
      mockPrisma.enfant.findUnique.mockResolvedValue(enfantOverride);

      const result = await service.calculerScolarite(1, 'MENSUEL', 1, '2025-2026');

      expect(result.montantBase).toBe(400);
      expect(result.montantFinal).toBe(400);
      expect(result.reductionRFR).toBe(0); // Pas de RFR avec override
    });

    it('devrait multiplier le tarif override par 3 pour trimestriel', async () => {
      const enfantOverride = {
        ...mockEnfant1,
        tarifMensuelOverride: 400,
      };
      mockPrisma.enfant.findUnique.mockResolvedValue(enfantOverride);

      const result = await service.calculerScolarite(1, 'TRIMESTRIEL', 1, '2025-2026');

      expect(result.montantBase).toBe(1200); // 400 * 3
    });

    it('devrait multiplier le tarif override par 6 pour semestriel', async () => {
      const enfantOverride = {
        ...mockEnfant1,
        tarifMensuelOverride: 400,
      };
      mockPrisma.enfant.findUnique.mockResolvedValue(enfantOverride);

      const result = await service.calculerScolarite(1, 'SEMESTRIEL', 1, '2025-2026');

      expect(result.montantBase).toBe(2400); // 400 * 6
    });

    it('devrait multiplier le tarif override par 12 pour annuel', async () => {
      const enfantOverride = {
        ...mockEnfant1,
        tarifMensuelOverride: 400,
      };
      mockPrisma.enfant.findUnique.mockResolvedValue(enfantOverride);

      const result = await service.calculerScolarite(1, 'ANNUEL', 1, '2025-2026');

      expect(result.montantBase).toBe(4800); // 400 * 12
    });

    it('devrait gérer un tarif override à 0€', async () => {
      const enfantOverride = {
        ...mockEnfant1,
        tarifMensuelOverride: 0,
      };
      mockPrisma.enfant.findUnique.mockResolvedValue(enfantOverride);

      const result = await service.calculerScolarite(1, 'MENSUEL', 1, '2025-2026');

      expect(result.montantBase).toBe(0);
      expect(result.montantFinal).toBe(0);
    });

    it('devrait lever une erreur si enfant non trouvé', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(null);

      await expect(
        service.calculerScolarite(999, 'MENSUEL', 1, '2025-2026'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================
  // Tests: calculerReductionRFR
  // ============================================

  describe('calculerReductionRFR', () => {
    it('devrait retourner 0 si parent1 sans RFR et pas de parent2', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({
        parent1Id: 1,
        parent2Id: null,
      });
      mockPrisma.user.findMany.mockResolvedValue([mockParent]);

      const result = await service.calculerReductionRFR(575, 1);

      expect(result).toEqual({ montant: 0, taux: 0 });
    });

    it('devrait calculer 6% de réduction RFR via parent1', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({
        parent1Id: 2,
        parent2Id: null,
      });
      mockPrisma.user.findMany.mockResolvedValue([mockParentRFR]);

      const result = await service.calculerReductionRFR(710, 3);

      // 710 * 6 / 100 = 42.60
      expect(result).toEqual({ montant: 42.6, taux: 6 });
    });

    it('devrait appliquer la réduction RFR de parent2 si parent1 non éligible', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({
        parent1Id: 1,
        parent2Id: 2,
      });
      mockPrisma.user.findMany.mockResolvedValue([
        mockParent, // parent1 sans RFR
        mockParentRFR, // parent2 avec RFR 6%
      ]);

      const result = await service.calculerReductionRFR(710, 1);

      expect(result).toEqual({ montant: 42.6, taux: 6 });
    });

    it('devrait prendre le meilleur taux si les deux parents ont RFR', async () => {
      const parentRFR19 = {
        ...mockParent,
        id: 3,
        reductionRFR: true,
        tauxReductionRFR: 19.0,
      };
      mockPrisma.enfant.findUnique.mockResolvedValue({
        parent1Id: 2,
        parent2Id: 3,
      });
      mockPrisma.user.findMany.mockResolvedValue([
        mockParentRFR, // 6%
        parentRFR19, // 19%
      ]);

      const result = await service.calculerReductionRFR(710, 1);

      // 710 * 19 / 100 = 134.90
      expect(result).toEqual({ montant: 134.9, taux: 19 });
    });

    it('devrait retourner 0 si enfant non trouvé', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(null);

      const result = await service.calculerReductionRFR(575, 999);

      expect(result).toEqual({ montant: 0, taux: 0 });
    });

    it('devrait retourner 0 si le taux RFR est 0', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({
        parent1Id: 1,
        parent2Id: null,
      });
      mockPrisma.user.findMany.mockResolvedValue([
        { ...mockParent, reductionRFR: true, tauxReductionRFR: 0 },
      ]);

      const result = await service.calculerReductionRFR(575, 1);

      // tauxReductionRFR = 0 est falsy → le code fait `if (parent.tauxReductionRFR)` → skip
      expect(result).toEqual({ montant: 0, taux: 0 });
    });

    it('devrait arrondir correctement à 2 décimales', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({
        parent1Id: 2,
        parent2Id: null,
      });
      mockPrisma.user.findMany.mockResolvedValue([
        { ...mockParentRFR, tauxReductionRFR: 7.0 },
      ]);

      // 575 * 7 / 100 = 40.25
      const result = await service.calculerReductionRFR(575, 1);

      expect(result).toEqual({ montant: 40.25, taux: 7 });
    });
  });

  // ============================================
  // Tests: calculerInscription
  // ============================================

  describe('calculerInscription', () => {
    it('devrait retourner 350€ pour 1ère année 1er enfant', async () => {
      const result = await service.calculerInscription(1, true, '2025-2026');
      expect(result).toBe(350.0);
    });

    it('devrait retourner 150€ pour 1ère année fratrie', async () => {
      const result = await service.calculerInscription(2, true, '2025-2026');
      expect(result).toBe(150.0);
    });

    it('devrait retourner 165€ pour réinscription 1er enfant', async () => {
      const result = await service.calculerInscription(1, false, '2025-2026');
      expect(result).toBe(165.0);
    });

    it('devrait retourner 150€ pour réinscription fratrie', async () => {
      const result = await service.calculerInscription(2, false, '2025-2026');
      expect(result).toBe(150.0);
    });
  });

  // ============================================
  // Tests: calculerFonctionnement
  // ============================================

  describe('calculerFonctionnement', () => {
    it('devrait retourner 65€ pour maternelle', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({ classe: 'MATERNELLE' });
      const result = await service.calculerFonctionnement(1, '2025-2026');
      expect(result).toBe(65.0);
    });

    it('devrait retourner 85€ pour élémentaire', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({ classe: 'ELEMENTAIRE' });
      const result = await service.calculerFonctionnement(1, '2025-2026');
      expect(result).toBe(85.0);
    });

    it('devrait retourner 95€ pour collège', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({ classe: 'COLLEGE' });
      const result = await service.calculerFonctionnement(1, '2025-2026');
      expect(result).toBe(95.0);
    });

    it('devrait lever une erreur si enfant non trouvé', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(null);
      await expect(
        service.calculerFonctionnement(999, '2025-2026'),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait déterminer la classe par âge si pas de classe définie', async () => {
      // Enfant né le 2013-01-10, rentrée 2025 → 12 ans → collège
      mockPrisma.enfant.findUnique.mockResolvedValue({
        classe: null,
        dateNaissance: new Date('2013-01-10'),
      });
      const result = await service.calculerFonctionnement(1, '2025-2026');
      expect(result).toBe(95.0); // COLLEGE
    });
  });

  // ============================================
  // Tests: calculerRepas
  // ============================================

  describe('calculerRepas', () => {
    it('devrait calculer 15 repas à 5.45€ = 81.75€', async () => {
      mockPrisma.repas.count.mockResolvedValue(15);

      const result = await service.calculerRepas(1, '2026-01', '2025-2026');

      expect(result.count).toBe(15);
      expect(result.montant).toBe(81.75);
    });

    it('devrait retourner 0 si aucun repas', async () => {
      mockPrisma.repas.count.mockResolvedValue(0);

      const result = await service.calculerRepas(1, '2026-01', '2025-2026');

      expect(result.count).toBe(0);
      expect(result.montant).toBe(0);
    });

    it('devrait calculer 1 repas à 5.45€', async () => {
      mockPrisma.repas.count.mockResolvedValue(1);

      const result = await service.calculerRepas(1, '2026-01', '2025-2026');

      expect(result.count).toBe(1);
      expect(result.montant).toBe(5.45);
    });

    it('devrait utiliser les bonnes dates de début/fin de mois', async () => {
      mockPrisma.repas.count.mockResolvedValue(0);

      await service.calculerRepas(1, '2026-02', '2025-2026');

      expect(mockPrisma.repas.count).toHaveBeenCalledWith({
        where: {
          enfantId: 1,
          dateRepas: {
            gte: new Date(2026, 1, 1), // 1er février
            lte: new Date(2026, 2, 0), // 28 février 2026
          },
          type: 'MIDI',
        },
      });
    });
  });

  // ============================================
  // Tests: calculerPeriscolaire
  // ============================================

  describe('calculerPeriscolaire', () => {
    it('devrait calculer 7 séances à 6.20€ = 43.40€', async () => {
      mockPrisma.periscolaire.count.mockResolvedValue(7);

      const result = await service.calculerPeriscolaire(1, '2026-01', '2025-2026');

      expect(result.count).toBe(7);
      expect(result.montant).toBe(43.4);
    });

    it('devrait retourner 0 si aucune séance', async () => {
      mockPrisma.periscolaire.count.mockResolvedValue(0);

      const result = await service.calculerPeriscolaire(1, '2026-01', '2025-2026');

      expect(result.count).toBe(0);
      expect(result.montant).toBe(0);
    });
  });

  // ============================================
  // Tests: calculerLignesFacture
  // ============================================

  describe('calculerLignesFacture', () => {
    beforeEach(() => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrisma.enfant.findMany.mockResolvedValue([mockEnfant1]);
      mockPrisma.inscription.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue(mockParent);
      mockPrisma.user.findMany.mockResolvedValue([mockParent]);
      mockPrisma.repas.count.mockResolvedValue(10);
      mockPrisma.periscolaire.count.mockResolvedValue(5);
    });

    it('devrait générer les lignes pour un mois normal (octobre)', async () => {
      const result = await service.calculerLignesFacture(1, '2025-10', {
        anneeScolaire: '2025-2026',
      });

      expect(result.enfantId).toBe(1);
      expect(result.enfantPrenom).toBe('Marie');
      expect(result.rangFratrie).toBe(1);

      const types = result.lignes.map((l) => l.type);
      expect(types).toContain('SCOLARITE');
      expect(types).toContain('REPAS');
      expect(types).toContain('PERISCOLAIRE');
      expect(types).not.toContain('INSCRIPTION');
      expect(types).not.toContain('MATERIEL');
    });

    it('devrait inclure inscription en septembre si demandé', async () => {
      const result = await service.calculerLignesFacture(1, '2025-09', {
        anneeScolaire: '2025-2026',
        inclureInscription: true,
      });

      const types = result.lignes.map((l) => l.type);
      expect(types).toContain('INSCRIPTION');
    });

    it('devrait NE PAS inclure inscription en octobre même si demandé', async () => {
      const result = await service.calculerLignesFacture(1, '2025-10', {
        anneeScolaire: '2025-2026',
        inclureInscription: true,
      });

      const types = result.lignes.map((l) => l.type);
      expect(types).not.toContain('INSCRIPTION');
    });

    it('devrait inclure fonctionnement en février si demandé', async () => {
      const result = await service.calculerLignesFacture(1, '2026-02', {
        anneeScolaire: '2025-2026',
        inclureFonctionnement: true,
      });

      const types = result.lignes.map((l) => l.type);
      expect(types).toContain('MATERIEL');
    });

    it('devrait NE PAS inclure fonctionnement en mars même si demandé', async () => {
      const result = await service.calculerLignesFacture(1, '2026-03', {
        anneeScolaire: '2025-2026',
        inclureFonctionnement: true,
      });

      const types = result.lignes.map((l) => l.type);
      expect(types).not.toContain('MATERIEL');
    });

    it('devrait calculer correctement les totaux (scolarité seule)', async () => {
      mockPrisma.repas.count.mockResolvedValue(0);
      mockPrisma.periscolaire.count.mockResolvedValue(0);

      const result = await service.calculerLignesFacture(1, '2025-10', {
        anneeScolaire: '2025-2026',
      });

      expect(result.totalNet).toBe(575);
      expect(result.totalReductions).toBe(0);
    });

    it('devrait ne pas facturer scolarité en trimestriel hors mois de facturation', async () => {
      mockPrisma.repas.count.mockResolvedValue(0);
      mockPrisma.periscolaire.count.mockResolvedValue(0);

      const result = await service.calculerLignesFacture(1, '2025-10', {
        anneeScolaire: '2025-2026',
        frequence: 'TRIMESTRIEL',
      });

      const scolariteLine = result.lignes.find((l) => l.type === 'SCOLARITE');
      expect(scolariteLine).toBeUndefined();
    });

    it('devrait facturer scolarité trimestrielle en septembre', async () => {
      mockPrisma.repas.count.mockResolvedValue(0);
      mockPrisma.periscolaire.count.mockResolvedValue(0);

      const result = await service.calculerLignesFacture(1, '2025-09', {
        anneeScolaire: '2025-2026',
        frequence: 'TRIMESTRIEL',
      });

      const scolariteLine = result.lignes.find((l) => l.type === 'SCOLARITE');
      expect(scolariteLine).toBeDefined();
      expect(scolariteLine!.montant).toBe(1725);
    });

    it('devrait ajouter une ligne REDUCTION si RFR applicable', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfantCollege);
      mockPrisma.enfant.findMany.mockResolvedValue([mockEnfantCollege]);
      mockPrisma.user.findMany.mockResolvedValue([mockParentRFR]);
      mockPrisma.repas.count.mockResolvedValue(0);
      mockPrisma.periscolaire.count.mockResolvedValue(0);

      const result = await service.calculerLignesFacture(3, '2025-10', {
        anneeScolaire: '2025-2026',
      });

      const reductionLine = result.lignes.find((l) => l.type === 'REDUCTION');
      expect(reductionLine).toBeDefined();
      expect(reductionLine!.montant).toBe(-42.6); // -710 * 6%
      expect(result.totalReductions).toBe(42.6);
      expect(result.totalNet).toBe(667.4); // 710 - 42.6
    });

    it('devrait lever une erreur si enfant sans classe', async () => {
      mockPrisma.enfant.findUnique.mockResolvedValue({
        ...mockEnfant1,
        classe: null,
      });

      await expect(
        service.calculerLignesFacture(1, '2025-10', {
          anneeScolaire: '2025-2026',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================
  // Tests: shouldBillScolarite (via calculerLignesFacture)
  // ============================================

  describe('shouldBillScolarite (tous les cas)', () => {
    beforeEach(() => {
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrisma.enfant.findMany.mockResolvedValue([mockEnfant1]);
      mockPrisma.inscription.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue(mockParent);
      mockPrisma.user.findMany.mockResolvedValue([mockParent]);
      mockPrisma.repas.count.mockResolvedValue(0);
      mockPrisma.periscolaire.count.mockResolvedValue(0);
    });

    const testBilling = async (mois: string, frequence: string, shouldBill: boolean) => {
      const result = await service.calculerLignesFacture(1, mois, {
        anneeScolaire: '2025-2026',
        frequence: frequence as any,
      });
      const hasScolarite = result.lignes.some((l) => l.type === 'SCOLARITE');
      return hasScolarite;
    };

    it('MENSUEL: devrait facturer tous les mois', async () => {
      for (const mois of ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-06']) {
        expect(await testBilling(mois, 'MENSUEL', true)).toBe(true);
      }
    });

    it('TRIMESTRIEL: devrait facturer en sept, déc, mars, juin seulement', async () => {
      expect(await testBilling('2025-09', 'TRIMESTRIEL', true)).toBe(true);
      expect(await testBilling('2025-12', 'TRIMESTRIEL', true)).toBe(true);
      expect(await testBilling('2026-03', 'TRIMESTRIEL', true)).toBe(true);
      expect(await testBilling('2026-06', 'TRIMESTRIEL', true)).toBe(true);
      // Mois intermédiaires
      expect(await testBilling('2025-10', 'TRIMESTRIEL', false)).toBe(false);
      expect(await testBilling('2025-11', 'TRIMESTRIEL', false)).toBe(false);
      expect(await testBilling('2026-01', 'TRIMESTRIEL', false)).toBe(false);
    });

    it('SEMESTRIEL: devrait facturer en sept et mars seulement', async () => {
      expect(await testBilling('2025-09', 'SEMESTRIEL', true)).toBe(true);
      expect(await testBilling('2026-03', 'SEMESTRIEL', true)).toBe(true);
      // Non
      expect(await testBilling('2025-10', 'SEMESTRIEL', false)).toBe(false);
      expect(await testBilling('2025-12', 'SEMESTRIEL', false)).toBe(false);
      expect(await testBilling('2026-06', 'SEMESTRIEL', false)).toBe(false);
    });

    it('ANNUEL: devrait facturer en août seulement', async () => {
      expect(await testBilling('2025-08', 'ANNUEL', true)).toBe(true);
      // Non
      expect(await testBilling('2025-09', 'ANNUEL', false)).toBe(false);
      expect(await testBilling('2026-01', 'ANNUEL', false)).toBe(false);
    });
  });
});

// ============================================
// BLOC 2 : Paiements
// ============================================

describe('FacturationService - Paiements', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const mockFactureEnvoyee = {
    id: 1,
    numero: 'FA-202601-0001',
    parentId: 1,
    montantTotal: 575,
    montantPaye: 0,
    statut: StatutFacture.ENVOYEE,
    dateEmission: new Date(),
    dateEcheance: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: EmailService,
          useValue: { sendFactureNotification: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
    jest.clearAllMocks();
    setupTarifMock(mockPrisma);
  });

  describe('enregistrerPaiement', () => {
    it('devrait enregistrer un paiement complet et passer en PAYEE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnvoyee);
      mockPrisma.paiement.create.mockResolvedValue({});
      const updatedFacture = {
        ...mockFactureEnvoyee,
        montantPaye: 575,
        statut: StatutFacture.PAYEE,
      };
      mockPrisma.facture.update.mockResolvedValue(updatedFacture);

      const result = await service.enregistrerPaiement(1, {
        montant: 575,
        datePaiement: '2026-01-15',
        modePaiement: 'VIREMENT',
      });

      expect(result.statut).toBe(StatutFacture.PAYEE);
      expect(result.montantPaye).toBe(575);

      // Vérifier que le paiement a été créé
      expect(mockPrisma.paiement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          factureId: 1,
          montant: 575,
          modePaiement: 'VIREMENT',
        }),
      });
    });

    it('devrait passer en PARTIELLE pour un paiement partiel', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnvoyee);
      mockPrisma.paiement.create.mockResolvedValue({});
      const updatedFacture = {
        ...mockFactureEnvoyee,
        montantPaye: 200,
        statut: StatutFacture.PARTIELLE,
      };
      mockPrisma.facture.update.mockResolvedValue(updatedFacture);

      const result = await service.enregistrerPaiement(1, {
        montant: 200,
        datePaiement: '2026-01-15',
        modePaiement: 'VIREMENT',
      });

      // Vérifier que le statut PARTIELLE est bien passé dans l'update
      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statut: StatutFacture.PARTIELLE,
            montantPaye: 200,
          }),
        }),
      );
    });

    it('devrait refuser un paiement dépassant le reste à payer', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnvoyee);

      await expect(
        service.enregistrerPaiement(1, {
          montant: 600, // > 575
          datePaiement: '2026-01-15',
          modePaiement: 'VIREMENT',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait refuser un paiement sur facture annulée', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        ...mockFactureEnvoyee,
        statut: StatutFacture.ANNULEE,
      });

      await expect(
        service.enregistrerPaiement(1, {
          montant: 100,
          datePaiement: '2026-01-15',
          modePaiement: 'VIREMENT',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever NotFoundException si facture inexistante', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(null);

      await expect(
        service.enregistrerPaiement(999, {
          montant: 100,
          datePaiement: '2026-01-15',
          modePaiement: 'VIREMENT',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait gérer un deuxième paiement sur facture partiellement payée', async () => {
      const facturePartielle = {
        ...mockFactureEnvoyee,
        montantPaye: 300,
        statut: StatutFacture.PARTIELLE,
      };
      mockPrisma.facture.findUnique.mockResolvedValue(facturePartielle);
      mockPrisma.paiement.create.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({
        ...facturePartielle,
        montantPaye: 575,
        statut: StatutFacture.PAYEE,
      });

      const result = await service.enregistrerPaiement(1, {
        montant: 275, // 300 + 275 = 575 = tout payé
        datePaiement: '2026-02-01',
        modePaiement: 'PRELEVEMENT',
      });

      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statut: StatutFacture.PAYEE,
            montantPaye: 575,
          }),
        }),
      );
    });

    it('devrait refuser un 2e paiement si le total dépasserait le montant', async () => {
      const facturePartielle = {
        ...mockFactureEnvoyee,
        montantPaye: 300,
        statut: StatutFacture.PARTIELLE,
      };
      mockPrisma.facture.findUnique.mockResolvedValue(facturePartielle);

      await expect(
        service.enregistrerPaiement(1, {
          montant: 300, // 300 + 300 = 600 > 575
          datePaiement: '2026-02-01',
          modePaiement: 'VIREMENT',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

// ============================================
// BLOC 3 : Machine à états (Statuts)
// ============================================

describe('FacturationService - Machine à états', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const makeFacture = (statut: StatutFacture, montantPaye = 0) => ({
    id: 1,
    numero: 'FA-202601-0001',
    parentId: 1,
    montantTotal: 575,
    montantPaye,
    statut,
    dateEmission: new Date(),
    dateEcheance: new Date(),
  });

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: EmailService,
          useValue: { sendFactureNotification: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
    jest.clearAllMocks();
  });

  describe('updateStatutFacture - transitions valides', () => {
    it('EN_ATTENTE → ENVOYEE : devrait réussir', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.EN_ATTENTE));
      mockPrisma.facture.update.mockResolvedValue(makeFacture(StatutFacture.ENVOYEE));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.ENVOYEE }),
      ).resolves.toBeDefined();
    });

    it('EN_ATTENTE → ANNULEE : devrait réussir', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.EN_ATTENTE));
      mockPrisma.facture.update.mockResolvedValue(makeFacture(StatutFacture.ANNULEE));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.ANNULEE }),
      ).resolves.toBeDefined();
    });

    it('ENVOYEE → PARTIELLE : devrait réussir si paiement > 0', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.ENVOYEE, 200));
      mockPrisma.facture.update.mockResolvedValue(makeFacture(StatutFacture.PARTIELLE, 200));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.PARTIELLE }),
      ).resolves.toBeDefined();
    });

    it('ENVOYEE → EN_RETARD : devrait réussir', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.ENVOYEE));
      mockPrisma.facture.update.mockResolvedValue(makeFacture(StatutFacture.EN_RETARD));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.EN_RETARD }),
      ).resolves.toBeDefined();
    });

    it('EN_RETARD → PAYEE : devrait réussir si tout est payé', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.EN_RETARD, 575));
      mockPrisma.facture.update.mockResolvedValue(makeFacture(StatutFacture.PAYEE, 575));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.PAYEE }),
      ).resolves.toBeDefined();
    });
  });

  describe('updateStatutFacture - transitions interdites', () => {
    it('EN_ATTENTE → PAYEE : devrait échouer', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.EN_ATTENTE));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.PAYEE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('EN_ATTENTE → PARTIELLE : devrait échouer', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.EN_ATTENTE));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.PARTIELLE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('PAYEE → toute transition : devrait échouer (état terminal)', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.PAYEE, 575));

      for (const statut of [StatutFacture.EN_ATTENTE, StatutFacture.ENVOYEE, StatutFacture.PARTIELLE, StatutFacture.EN_RETARD, StatutFacture.ANNULEE]) {
        await expect(
          service.updateStatutFacture(1, { statut }),
        ).rejects.toThrow(BadRequestException);
      }
    });

    it('ANNULEE → toute transition : devrait échouer (état terminal)', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.ANNULEE));

      for (const statut of [StatutFacture.EN_ATTENTE, StatutFacture.ENVOYEE, StatutFacture.PAYEE, StatutFacture.PARTIELLE, StatutFacture.EN_RETARD]) {
        await expect(
          service.updateStatutFacture(1, { statut }),
        ).rejects.toThrow(BadRequestException);
      }
    });

    it('ENVOYEE → EN_ATTENTE : devrait échouer', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.ENVOYEE));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.EN_ATTENTE }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatutFacture - validations métier', () => {
    it('devrait refuser PAYEE si reste à payer > 0.01€', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.ENVOYEE, 200));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.PAYEE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait accepter PAYEE si reste ≤ 0.01€ (tolérance arrondi)', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.ENVOYEE, 574.995));
      mockPrisma.facture.update.mockResolvedValue(makeFacture(StatutFacture.PAYEE, 574.995));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.PAYEE }),
      ).resolves.toBeDefined();
    });

    it('devrait refuser PARTIELLE si aucun paiement enregistré', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.ENVOYEE, 0));

      await expect(
        service.updateStatutFacture(1, { statut: StatutFacture.PARTIELLE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever NotFoundException si facture inexistante', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatutFacture(999, { statut: StatutFacture.ENVOYEE }),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait sauvegarder le commentaire si fourni', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(makeFacture(StatutFacture.EN_ATTENTE));
      mockPrisma.facture.update.mockResolvedValue(makeFacture(StatutFacture.ENVOYEE));

      await service.updateStatutFacture(1, {
        statut: StatutFacture.ENVOYEE,
        commentaire: 'Envoyée par courrier',
      });

      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statut: StatutFacture.ENVOYEE,
            commentaire: 'Envoyée par courrier',
          }),
        }),
      );
    });
  });
});

// ============================================
// BLOC 4 : Modification de factures (lignes)
// ============================================

describe('FacturationService - Modification de factures', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const mockFactureEnAttente = {
    id: 1,
    numero: 'FA-202601-0001',
    parentId: 1,
    montantTotal: 575,
    montantPaye: 0,
    statut: StatutFacture.EN_ATTENTE,
  };

  const mockFactureEnvoyee = {
    ...mockFactureEnAttente,
    statut: StatutFacture.ENVOYEE,
  };

  const mockLigne = {
    id: 10,
    factureId: 1,
    description: 'Scolarité mensuelle',
    quantite: 1,
    prixUnit: 575,
    montant: 575,
    type: 'SCOLARITE',
    commentaire: null,
  };

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: EmailService,
          useValue: { sendFactureNotification: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
    jest.clearAllMocks();
  });

  describe('ajouterLigne', () => {
    it('devrait ajouter une ligne et mettre à jour le total', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnAttente);
      mockPrisma.ligneFacture.create.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({
        ...mockFactureEnAttente,
        montantTotal: 640,
      });

      const result = await service.ajouterLigne(1, {
        description: 'Frais supplémentaire',
        quantite: 1,
        prixUnit: 65,
        type: 'MATERIEL' as any,
      });

      // montantTotal devrait être 575 + 65 = 640
      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { montantTotal: 640 },
        }),
      );
    });

    it('devrait calculer montant = quantite * prixUnit', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnAttente);
      mockPrisma.ligneFacture.create.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      await service.ajouterLigne(1, {
        description: '3 repas',
        quantite: 3,
        prixUnit: 5.45,
        type: 'REPAS' as any,
      });

      // Vérifier que la ligne a été créée avec le bon montant
      expect(mockPrisma.ligneFacture.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          montant: 16.35, // 3 * 5.45
          quantite: 3,
          prixUnit: 5.45,
        }),
      });
    });

    it('devrait refuser si facture pas EN_ATTENTE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnvoyee);

      await expect(
        service.ajouterLigne(1, {
          description: 'Test',
          quantite: 1,
          prixUnit: 10,
          type: 'PERSONNALISE' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever NotFoundException si facture inexistante', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(null);

      await expect(
        service.ajouterLigne(999, {
          description: 'Test',
          quantite: 1,
          prixUnit: 10,
          type: 'PERSONNALISE' as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('modifierLigne', () => {
    it('devrait mettre à jour le total avec la différence', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnAttente);
      mockPrisma.ligneFacture.findFirst.mockResolvedValue(mockLigne);
      mockPrisma.ligneFacture.update.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      await service.modifierLigne(1, 10, {
        prixUnit: 600, // était 575
      });

      // Diff = 600 - 575 = +25, nouveau total = 575 + 25 = 600
      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { montantTotal: 600 },
        }),
      );
    });

    it('devrait garder les valeurs existantes si pas fournies', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnAttente);
      mockPrisma.ligneFacture.findFirst.mockResolvedValue(mockLigne);
      mockPrisma.ligneFacture.update.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      await service.modifierLigne(1, 10, {
        description: 'Nouveau libellé',
        // quantite et prixUnit non fournis → gardent les valeurs existantes
      });

      // Le montant ne devrait pas changer car quantite et prixUnit restent identiques
      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { montantTotal: 575 }, // pas de changement
        }),
      );
    });

    it('devrait recalculer avec nouvelle quantité', async () => {
      const ligneRepas = {
        ...mockLigne,
        id: 11,
        description: 'Repas',
        quantite: 10,
        prixUnit: 5.45,
        montant: 54.5,
      };
      const factureAvecRepas = { ...mockFactureEnAttente, montantTotal: 629.5 }; // 575 + 54.5
      mockPrisma.facture.findUnique.mockResolvedValue(factureAvecRepas);
      mockPrisma.ligneFacture.findFirst.mockResolvedValue(ligneRepas);
      mockPrisma.ligneFacture.update.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      await service.modifierLigne(1, 11, {
        quantite: 12, // était 10
      });

      // Nouveau montant ligne = 12 * 5.45 = 65.40
      // Diff = 65.40 - 54.50 = 10.90
      // Nouveau total facture = 629.50 + 10.90 = 640.40
      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { montantTotal: 640.4 },
        }),
      );
    });

    it('devrait refuser si facture pas EN_ATTENTE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnvoyee);

      await expect(
        service.modifierLigne(1, 10, { prixUnit: 600 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever NotFoundException si ligne inexistante', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnAttente);
      mockPrisma.ligneFacture.findFirst.mockResolvedValue(null);

      await expect(
        service.modifierLigne(1, 999, { prixUnit: 600 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('supprimerLigne', () => {
    it('devrait soustraire le montant de la ligne du total', async () => {
      const factureAvecRepas = { ...mockFactureEnAttente, montantTotal: 640 }; // 575 + 65
      const ligneRepas = { ...mockLigne, id: 11, montant: 65 };
      mockPrisma.facture.findUnique.mockResolvedValue(factureAvecRepas);
      mockPrisma.ligneFacture.findFirst.mockResolvedValue(ligneRepas);
      mockPrisma.ligneFacture.delete.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      await service.supprimerLigne(1, 11);

      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { montantTotal: 575 }, // 640 - 65
        }),
      );
    });

    it('devrait ne pas descendre en dessous de 0', async () => {
      const factureMinime = { ...mockFactureEnAttente, montantTotal: 30 };
      const ligneChere = { ...mockLigne, montant: 50 };
      mockPrisma.facture.findUnique.mockResolvedValue(factureMinime);
      mockPrisma.ligneFacture.findFirst.mockResolvedValue(ligneChere);
      mockPrisma.ligneFacture.delete.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      await service.supprimerLigne(1, 10);

      expect(mockPrisma.facture.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { montantTotal: 0 }, // max(0, 30 - 50)
        }),
      );
    });

    it('devrait refuser si facture pas EN_ATTENTE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnvoyee);

      await expect(service.supprimerLigne(1, 10)).rejects.toThrow(BadRequestException);
    });

    it('devrait lever NotFoundException si ligne inexistante', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(mockFactureEnAttente);
      mockPrisma.ligneFacture.findFirst.mockResolvedValue(null);

      await expect(service.supprimerLigne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});

// ============================================
// BLOC 5 : Avoirs
// ============================================

describe('FacturationService - Avoirs', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const mockFactureEnvoyee = {
    id: 1,
    numero: 'FA-202601-0001',
    parentId: 1,
    enfantId: 1,
    montantTotal: 575,
    montantPaye: 0,
    statut: StatutFacture.ENVOYEE,
    dateEmission: new Date(),
    dateEcheance: new Date(),
    periode: '2026-01',
    anneeScolaire: '2025-2026',
    modePaiement: null,
    destinataire: null,
    lignes: [
      { id: 10, description: 'Scolarité mensuelle', quantite: 1, prixUnit: 575, montant: 575, type: 'SCOLARITE', commentaire: null },
    ],
  };

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: EmailService,
          useValue: { sendFactureNotification: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
    jest.clearAllMocks();
  });

  describe('creerAvoir', () => {
    it('devrait créer un avoir avec montants négatifs', async () => {
      mockPrisma.facture.findUnique.mockResolvedValueOnce(mockFactureEnvoyee);
      mockPrisma.$executeRawUnsafe.mockResolvedValue(null);
      // findFirst pour generateNumeroAvoir
      mockPrisma.facture.findFirst.mockResolvedValue(null);
      // create pour l'avoir
      mockPrisma.facture.create.mockResolvedValue({
        id: 2,
        numero: 'AV-202601-0001',
        type: TypeFacture.AVOIR,
      });
      mockPrisma.ligneFacture.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.facture.update.mockResolvedValue({});
      // findUnique final pour retourner l'avoir
      mockPrisma.facture.findUnique.mockResolvedValue({
        id: 2,
        numero: 'AV-202601-0001',
        montantTotal: -575,
        type: TypeFacture.AVOIR,
        statut: StatutFacture.ENVOYEE,
      });

      const result = await service.creerAvoir(1);

      // Vérifier que l'avoir a un montant négatif
      expect(mockPrisma.facture.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          montantTotal: -575,
          type: TypeFacture.AVOIR,
          statut: StatutFacture.ENVOYEE,
          factureSourceId: 1,
        }),
      });

      // Vérifier que les lignes sont inversées
      expect(mockPrisma.ligneFacture.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            prixUnit: -575,
            montant: -575,
          }),
        ]),
      });

      // Vérifier que la facture source est annulée
      expect(mockPrisma.facture.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { statut: StatutFacture.ANNULEE },
      });
    });

    it('devrait refuser un avoir sur facture EN_ATTENTE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        ...mockFactureEnvoyee,
        statut: StatutFacture.EN_ATTENTE,
      });

      await expect(service.creerAvoir(1)).rejects.toThrow(BadRequestException);
    });

    it('devrait refuser un avoir sur facture PAYEE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        ...mockFactureEnvoyee,
        statut: StatutFacture.PAYEE,
        montantPaye: 575,
      });

      await expect(service.creerAvoir(1)).rejects.toThrow(BadRequestException);
    });

    it('devrait refuser un avoir sur facture ANNULEE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        ...mockFactureEnvoyee,
        statut: StatutFacture.ANNULEE,
      });

      await expect(service.creerAvoir(1)).rejects.toThrow(BadRequestException);
    });

    it('devrait autoriser un avoir sur facture PARTIELLE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValueOnce({
        ...mockFactureEnvoyee,
        statut: StatutFacture.PARTIELLE,
        montantPaye: 200,
      });
      mockPrisma.$executeRawUnsafe.mockResolvedValue(null);
      mockPrisma.facture.findFirst.mockResolvedValue(null);
      mockPrisma.facture.create.mockResolvedValue({ id: 2 });
      mockPrisma.ligneFacture.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.facture.update.mockResolvedValue({});
      mockPrisma.facture.findUnique.mockResolvedValue({ id: 2 });

      await expect(service.creerAvoir(1)).resolves.toBeDefined();
    });

    it('devrait autoriser un avoir sur facture EN_RETARD', async () => {
      mockPrisma.facture.findUnique.mockResolvedValueOnce({
        ...mockFactureEnvoyee,
        statut: StatutFacture.EN_RETARD,
      });
      mockPrisma.$executeRawUnsafe.mockResolvedValue(null);
      mockPrisma.facture.findFirst.mockResolvedValue(null);
      mockPrisma.facture.create.mockResolvedValue({ id: 2 });
      mockPrisma.ligneFacture.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.facture.update.mockResolvedValue({});
      mockPrisma.facture.findUnique.mockResolvedValue({ id: 2 });

      await expect(service.creerAvoir(1)).resolves.toBeDefined();
    });

    it('devrait lever NotFoundException si facture inexistante', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue(null);

      await expect(service.creerAvoir(999)).rejects.toThrow(NotFoundException);
    });
  });
});

// ============================================
// BLOC 6 : Génération de factures
// ============================================

describe('FacturationService - Génération', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: EmailService,
          useValue: { sendFactureNotification: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
    jest.clearAllMocks();
    setupTarifMock(mockPrisma);
  });

  describe('genererFacture', () => {
    it('devrait lever NotFoundException si parent inexistant', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.genererFacture({
          parentId: 999,
          periode: '2026-01',
          anneeScolaire: '2025-2026',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever BadRequestException si aucun enfant actif', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockParent);
      mockPrisma.enfant.findMany.mockResolvedValue([]); // Pas d'enfants actifs

      await expect(
        service.genererFacture({
          parentId: 1,
          periode: '2026-01',
          anneeScolaire: '2025-2026',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait lever ConflictException si facture déjà existante (non vide)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockParent);
      mockPrisma.enfant.findMany.mockResolvedValue([mockEnfant1]);
      mockPrisma.inscription.count.mockResolvedValue(0);
      mockPrisma.facture.findFirst.mockResolvedValue({
        id: 1,
        montantTotal: 575,
        lignes: [{ id: 10 }], // Non vide
      });

      await expect(
        service.genererFacture({
          parentId: 1,
          periode: '2026-01',
          anneeScolaire: '2025-2026',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait supprimer une facture vide existante et régénérer', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockParent);
      mockPrisma.enfant.findMany.mockResolvedValue([mockEnfant1]);
      mockPrisma.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrisma.inscription.count.mockResolvedValue(0);
      mockPrisma.user.findMany.mockResolvedValue([mockParent]);
      mockPrisma.repas.count.mockResolvedValue(0);
      mockPrisma.periscolaire.count.mockResolvedValue(0);

      // Facture vide existante
      mockPrisma.facture.findFirst.mockResolvedValue({
        id: 99,
        montantTotal: 0,
        lignes: [],
      });
      mockPrisma.facture.delete.mockResolvedValue({});

      // Transaction mocks
      mockPrisma.$executeRawUnsafe.mockResolvedValue(null);
      // findFirst for generateNumeroFacture (no existing number)
      // Note: facture.findFirst is already mocked above for the existing check
      // Inside the transaction, findFirst is called again for numbering
      // Since we use the same mock, we need mockResolvedValueOnce
      mockPrisma.facture.findFirst
        .mockResolvedValueOnce({ id: 99, montantTotal: 0, lignes: [] }) // 1er appel : vérification existante (hors tx)
        .mockResolvedValueOnce(null) // 2ème appel : vérification doublon dans la transaction
        .mockResolvedValueOnce(null); // 3ème appel : generateNumeroFacture dans la transaction

      mockPrisma.facture.create.mockResolvedValue({ id: 2, numero: 'FA-202601-0001' });
      mockPrisma.ligneFacture.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.facture.findUnique.mockResolvedValue({
        id: 2,
        numero: 'FA-202601-0001',
        montantTotal: 575,
      });

      await service.genererFacture({
        parentId: 1,
        periode: '2026-01',
        anneeScolaire: '2025-2026',
      });

      // Vérifier que la facture vide a été supprimée
      expect(mockPrisma.facture.delete).toHaveBeenCalledWith({ where: { id: 99 } });
    });
  });

  describe('getEnfantsActifs', () => {
    it('devrait retourner les enfants avec leur rang de fratrie', async () => {
      mockPrisma.enfant.findMany.mockResolvedValue([mockEnfant1, mockEnfant2]);
      mockPrisma.inscription.count.mockResolvedValue(0);

      const result = await service.getEnfantsActifs(1, '2025-2026');

      expect(result).toHaveLength(2);
      expect(result[0].rangFratrie).toBe(1);
      expect(result[1].rangFratrie).toBe(2);
      expect(result[0].prenom).toBe('Marie');
      expect(result[1].prenom).toBe('Lucas');
    });

    it('devrait lever une erreur si un enfant na pas de classe', async () => {
      mockPrisma.enfant.findMany.mockResolvedValue([
        { ...mockEnfant1, classe: null },
      ]);

      await expect(
        service.getEnfantsActifs(1, '2025-2026'),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait retourner un tableau vide si aucun enfant actif', async () => {
      mockPrisma.enfant.findMany.mockResolvedValue([]);

      const result = await service.getEnfantsActifs(1, '2025-2026');

      expect(result).toHaveLength(0);
    });
  });
});

// ============================================
// BLOC 7 : Envoi batch emails
// ============================================

describe('FacturationService - Envoi emails', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockEmailService: { sendFactureNotification: jest.Mock };

  beforeEach(async () => {
    mockPrisma = createMockPrisma();
    mockEmailService = { sendFactureNotification: jest.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
    jest.clearAllMocks();
  });

  describe('envoyerBatch', () => {
    it('devrait envoyer les factures en attente et les passer en ENVOYEE', async () => {
      const factures = [
        {
          id: 1,
          numero: 'FA-202601-0001',
          montantTotal: 575,
          dateEcheance: new Date('2026-01-05'),
          parent: { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'parent@test.fr' },
          enfant: { id: 1, nom: 'Dupont', prenom: 'Marie' },
        },
        {
          id: 2,
          numero: 'FA-202601-0002',
          montantTotal: 710,
          dateEcheance: new Date('2026-01-05'),
          parent: { id: 2, nom: 'Martin', prenom: 'Pierre', email: 'martin@test.fr' },
          enfant: { id: 3, nom: 'Martin', prenom: 'Sophie' },
        },
      ];
      mockPrisma.facture.findMany.mockResolvedValue(factures);
      mockPrisma.facture.update.mockResolvedValue({});

      const result = await service.envoyerBatch();

      expect(result.envoyees).toBe(2);
      expect(result.erreurs).toHaveLength(0);
      expect(mockPrisma.facture.update).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendFactureNotification).toHaveBeenCalledTimes(2);
    });

    it('devrait lever BadRequestException si aucune facture en attente', async () => {
      mockPrisma.facture.findMany.mockResolvedValue([]);

      await expect(service.envoyerBatch()).rejects.toThrow(BadRequestException);
    });

    it('devrait continuer même si un email échoue', async () => {
      const factures = [
        {
          id: 1,
          numero: 'FA-202601-0001',
          montantTotal: 575,
          dateEcheance: new Date(),
          parent: { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'parent@test.fr' },
          enfant: null,
        },
        {
          id: 2,
          numero: 'FA-202601-0002',
          montantTotal: 710,
          dateEcheance: new Date(),
          parent: { id: 2, nom: 'Martin', prenom: 'Pierre', email: 'martin@test.fr' },
          enfant: null,
        },
      ];
      mockPrisma.facture.findMany.mockResolvedValue(factures);
      mockPrisma.facture.update
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('DB error'));

      const result = await service.envoyerBatch();

      // 1 réussit, 1 échoue → mais on continue
      expect(result.envoyees).toBe(1);
      expect(result.erreurs).toHaveLength(1);
    });

    it('devrait filtrer par mois si fourni', async () => {
      mockPrisma.facture.findMany.mockResolvedValue([]);

      await expect(service.envoyerBatch('2026-01')).rejects.toThrow(BadRequestException);

      expect(mockPrisma.facture.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            periode: '2026-01',
          }),
        }),
      );
    });
  });
});

// ============================================
// BLOC 7 : Paiements SEPA
// ============================================

describe('FacturationService - Paiements SEPA', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: { sendFactureEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
  });

  describe('marquerFacturesPayeesSepa', () => {
    const datePrelevement = new Date('2026-03-05');

    it('devrait marquer une facture ENVOYEE comme PAYEE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        id: 1,
        numero: 'FA-202601-0001',
        montantTotal: 575,
        montantPaye: 0,
        statut: 'ENVOYEE',
      });
      mockPrisma.paiement.create.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      const result = await service.marquerFacturesPayeesSepa([1], datePrelevement);

      expect(result.payees).toBe(1);
      expect(result.totalMontant).toBe(575);
      expect(result.erreurs).toHaveLength(0);
      expect(mockPrisma.paiement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          factureId: 1,
          montant: 575,
          modePaiement: 'PRELEVEMENT',
          reference: 'SEPA-FA-202601-0001',
        }),
      });
    });

    it('devrait ignorer une facture déjà PAYEE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        id: 1,
        numero: 'FA-202601-0001',
        montantTotal: 575,
        montantPaye: 575,
        statut: 'PAYEE',
      });

      const result = await service.marquerFacturesPayeesSepa([1], datePrelevement);

      expect(result.payees).toBe(0);
      expect(result.erreurs).toHaveLength(1);
      expect(result.erreurs[0]).toContain('déjà payée');
    });

    it('devrait ignorer une facture ANNULEE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        id: 1,
        numero: 'FA-202601-0001',
        montantTotal: 575,
        montantPaye: 0,
        statut: 'ANNULEE',
      });

      const result = await service.marquerFacturesPayeesSepa([1], datePrelevement);

      expect(result.payees).toBe(0);
      expect(result.erreurs).toHaveLength(1);
      expect(result.erreurs[0]).toContain('annulée');
    });

    it('devrait signaler une facture inexistante sans bloquer les autres', async () => {
      mockPrisma.facture.findUnique
        .mockResolvedValueOnce(null) // facture #999 inexistante
        .mockResolvedValueOnce({
          id: 2,
          numero: 'FA-202601-0002',
          montantTotal: 540,
          montantPaye: 0,
          statut: 'ENVOYEE',
        });
      mockPrisma.paiement.create.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      const result = await service.marquerFacturesPayeesSepa([999, 2], datePrelevement);

      expect(result.payees).toBe(1);
      expect(result.erreurs).toHaveLength(1);
      expect(result.erreurs[0]).toContain('#999');
    });

    it('devrait payer le reste à payer sur une facture PARTIELLE', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        id: 1,
        numero: 'FA-202601-0001',
        montantTotal: 575,
        montantPaye: 200, // déjà payé partiellement
        statut: 'PARTIELLE',
      });
      mockPrisma.paiement.create.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      const result = await service.marquerFacturesPayeesSepa([1], datePrelevement);

      expect(result.payees).toBe(1);
      expect(result.totalMontant).toBe(375); // 575 - 200 = 375
      expect(mockPrisma.paiement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          montant: 375,
        }),
      });
    });

    it('devrait traiter plusieurs factures en une seule transaction', async () => {
      mockPrisma.facture.findUnique
        .mockResolvedValueOnce({
          id: 1, numero: 'FA-202601-0001', montantTotal: 575, montantPaye: 0, statut: 'ENVOYEE',
        })
        .mockResolvedValueOnce({
          id: 2, numero: 'FA-202601-0002', montantTotal: 540, montantPaye: 0, statut: 'ENVOYEE',
        })
        .mockResolvedValueOnce({
          id: 3, numero: 'FA-202601-0003', montantTotal: 710, montantPaye: 0, statut: 'EN_RETARD',
        });
      mockPrisma.paiement.create.mockResolvedValue({});
      mockPrisma.facture.update.mockResolvedValue({});

      const result = await service.marquerFacturesPayeesSepa([1, 2, 3], datePrelevement);

      expect(result.payees).toBe(3);
      expect(result.totalMontant).toBe(1825); // 575 + 540 + 710
      expect(result.erreurs).toHaveLength(0);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('devrait ignorer une facture dont le reste à payer est 0', async () => {
      mockPrisma.facture.findUnique.mockResolvedValue({
        id: 1,
        numero: 'FA-202601-0001',
        montantTotal: 575,
        montantPaye: 575, // entièrement payée mais statut pas mis à jour
        statut: 'ENVOYEE',
      });

      const result = await service.marquerFacturesPayeesSepa([1], datePrelevement);

      expect(result.payees).toBe(0);
      expect(result.erreurs).toHaveLength(1);
      expect(result.erreurs[0]).toContain('soldée');
    });
  });
});

// ============================================
// BLOC 8 : Accès parent aux factures
// ============================================

describe('FacturationService - Accès parent', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: { sendFactureEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
  });

  describe('getFactureParentById', () => {
    it('devrait retourner la facture si le parentId correspond', async () => {
      const mockFacture = {
        id: 1,
        parentId: 1,
        numero: 'FA-202601-0001',
        lignes: [],
        paiements: [],
        enfant: { id: 1, nom: 'Dupont', prenom: 'Marie', classe: 'MATERNELLE' },
      };
      mockPrisma.facture.findFirst.mockResolvedValue(mockFacture);

      const result = await service.getFactureParentById(1, 1);

      expect(result).toEqual(mockFacture);
      expect(mockPrisma.facture.findFirst).toHaveBeenCalledWith({
        where: { id: 1, parentId: 1 },
        include: expect.objectContaining({
          lignes: expect.any(Object),
          paiements: expect.any(Object),
        }),
      });
    });

    it('devrait lever NotFoundException si la facture appartient à un autre parent', async () => {
      mockPrisma.facture.findFirst.mockResolvedValue(null); // parentId ne match pas

      await expect(
        service.getFactureParentById(1, 999), // parent 999 essaie d'accéder à la facture 1
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever NotFoundException si la facture n\'existe pas', async () => {
      mockPrisma.facture.findFirst.mockResolvedValue(null);

      await expect(
        service.getFactureParentById(999, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFacturesParent', () => {
    it('devrait retourner les factures du parent triées par date', async () => {
      const mockFactures = [
        { id: 2, numero: 'FA-202602-0001', periode: '2026-02' },
        { id: 1, numero: 'FA-202601-0001', periode: '2026-01' },
      ];
      mockPrisma.facture.findMany.mockResolvedValue(mockFactures);

      const result = await service.getFacturesParent(1);

      expect(result).toEqual(mockFactures);
      expect(mockPrisma.facture.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: 1 },
        }),
      );
    });

    it('devrait retourner un tableau vide si le parent n\'a pas de factures', async () => {
      mockPrisma.facture.findMany.mockResolvedValue([]);

      const result = await service.getFacturesParent(1);

      expect(result).toEqual([]);
    });
  });
});

// ============================================
// BLOC 9 : Facture d'inscription
// ============================================

describe('FacturationService - Facture inscription', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();
    setupTarifMock(mockPrisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: { sendFactureEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
  });

  describe('genererFactureInscription', () => {
    it('devrait lever NotFoundException si parent inexistant', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.genererFactureInscription(999, 1, true),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait lever NotFoundException si enfant inexistant', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1, nom: 'Dupont', prenom: 'Jean', modePaiementPref: null, destinataireFacture: null,
      });
      mockPrisma.enfant.findUnique.mockResolvedValue(null);

      await expect(
        service.genererFactureInscription(1, 999, true),
      ).rejects.toThrow(NotFoundException);
    });

    it('devrait créer une facture d\'inscription 1ère année enfant unique', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1, nom: 'Dupont', prenom: 'Jean', modePaiementPref: null, destinataireFacture: null,
      });
      mockPrisma.enfant.findUnique.mockResolvedValue({
        id: 1, nom: 'Dupont', prenom: 'Marie', classe: 'MATERNELLE',
      });
      mockPrisma.enfant.findMany.mockResolvedValue([{ id: 1 }]); // seul enfant
      mockPrisma.$executeRawUnsafe.mockResolvedValue(null);
      mockPrisma.facture.findFirst.mockResolvedValue(null); // pas de numéro existant
      mockPrisma.facture.create.mockResolvedValue({
        id: 10, numero: 'FA-202603-0001', montantTotal: 350,
      });
      mockPrisma.ligneFacture.create.mockResolvedValue({});

      const result = await service.genererFactureInscription(1, 1, true);

      expect(result.montantTotal).toBe(350);
      expect(mockPrisma.ligneFacture.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'INSCRIPTION',
          montant: 350,
          prixUnit: 350,
          quantite: 1,
        }),
      });
    });

    it('devrait appliquer le tarif fratrie pour le 2ème enfant', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1, nom: 'Dupont', prenom: 'Jean', modePaiementPref: null, destinataireFacture: null,
      });
      mockPrisma.enfant.findUnique.mockResolvedValue({
        id: 2, nom: 'Dupont', prenom: 'Lucas', classe: 'MATERNELLE',
      });
      mockPrisma.enfant.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]); // fratrie
      mockPrisma.$executeRawUnsafe.mockResolvedValue(null);
      mockPrisma.facture.findFirst.mockResolvedValue(null);
      mockPrisma.facture.create.mockResolvedValue({
        id: 11, numero: 'FA-202603-0002', montantTotal: 150,
      });
      mockPrisma.ligneFacture.create.mockResolvedValue({});

      const result = await service.genererFactureInscription(1, 2, true);

      expect(result.montantTotal).toBe(150); // tarif fratrie 1ère année
    });

    it('devrait utiliser le tarif réinscription (pas 1ère année)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1, nom: 'Dupont', prenom: 'Jean', modePaiementPref: null, destinataireFacture: null,
      });
      mockPrisma.enfant.findUnique.mockResolvedValue({
        id: 1, nom: 'Dupont', prenom: 'Marie', classe: 'MATERNELLE',
      });
      mockPrisma.enfant.findMany.mockResolvedValue([{ id: 1 }]); // seul enfant
      mockPrisma.$executeRawUnsafe.mockResolvedValue(null);
      mockPrisma.facture.findFirst.mockResolvedValue(null);
      mockPrisma.facture.create.mockResolvedValue({
        id: 12, numero: 'FA-202603-0003', montantTotal: 165,
      });
      mockPrisma.ligneFacture.create.mockResolvedValue({});

      const result = await service.genererFactureInscription(1, 1, false);

      expect(result.montantTotal).toBe(165); // réinscription 1er enfant
    });
  });
});

// ============================================
// BLOC 10 : Cas limites paiements multiples
// ============================================

describe('FacturationService - Paiements multiples', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: { sendFactureEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
  });

  it('devrait passer de PARTIELLE à PAYEE après le 2ème paiement', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1,
      numero: 'FA-202601-0001',
      montantTotal: 575,
      montantPaye: 300, // 1er paiement de 300€ déjà enregistré
      statut: 'PARTIELLE',
    });
    mockPrisma.paiement.create.mockResolvedValue({});
    mockPrisma.facture.update.mockResolvedValue({
      id: 1,
      montantPaye: 575,
      statut: 'PAYEE',
    });

    await service.enregistrerPaiement(1, {
      montant: 275,
      datePaiement: '2026-03-05',
      modePaiement: 'VIREMENT',
    });

    expect(mockPrisma.facture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          montantPaye: 575, // 300 + 275
          statut: 'PAYEE',
        }),
      }),
    );
  });

  it('devrait rester PARTIELLE si le 2ème paiement ne solde pas la facture', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1,
      numero: 'FA-202601-0001',
      montantTotal: 575,
      montantPaye: 100,
      statut: 'PARTIELLE',
    });
    mockPrisma.paiement.create.mockResolvedValue({});
    mockPrisma.facture.update.mockResolvedValue({
      id: 1,
      montantPaye: 250,
      statut: 'PARTIELLE',
    });

    await service.enregistrerPaiement(1, {
      montant: 150,
      datePaiement: '2026-03-05',
      modePaiement: 'VIREMENT',
    });

    expect(mockPrisma.facture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          montantPaye: 250, // 100 + 150
          statut: 'PARTIELLE',
        }),
      }),
    );
  });

  it('devrait refuser un 3ème paiement qui dépasse le reste à payer', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1,
      numero: 'FA-202601-0001',
      montantTotal: 575,
      montantPaye: 500,
      statut: 'PARTIELLE',
    });

    await expect(
      service.enregistrerPaiement(1, {
        montant: 100, // reste = 75€, paiement = 100€ → dépassement
        datePaiement: '2026-03-05',
        modePaiement: 'VIREMENT',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devrait marquer PAYEE avec tolérance d\'arrondi (0.01€)', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1,
      numero: 'FA-202601-0001',
      montantTotal: 575.01,
      montantPaye: 575,
      statut: 'PARTIELLE',
    });

    // Le reste est 0.01€ — devrait être considéré comme soldé
    // Le code empêche de payer plus que le reste, mais vérifie la tolérance au moment de marquer PAYEE
    mockPrisma.paiement.create.mockResolvedValue({});
    mockPrisma.facture.update.mockResolvedValue({
      id: 1,
      montantPaye: 575.01,
      statut: 'PAYEE',
    });

    await service.enregistrerPaiement(1, {
      montant: 0.01,
      datePaiement: '2026-03-05',
      modePaiement: 'VIREMENT',
    });

    expect(mockPrisma.facture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          statut: 'PAYEE',
        }),
      }),
    );
  });
});

// ============================================
// BLOC 11 : Génération batch
// ============================================

describe('FacturationService - Génération batch', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();
    setupTarifMock(mockPrisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: { sendFactureEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
  });

  describe('genererBatch', () => {
    it('devrait continuer sur les autres parents si un échoue', async () => {
      // 2 parents trouvés
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 1, nom: 'Dupont', prenom: 'Jean' },
        { id: 2, nom: 'Martin', prenom: 'Sophie' },
      ]);

      // Parent 1 : pas d'enfants actifs → erreur
      // Parent 2 : pas d'enfants actifs → erreur
      mockPrisma.enfant.findMany.mockResolvedValue([]);

      const result = await service.genererBatch({
        periode: '2026-01',
        anneeScolaire: '2025-2026',
      });

      // Les 2 parents doivent avoir des erreurs, mais le batch ne plante pas
      expect(result.details).toHaveLength(2);
      expect(result.details.every((r: { erreur?: string }) => r.erreur)).toBe(true);
      expect(result.totalFacture).toBe(0);
    });

    it('devrait retourner un résumé vide si aucun parent actif', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await service.genererBatch({
        periode: '2026-01',
        anneeScolaire: '2025-2026',
      });

      expect(result.details).toHaveLength(0);
      expect(result.totalFacture).toBe(0);
    });
  });
});

// ============================================
// BLOC 12 : Machine à états - cas limites
// ============================================

describe('FacturationService - Machine à états (cas limites)', () => {
  let service: FacturationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: { sendFactureEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
  });

  it('devrait refuser PAYEE → EN_ATTENTE (état terminal juridique)', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1, statut: 'PAYEE', montantTotal: 575, montantPaye: 575,
    });

    await expect(
      service.updateStatutFacture(1, { statut: 'EN_ATTENTE' as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devrait refuser ANNULEE → ENVOYEE (état terminal)', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1, statut: 'ANNULEE', montantTotal: 575, montantPaye: 0,
    });

    await expect(
      service.updateStatutFacture(1, { statut: 'ENVOYEE' as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devrait refuser ENVOYEE → EN_ATTENTE (facture envoyée = non modifiable)', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1, statut: 'ENVOYEE', montantTotal: 575, montantPaye: 0,
    });

    await expect(
      service.updateStatutFacture(1, { statut: 'EN_ATTENTE' as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devrait autoriser EN_RETARD → PARTIELLE', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1, statut: 'EN_RETARD', montantTotal: 575, montantPaye: 200,
    });
    mockPrisma.facture.update.mockResolvedValue({
      id: 1, statut: 'PARTIELLE',
    });

    const result = await service.updateStatutFacture(1, { statut: 'PARTIELLE' as any });

    expect(mockPrisma.facture.update).toHaveBeenCalled();
  });

  it('devrait refuser PARTIELLE → EN_ATTENTE', async () => {
    mockPrisma.facture.findUnique.mockResolvedValue({
      id: 1, statut: 'PARTIELLE', montantTotal: 575, montantPaye: 200,
    });

    await expect(
      service.updateStatutFacture(1, { statut: 'EN_ATTENTE' as any }),
    ).rejects.toThrow(BadRequestException);
  });
});
