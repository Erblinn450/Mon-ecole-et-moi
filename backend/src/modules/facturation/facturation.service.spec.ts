import { Test, TestingModule } from '@nestjs/testing';
import { FacturationService } from './facturation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { StatutInscription } from '@prisma/client';

describe('FacturationService - Moteur de Calcul', () => {
  let service: FacturationService;
  let prisma: PrismaService;

  // Mock data
  const mockParent = {
    id: 1,
    email: 'parent@test.fr',
    nom: 'Dupont',
    prenom: 'Jean',
    frequencePaiement: 'MENSUEL',
    reductionRFR: false,
    tauxReductionRFR: null,
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
    parent1: mockParent,
    inscriptions: [{ anneeScolaire: '2025-2026', statut: StatutInscription.ACTIVE }],
    deletedAt: null,
  };

  const mockEnfant2 = {
    id: 2,
    nom: 'Dupont',
    prenom: 'Lucas',
    dateNaissance: new Date('2020-06-20'),
    classe: 'MATERNELLE',
    parent1Id: 1,
    parent1: mockParent,
    inscriptions: [{ anneeScolaire: '2025-2026', statut: StatutInscription.ACTIVE }],
    deletedAt: null,
  };

  const mockEnfantCollege = {
    id: 3,
    nom: 'Martin',
    prenom: 'Sophie',
    dateNaissance: new Date('2013-01-10'),
    classe: 'COLLEGE',
    parent1Id: 2,
    parent1: mockParentRFR,
    inscriptions: [{ anneeScolaire: '2025-2026', statut: StatutInscription.ACTIVE }],
    deletedAt: null,
  };

  // Mock tarifs
  const mockTarifs: Record<string, number> = {
    SCOLARITE_MENSUEL: 575.0,
    SCOLARITE_FRATRIE_MENSUEL: 540.0,
    SCOLARITE_TRIMESTRIEL: 1725.0,
    SCOLARITE_ANNUEL: 6900.0,
    SCOLARITE_COLLEGE_MENSUEL: 710.0,
    SCOLARITE_COLLEGE_FRATRIE_MENSUEL: 640.0,
    INSCRIPTION_PREMIERE_ANNEE: 350.0,
    INSCRIPTION_FRATRIE_PREMIERE: 150.0,
    INSCRIPTION_ANNEES_SUIVANTES: 195.0,
    INSCRIPTION_FRATRIE_SUIVANTES: 160.0,
    FONCTIONNEMENT_MATERNELLE: 65.0,
    FONCTIONNEMENT_ELEMENTAIRE: 85.0,
    FONCTIONNEMENT_COLLEGE: 95.0,
    REPAS_MIDI: 5.45,
    PERISCOLAIRE_SEANCE: 6.2,
  };

  const mockPrismaService = {
    enfant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
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
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FacturationService>(FacturationService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();

    // Setup default tarif mock
    mockPrismaService.configTarif.findUnique.mockImplementation(
      ({ where }: { where: { cle_anneeScolaire: { cle: string } } }) => {
        const cle = where.cle_anneeScolaire.cle;
        if (mockTarifs[cle] !== undefined) {
          return Promise.resolve({ cle, valeur: mockTarifs[cle] });
        }
        return Promise.resolve(null);
      },
    );
  });

  // ============================================
  // Tests: isPremiereAnnee
  // ============================================

  describe('isPremiereAnnee', () => {
    it('devrait retourner true si aucune inscription précédente', async () => {
      mockPrismaService.inscription.count.mockResolvedValue(0);

      const result = await service.isPremiereAnnee(1, '2025-2026');

      expect(result).toBe(true);
      expect(mockPrismaService.inscription.count).toHaveBeenCalledWith({
        where: {
          enfantId: 1,
          statut: { in: [StatutInscription.ACTIVE, StatutInscription.TERMINEE] },
          anneeScolaire: { lt: '2025-2026' },
        },
      });
    });

    it('devrait retourner false si inscriptions précédentes existent', async () => {
      mockPrismaService.inscription.count.mockResolvedValue(1);

      const result = await service.isPremiereAnnee(1, '2025-2026');

      expect(result).toBe(false);
    });
  });

  // ============================================
  // Tests: countFratrie
  // ============================================

  describe('countFratrie', () => {
    it('devrait compter les enfants actifs du parent', async () => {
      mockPrismaService.enfant.count.mockResolvedValue(2);

      const result = await service.countFratrie(1, '2025-2026');

      expect(result).toBe(2);
    });

    it('devrait retourner 0 si aucun enfant actif', async () => {
      mockPrismaService.enfant.count.mockResolvedValue(0);

      const result = await service.countFratrie(1, '2025-2026');

      expect(result).toBe(0);
    });
  });

  // ============================================
  // Tests: calculerScolarite
  // ============================================

  describe('calculerScolarite', () => {
    it('devrait calculer 575€ pour 1 enfant maternelle mensuel', async () => {
      mockPrismaService.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrismaService.user.findUnique.mockResolvedValue(mockParent);

      const result = await service.calculerScolarite(
        1,
        'MENSUEL',
        1,
        '2025-2026',
      );

      expect(result.montantBase).toBe(575.0);
      expect(result.estFratrie).toBe(false);
      expect(result.reductionRFR).toBe(0);
      expect(result.montantFinal).toBe(575.0);
    });

    it('devrait calculer 540€ pour fratrie maternelle mensuel', async () => {
      mockPrismaService.enfant.findUnique.mockResolvedValue(mockEnfant2);
      mockPrismaService.user.findUnique.mockResolvedValue(mockParent);

      const result = await service.calculerScolarite(
        2,
        'MENSUEL',
        2, // rang 2 = fratrie
        '2025-2026',
      );

      expect(result.montantBase).toBe(540.0);
      expect(result.estFratrie).toBe(true);
      expect(result.reductionFratrie).toBe(35); // 575 - 540
    });

    it('devrait calculer 710€ pour collège mensuel', async () => {
      mockPrismaService.enfant.findUnique.mockResolvedValue(mockEnfantCollege);
      mockPrismaService.user.findUnique.mockResolvedValue(mockParentRFR);

      const result = await service.calculerScolarite(
        3,
        'MENSUEL',
        1,
        '2025-2026',
      );

      expect(result.montantBase).toBe(710.0);
    });

    it('devrait lever une erreur si enfant non trouvé', async () => {
      mockPrismaService.enfant.findUnique.mockResolvedValue(null);

      await expect(
        service.calculerScolarite(999, 'MENSUEL', 1, '2025-2026'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================
  // Tests: calculerReductionRFR
  // ============================================

  describe('calculerReductionRFR', () => {
    it('devrait retourner 0 si parent sans RFR', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockParent);

      const result = await service.calculerReductionRFR(575, 1);

      expect(result).toBe(0);
    });

    it('devrait calculer 6% de réduction RFR', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockParentRFR);

      const result = await service.calculerReductionRFR(710, 2);

      // 710 * 6% = 42.60
      expect(result).toBe(42.6);
    });

    it('devrait retourner 0 si parent non trouvé', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.calculerReductionRFR(575, 999);

      expect(result).toBe(0);
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

    it('devrait retourner 195€ pour réinscription 1er enfant', async () => {
      const result = await service.calculerInscription(1, false, '2025-2026');

      expect(result).toBe(195.0);
    });

    it('devrait retourner 160€ pour réinscription fratrie', async () => {
      const result = await service.calculerInscription(2, false, '2025-2026');

      expect(result).toBe(160.0);
    });
  });

  // ============================================
  // Tests: calculerFonctionnement
  // ============================================

  describe('calculerFonctionnement', () => {
    it('devrait retourner 65€ pour maternelle', async () => {
      mockPrismaService.enfant.findUnique.mockResolvedValue({
        classe: 'MATERNELLE',
      });

      const result = await service.calculerFonctionnement(1, '2025-2026');

      expect(result).toBe(65.0);
    });

    it('devrait retourner 85€ pour élémentaire', async () => {
      mockPrismaService.enfant.findUnique.mockResolvedValue({
        classe: 'ELEMENTAIRE',
      });

      const result = await service.calculerFonctionnement(1, '2025-2026');

      expect(result).toBe(85.0);
    });

    it('devrait retourner 95€ pour collège', async () => {
      mockPrismaService.enfant.findUnique.mockResolvedValue({
        classe: 'COLLEGE',
      });

      const result = await service.calculerFonctionnement(1, '2025-2026');

      expect(result).toBe(95.0);
    });
  });

  // ============================================
  // Tests: calculerRepas
  // ============================================

  describe('calculerRepas', () => {
    it('devrait calculer 15 repas à 5.45€ = 81.75€', async () => {
      mockPrismaService.repas.count.mockResolvedValue(15);

      const result = await service.calculerRepas(1, '2026-01', '2025-2026');

      expect(result.count).toBe(15);
      expect(result.montant).toBe(81.75);
    });

    it('devrait retourner 0 si aucun repas', async () => {
      mockPrismaService.repas.count.mockResolvedValue(0);

      const result = await service.calculerRepas(1, '2026-01', '2025-2026');

      expect(result.count).toBe(0);
      expect(result.montant).toBe(0);
    });
  });

  // ============================================
  // Tests: calculerPeriscolaire
  // ============================================

  describe('calculerPeriscolaire', () => {
    it('devrait calculer 7 séances à 6.20€ = 43.40€', async () => {
      mockPrismaService.periscolaire.count.mockResolvedValue(7);

      const result = await service.calculerPeriscolaire(
        1,
        '2026-01',
        '2025-2026',
      );

      expect(result.count).toBe(7);
      expect(result.montant).toBe(43.4);
    });

    it('devrait retourner 0 si aucune séance', async () => {
      mockPrismaService.periscolaire.count.mockResolvedValue(0);

      const result = await service.calculerPeriscolaire(
        1,
        '2026-01',
        '2025-2026',
      );

      expect(result.count).toBe(0);
      expect(result.montant).toBe(0);
    });
  });

  // ============================================
  // Tests: calculerLignesFacture
  // ============================================

  describe('calculerLignesFacture', () => {
    beforeEach(() => {
      // Setup default mocks for calculerLignesFacture
      mockPrismaService.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrismaService.enfant.findMany.mockResolvedValue([mockEnfant1]);
      mockPrismaService.inscription.count.mockResolvedValue(0);
      mockPrismaService.user.findUnique.mockResolvedValue(mockParent);
      mockPrismaService.repas.count.mockResolvedValue(10);
      mockPrismaService.periscolaire.count.mockResolvedValue(5);
    });

    it('devrait générer les lignes pour un mois normal (octobre)', async () => {
      const result = await service.calculerLignesFacture(1, '2025-10', {
        anneeScolaire: '2025-2026',
      });

      expect(result.enfantId).toBe(1);
      expect(result.enfantPrenom).toBe('Marie');
      expect(result.rangFratrie).toBe(1);

      // Vérifier les lignes générées
      const types = result.lignes.map((l) => l.type);
      expect(types).toContain('SCOLARITE');
      expect(types).toContain('REPAS');
      expect(types).toContain('PERISCOLAIRE');
      expect(types).not.toContain('INSCRIPTION');
      expect(types).not.toContain('MATERIEL');
    });

    it('devrait inclure inscription et fonctionnement en septembre', async () => {
      const result = await service.calculerLignesFacture(1, '2025-09', {
        anneeScolaire: '2025-2026',
        inclureInscription: true,
        inclureFonctionnement: true,
      });

      const types = result.lignes.map((l) => l.type);
      expect(types).toContain('INSCRIPTION');
      expect(types).toContain('MATERIEL');
    });

    it('devrait calculer correctement les totaux', async () => {
      mockPrismaService.repas.count.mockResolvedValue(0);
      mockPrismaService.periscolaire.count.mockResolvedValue(0);

      const result = await service.calculerLignesFacture(1, '2025-10', {
        anneeScolaire: '2025-2026',
      });

      // Seulement scolarité mensuelle = 575€
      expect(result.totalNet).toBe(575);
      expect(result.totalReductions).toBe(0);
    });
  });

  // ============================================
  // Tests: shouldBillScolarite
  // ============================================

  describe('shouldBillScolarite (private)', () => {
    it('devrait toujours facturer en MENSUEL', async () => {
      // Test indirectement via calculerLignesFacture
      mockPrismaService.enfant.findUnique.mockResolvedValue(mockEnfant1);
      mockPrismaService.enfant.findMany.mockResolvedValue([mockEnfant1]);
      mockPrismaService.inscription.count.mockResolvedValue(0);
      mockPrismaService.user.findUnique.mockResolvedValue(mockParent);
      mockPrismaService.repas.count.mockResolvedValue(0);
      mockPrismaService.periscolaire.count.mockResolvedValue(0);

      const result = await service.calculerLignesFacture(1, '2025-10', {
        anneeScolaire: '2025-2026',
        frequence: 'MENSUEL',
      });

      const scolariteLine = result.lignes.find((l) => l.type === 'SCOLARITE');
      expect(scolariteLine).toBeDefined();
    });
  });
});
