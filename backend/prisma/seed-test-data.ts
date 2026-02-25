import { PrismaClient, Role, Classe, StatutInscription, StatutFacture, TypeLigne, ModePaiement } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('parent1234', 10);

  // === FAMILLES ===

  // Famille Moreau — 2 enfants, maternelle + élémentaire
  const parentMoreau = await prisma.user.upsert({
    where: { email: 'moreau@test.fr' },
    update: {},
    create: {
      email: 'moreau@test.fr',
      password,
      name: 'Claire Moreau',
      nom: 'Moreau',
      prenom: 'Claire',
      telephone: '0611223344',
      role: Role.PARENT,
      premiereConnexion: false,
      modePaiementPref: ModePaiement.VIREMENT,
    },
  });

  const emilyMoreau = await prisma.enfant.upsert({
    where: { id: 100 },
    update: {},
    create: {
      id: 100,
      nom: 'Moreau',
      prenom: 'Emily',
      dateNaissance: new Date('2020-03-15'),
      classe: Classe.MATERNELLE,
      parent1Id: parentMoreau.id,
    },
  });

  const thomasMoreau = await prisma.enfant.upsert({
    where: { id: 101 },
    update: {},
    create: {
      id: 101,
      nom: 'Moreau',
      prenom: 'Thomas',
      dateNaissance: new Date('2017-09-22'),
      classe: Classe.ELEMENTAIRE,
      parent1Id: parentMoreau.id,
    },
  });

  // Famille Bernard — 1 enfant collège, réduction RFR
  const parentBernard = await prisma.user.upsert({
    where: { email: 'bernard@test.fr' },
    update: {},
    create: {
      email: 'bernard@test.fr',
      password,
      name: 'Jean Bernard',
      nom: 'Bernard',
      prenom: 'Jean',
      telephone: '0622334455',
      role: Role.PARENT,
      premiereConnexion: false,
      reductionRFR: true,
      tauxReductionRFR: 20,
      modePaiementPref: ModePaiement.PRELEVEMENT,
    },
  });

  const leaBernard = await prisma.enfant.upsert({
    where: { id: 102 },
    update: {},
    create: {
      id: 102,
      nom: 'Bernard',
      prenom: 'Léa',
      dateNaissance: new Date('2014-06-10'),
      classe: Classe.COLLEGE,
      parent1Id: parentBernard.id,
    },
  });

  // Famille Petit — 3 enfants, un dans chaque classe
  const parentPetit = await prisma.user.upsert({
    where: { email: 'petit@test.fr' },
    update: {},
    create: {
      email: 'petit@test.fr',
      password,
      name: 'Nathalie Petit',
      nom: 'Petit',
      prenom: 'Nathalie',
      telephone: '0633445566',
      role: Role.PARENT,
      premiereConnexion: false,
      modePaiementPref: ModePaiement.VIREMENT,
    },
  });

  const hugoPetit = await prisma.enfant.upsert({
    where: { id: 103 },
    update: {},
    create: {
      id: 103,
      nom: 'Petit',
      prenom: 'Hugo',
      dateNaissance: new Date('2021-01-20'),
      classe: Classe.MATERNELLE,
      parent1Id: parentPetit.id,
    },
  });

  const manonPetit = await prisma.enfant.upsert({
    where: { id: 104 },
    update: {},
    create: {
      id: 104,
      nom: 'Petit',
      prenom: 'Manon',
      dateNaissance: new Date('2018-05-12'),
      classe: Classe.ELEMENTAIRE,
      parent1Id: parentPetit.id,
    },
  });

  const lucasPetit = await prisma.enfant.upsert({
    where: { id: 105 },
    update: {},
    create: {
      id: 105,
      nom: 'Petit',
      prenom: 'Lucas P.',
      dateNaissance: new Date('2013-11-08'),
      classe: Classe.COLLEGE,
      parent1Id: parentPetit.id,
    },
  });

  // Famille Garcia — parents séparés
  const parentGarcia1 = await prisma.user.upsert({
    where: { email: 'garcia@test.fr' },
    update: {},
    create: {
      email: 'garcia@test.fr',
      password,
      name: 'Sofia Garcia',
      nom: 'Garcia',
      prenom: 'Sofia',
      telephone: '0644556677',
      role: Role.PARENT,
      premiereConnexion: false,
    },
  });

  const parentGarcia2 = await prisma.user.upsert({
    where: { email: 'garcia2@test.fr' },
    update: {},
    create: {
      email: 'garcia2@test.fr',
      password,
      name: 'Carlos Garcia',
      nom: 'Garcia',
      prenom: 'Carlos',
      telephone: '0655667788',
      role: Role.PARENT,
      premiereConnexion: false,
    },
  });

  const linaGarcia = await prisma.enfant.upsert({
    where: { id: 106 },
    update: {},
    create: {
      id: 106,
      nom: 'Garcia',
      prenom: 'Lina',
      dateNaissance: new Date('2019-08-25'),
      classe: Classe.MATERNELLE,
      parent1Id: parentGarcia1.id,
      parent2Id: parentGarcia2.id,
    },
  });

  // === INSCRIPTIONS 2025-2026 ===
  const enfants = [emilyMoreau, thomasMoreau, leaBernard, hugoPetit, manonPetit, lucasPetit, linaGarcia];
  for (const enfant of enfants) {
    await prisma.inscription.upsert({
      where: { id: 1000 + enfant.id },
      update: {},
      create: {
        id: 1000 + enfant.id,
        enfantId: enfant.id,
        parentId: enfant.parent1Id!,
        dateInscription: new Date('2025-09-01'),
        statut: StatutInscription.ACTIVE,
        anneeScolaire: '2025-2026',
      },
    });
  }

  // === FACTURES ===
  // Tarifs : Maternelle/Élémentaire = 575€, Collège = 650€
  const tarifClasse: Record<string, number> = {
    MATERNELLE: 575,
    ELEMENTAIRE: 575,
    COLLEGE: 650,
  };

  // Helper pour créer une facture avec lignes
  async function creerFacture(opts: {
    numero: string;
    parentId: number;
    enfantId: number;
    classe: string;
    periode: string;
    statut: StatutFacture;
    montantPaye?: number;
    lignesExtra?: { description: string; quantite: number; prixUnit: number; type: TypeLigne }[];
    reductionPct?: number;
  }) {
    const prixScolarite = tarifClasse[opts.classe] || 575;
    let montantTotal = prixScolarite;

    // Lignes supplémentaires
    const lignesExtra = opts.lignesExtra || [];
    for (const l of lignesExtra) {
      montantTotal += l.quantite * l.prixUnit;
    }

    // Réduction RFR
    let montantReduction = 0;
    if (opts.reductionPct) {
      montantReduction = Math.round(montantTotal * opts.reductionPct / 100 * 100) / 100;
      montantTotal = Math.round((montantTotal - montantReduction) * 100) / 100;
    }

    const montantPaye = opts.montantPaye || 0;

    const facture = await prisma.facture.create({
      data: {
        numero: opts.numero,
        parentId: opts.parentId,
        enfantId: opts.enfantId,
        montantTotal,
        montantPaye,
        dateEmission: new Date(),
        dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        periode: opts.periode,
        anneeScolaire: '2025-2026',
        description: `Facture ${opts.periode}`,
        statut: opts.statut,
        type: 'MENSUELLE',
      },
    });

    // Ligne scolarité
    await prisma.ligneFacture.create({
      data: {
        factureId: facture.id,
        description: `Scolarité mensuelle - ${opts.classe === 'MATERNELLE' || opts.classe === 'ELEMENTAIRE' ? 'Maison des enfants / Élémentaire' : 'Collège'}`,
        quantite: 1,
        prixUnit: prixScolarite,
        montant: prixScolarite,
        type: TypeLigne.SCOLARITE,
      },
    });

    // Lignes extras
    for (const l of lignesExtra) {
      await prisma.ligneFacture.create({
        data: {
          factureId: facture.id,
          description: l.description,
          quantite: l.quantite,
          prixUnit: l.prixUnit,
          montant: Math.round(l.quantite * l.prixUnit * 100) / 100,
          type: l.type,
        },
      });
    }

    // Ligne réduction RFR
    if (montantReduction > 0) {
      await prisma.ligneFacture.create({
        data: {
          factureId: facture.id,
          description: `Réduction RFR (${opts.reductionPct}%)`,
          quantite: 1,
          prixUnit: -montantReduction,
          montant: -montantReduction,
          type: TypeLigne.REDUCTION,
        },
      });
    }

    // Paiements si montantPaye > 0
    if (montantPaye > 0) {
      await prisma.paiement.create({
        data: {
          factureId: facture.id,
          montant: montantPaye,
          datePaiement: new Date(),
          modePaiement: ModePaiement.VIREMENT,
          reference: `VIR-${opts.numero}`,
        },
      });
    }

    return facture;
  }

  // --- Famille Moreau (2 enfants) ---
  // Septembre : payée
  await creerFacture({
    numero: 'FA-202509-0002', parentId: parentMoreau.id, enfantId: emilyMoreau.id,
    classe: 'MATERNELLE', periode: '2025-09', statut: StatutFacture.PAYEE, montantPaye: 575,
  });
  await creerFacture({
    numero: 'FA-202509-0003', parentId: parentMoreau.id, enfantId: thomasMoreau.id,
    classe: 'ELEMENTAIRE', periode: '2025-09', statut: StatutFacture.PAYEE, montantPaye: 575,
  });
  // Octobre : payée
  await creerFacture({
    numero: 'FA-202510-0002', parentId: parentMoreau.id, enfantId: emilyMoreau.id,
    classe: 'MATERNELLE', periode: '2025-10', statut: StatutFacture.PAYEE, montantPaye: 575,
    lignesExtra: [{ description: 'Repas cantine (8 jours)', quantite: 8, prixUnit: 6.5, type: TypeLigne.REPAS }],
  });
  await creerFacture({
    numero: 'FA-202510-0003', parentId: parentMoreau.id, enfantId: thomasMoreau.id,
    classe: 'ELEMENTAIRE', periode: '2025-10', statut: StatutFacture.PAYEE, montantPaye: 575,
  });
  // Novembre : envoyée, pas encore payée
  await creerFacture({
    numero: 'FA-202511-0002', parentId: parentMoreau.id, enfantId: emilyMoreau.id,
    classe: 'MATERNELLE', periode: '2025-11', statut: StatutFacture.ENVOYEE,
    lignesExtra: [
      { description: 'Repas cantine (12 jours)', quantite: 12, prixUnit: 6.5, type: TypeLigne.REPAS },
      { description: 'Garderie matin (5 jours)', quantite: 5, prixUnit: 4, type: TypeLigne.PERISCOLAIRE },
    ],
  });
  await creerFacture({
    numero: 'FA-202511-0003', parentId: parentMoreau.id, enfantId: thomasMoreau.id,
    classe: 'ELEMENTAIRE', periode: '2025-11', statut: StatutFacture.ENVOYEE,
  });
  // Décembre : brouillon
  await creerFacture({
    numero: 'FA-202512-0002', parentId: parentMoreau.id, enfantId: emilyMoreau.id,
    classe: 'MATERNELLE', periode: '2025-12', statut: StatutFacture.EN_ATTENTE,
  });

  // --- Famille Bernard (1 enfant collège, RFR -20%) ---
  await creerFacture({
    numero: 'FA-202509-0004', parentId: parentBernard.id, enfantId: leaBernard.id,
    classe: 'COLLEGE', periode: '2025-09', statut: StatutFacture.PAYEE, montantPaye: 520, reductionPct: 20,
  });
  await creerFacture({
    numero: 'FA-202510-0004', parentId: parentBernard.id, enfantId: leaBernard.id,
    classe: 'COLLEGE', periode: '2025-10', statut: StatutFacture.PAYEE, montantPaye: 520, reductionPct: 20,
  });
  await creerFacture({
    numero: 'FA-202511-0004', parentId: parentBernard.id, enfantId: leaBernard.id,
    classe: 'COLLEGE', periode: '2025-11', statut: StatutFacture.EN_RETARD, reductionPct: 20,
  });

  // --- Famille Petit (3 enfants) ---
  // Septembre payé
  await creerFacture({
    numero: 'FA-202509-0005', parentId: parentPetit.id, enfantId: hugoPetit.id,
    classe: 'MATERNELLE', periode: '2025-09', statut: StatutFacture.PAYEE, montantPaye: 575,
  });
  await creerFacture({
    numero: 'FA-202509-0006', parentId: parentPetit.id, enfantId: manonPetit.id,
    classe: 'ELEMENTAIRE', periode: '2025-09', statut: StatutFacture.PAYEE, montantPaye: 575,
  });
  await creerFacture({
    numero: 'FA-202509-0007', parentId: parentPetit.id, enfantId: lucasPetit.id,
    classe: 'COLLEGE', periode: '2025-09', statut: StatutFacture.PAYEE, montantPaye: 650,
  });
  // Octobre : paiement partiel sur Hugo
  await creerFacture({
    numero: 'FA-202510-0005', parentId: parentPetit.id, enfantId: hugoPetit.id,
    classe: 'MATERNELLE', periode: '2025-10', statut: StatutFacture.PARTIELLE, montantPaye: 300,
    lignesExtra: [{ description: 'Repas cantine (10 jours)', quantite: 10, prixUnit: 6.5, type: TypeLigne.REPAS }],
  });
  await creerFacture({
    numero: 'FA-202510-0006', parentId: parentPetit.id, enfantId: manonPetit.id,
    classe: 'ELEMENTAIRE', periode: '2025-10', statut: StatutFacture.ENVOYEE,
  });
  await creerFacture({
    numero: 'FA-202510-0007', parentId: parentPetit.id, enfantId: lucasPetit.id,
    classe: 'COLLEGE', periode: '2025-10', statut: StatutFacture.ENVOYEE,
    lignesExtra: [{ description: 'Matériel pédagogique', quantite: 1, prixUnit: 45, type: TypeLigne.MATERIEL }],
  });

  // --- Famille Garcia (1 enfant, parents séparés) ---
  await creerFacture({
    numero: 'FA-202509-0008', parentId: parentGarcia1.id, enfantId: linaGarcia.id,
    classe: 'MATERNELLE', periode: '2025-09', statut: StatutFacture.PAYEE, montantPaye: 575,
  });
  await creerFacture({
    numero: 'FA-202510-0008', parentId: parentGarcia1.id, enfantId: linaGarcia.id,
    classe: 'MATERNELLE', periode: '2025-10', statut: StatutFacture.ENVOYEE,
  });
  // Facture annulée (erreur corrigée)
  await creerFacture({
    numero: 'FA-202510-0009', parentId: parentGarcia1.id, enfantId: linaGarcia.id,
    classe: 'MATERNELLE', periode: '2025-10', statut: StatutFacture.ANNULEE,
  });

  console.log('=== Données de test créées ===');
  console.log(`Parents : Moreau (${parentMoreau.id}), Bernard (${parentBernard.id}), Petit (${parentPetit.id}), Garcia (${parentGarcia1.id}/${parentGarcia2.id})`);
  console.log(`Enfants : Emily(${emilyMoreau.id}), Thomas(${thomasMoreau.id}), Léa(${leaBernard.id}), Hugo(${hugoPetit.id}), Manon(${manonPetit.id}), Lucas P.(${lucasPetit.id}), Lina(${linaGarcia.id})`);
  console.log('Factures : ~20 factures avec statuts variés');
  console.log('');
  console.log('Identifiants (mdp: parent1234) :');
  console.log('  moreau@test.fr   — 2 enfants, factures payées + en cours');
  console.log('  bernard@test.fr  — 1 enfant collège, RFR -20%, facture en retard');
  console.log('  petit@test.fr    — 3 enfants, paiement partiel');
  console.log('  garcia@test.fr   — parents séparés, facture annulée');
  console.log('  garcia2@test.fr  — parent 2 (père)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
