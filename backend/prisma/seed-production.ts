/**
 * Seed de démonstration pour la BDD production (Neon)
 * Crée des familles réalistes pour qu'Audrey puisse tester l'application
 *
 * Usage: npx ts-node prisma/seed-production.ts
 * (avec DATABASE_URL et DIRECT_URL configurés vers Neon)
 */

import { PrismaClient, Classe, Role, StatutInscription, StatutPreinscription, StatutReinscription, FrequencePaiement, ModePaiement, DestinataireFacture } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Seed production : création des données de démo ===\n');

  const passwordHash = await bcrypt.hash('Parent2026!', 10);

  // ============================================================
  // FAMILLE 1 : DUPONT — 2 parents, 2 enfants (fratrie), mensuel
  // ============================================================
  console.log('Famille 1 : Dupont (2 parents, 2 enfants)...');
  const dupont1 = await prisma.user.create({
    data: {
      email: 'sophie.dupont@email.com',
      password: passwordHash,
      name: 'Sophie Dupont',
      nom: 'Dupont',
      prenom: 'Sophie',
      telephone: '06 12 34 56 78',
      adresse: '12 rue des Lilas, 68350 Brunstatt',
      role: Role.PARENT,
      premiereConnexion: false,
      actif: true,
      frequencePaiement: FrequencePaiement.MENSUEL,
      modePaiementPref: ModePaiement.PRELEVEMENT,
      destinataireFacture: DestinataireFacture.LES_DEUX,
      ibanParent: 'FR76 1234 5678 9012 3456 7890 123',
      mandatSepaRef: 'MANDAT-DUPONT-001',
    },
  });
  const dupont2 = await prisma.user.create({
    data: {
      email: 'marc.dupont@email.com',
      password: passwordHash,
      name: 'Marc Dupont',
      nom: 'Dupont',
      prenom: 'Marc',
      telephone: '06 98 76 54 32',
      adresse: '12 rue des Lilas, 68350 Brunstatt',
      role: Role.PARENT,
      premiereConnexion: false,
      actif: true,
    },
  });

  const emma = await prisma.enfant.create({
    data: {
      nom: 'Dupont', prenom: 'Emma',
      dateNaissance: new Date('2019-05-15'),
      lieuNaissance: 'Mulhouse',
      classe: Classe.MATERNELLE,
      parent1Id: dupont1.id,
      parent2Id: dupont2.id,
    },
  });
  const lucas = await prisma.enfant.create({
    data: {
      nom: 'Dupont', prenom: 'Lucas',
      dateNaissance: new Date('2016-09-22'),
      lieuNaissance: 'Mulhouse',
      classe: Classe.ELEMENTAIRE,
      parent1Id: dupont1.id,
      parent2Id: dupont2.id,
    },
  });

  // Inscriptions actives
  await prisma.inscription.createMany({
    data: [
      { enfantId: emma.id, parentId: dupont1.id, dateInscription: new Date('2025-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
      { enfantId: lucas.id, parentId: dupont1.id, dateInscription: new Date('2023-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
    ],
  });

  // Réinscription pour 2026-2027
  await prisma.reinscription.create({
    data: {
      enfantId: emma.id,
      parentId: dupont1.id,
      anneeScolaire: '2026-2027',
      classeActuelle: 'MATERNELLE',
      classeSouhaitee: 'MATERNELLE',
      statut: StatutReinscription.EN_ATTENTE,
    },
  });

  // ============================================================
  // FAMILLE 2 : MARTIN — mère seule, 1 enfant, trimestriel + RFR
  // ============================================================
  console.log('Famille 2 : Martin (mère seule, 1 enfant, RFR)...');
  const martin = await prisma.user.create({
    data: {
      email: 'claire.martin@email.com',
      password: passwordHash,
      name: 'Claire Martin',
      nom: 'Martin',
      prenom: 'Claire',
      telephone: '06 11 22 33 44',
      adresse: '5 avenue Foch, 68100 Mulhouse',
      role: Role.PARENT,
      premiereConnexion: false,
      actif: true,
      frequencePaiement: FrequencePaiement.TRIMESTRIEL,
      modePaiementPref: ModePaiement.VIREMENT,
      destinataireFacture: DestinataireFacture.PARENT1,
      reductionRFR: true,
      tauxReductionRFR: 6,
    },
  });

  const leo = await prisma.enfant.create({
    data: {
      nom: 'Martin', prenom: 'Léo',
      dateNaissance: new Date('2020-01-10'),
      lieuNaissance: 'Mulhouse',
      classe: Classe.MATERNELLE,
      parent1Id: martin.id,
    },
  });

  await prisma.inscription.create({
    data: { enfantId: leo.id, parentId: martin.id, dateInscription: new Date('2025-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
  });

  // ============================================================
  // FAMILLE 3 : BERNARD — parents divorcés, 3 enfants (maternelle + élémentaire + collège)
  // ============================================================
  console.log('Famille 3 : Bernard (divorcés, 3 enfants)...');
  const bernard1 = await prisma.user.create({
    data: {
      email: 'nathalie.bernard@email.com',
      password: passwordHash,
      name: 'Nathalie Bernard',
      nom: 'Bernard',
      prenom: 'Nathalie',
      telephone: '06 55 66 77 88',
      adresse: '8 rue du Rhin, 68200 Mulhouse',
      role: Role.PARENT,
      premiereConnexion: false,
      actif: true,
      frequencePaiement: FrequencePaiement.MENSUEL,
      modePaiementPref: ModePaiement.PRELEVEMENT,
      destinataireFacture: DestinataireFacture.PARENT1,
      ibanParent: 'FR76 9876 5432 1098 7654 3210 987',
      mandatSepaRef: 'MANDAT-BERNARD-001',
    },
  });
  const bernard2 = await prisma.user.create({
    data: {
      email: 'thomas.bernard@email.com',
      password: passwordHash,
      name: 'Thomas Bernard',
      nom: 'Bernard',
      prenom: 'Thomas',
      telephone: '06 44 33 22 11',
      adresse: '15 rue de Bâle, 68100 Mulhouse',
      role: Role.PARENT,
      premiereConnexion: false,
      actif: true,
    },
  });

  const chloe = await prisma.enfant.create({
    data: {
      nom: 'Bernard', prenom: 'Chloé',
      dateNaissance: new Date('2021-03-28'),
      lieuNaissance: 'Colmar',
      classe: Classe.MATERNELLE,
      parent1Id: bernard1.id,
      parent2Id: bernard2.id,
    },
  });
  const hugo = await prisma.enfant.create({
    data: {
      nom: 'Bernard', prenom: 'Hugo',
      dateNaissance: new Date('2017-11-05'),
      lieuNaissance: 'Colmar',
      classe: Classe.ELEMENTAIRE,
      parent1Id: bernard1.id,
      parent2Id: bernard2.id,
    },
  });
  const jules = await prisma.enfant.create({
    data: {
      nom: 'Bernard', prenom: 'Jules',
      dateNaissance: new Date('2013-07-12'),
      lieuNaissance: 'Colmar',
      classe: Classe.COLLEGE,
      parent1Id: bernard1.id,
      parent2Id: bernard2.id,
    },
  });

  await prisma.inscription.createMany({
    data: [
      { enfantId: chloe.id, parentId: bernard1.id, dateInscription: new Date('2025-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
      { enfantId: hugo.id, parentId: bernard1.id, dateInscription: new Date('2023-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
      { enfantId: jules.id, parentId: bernard1.id, dateInscription: new Date('2024-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
    ],
  });

  // Réinscriptions pour 2026-2027
  await prisma.reinscription.createMany({
    data: [
      { enfantId: hugo.id, parentId: bernard1.id, anneeScolaire: '2026-2027', classeActuelle: 'ELEMENTAIRE', classeSouhaitee: 'ELEMENTAIRE', statut: StatutReinscription.EN_ATTENTE },
      { enfantId: jules.id, parentId: bernard1.id, anneeScolaire: '2026-2027', classeActuelle: 'COLLEGE', classeSouhaitee: 'COLLEGE', statut: StatutReinscription.VALIDEE, dateTraitement: new Date('2026-02-20') },
    ],
  });

  // ============================================================
  // FAMILLE 4 : PETIT — 1 parent, 1 enfant élémentaire, annuel
  // ============================================================
  console.log('Famille 4 : Petit (1 parent, 1 enfant)...');
  const petit = await prisma.user.create({
    data: {
      email: 'julie.petit@email.com',
      password: passwordHash,
      name: 'Julie Petit',
      nom: 'Petit',
      prenom: 'Julie',
      telephone: '06 77 88 99 00',
      adresse: '22 rue des Vosges, 68350 Brunstatt',
      role: Role.PARENT,
      premiereConnexion: false,
      actif: true,
      frequencePaiement: FrequencePaiement.ANNUEL,
      modePaiementPref: ModePaiement.VIREMENT,
    },
  });

  const alice = await prisma.enfant.create({
    data: {
      nom: 'Petit', prenom: 'Alice',
      dateNaissance: new Date('2018-06-20'),
      lieuNaissance: 'Strasbourg',
      classe: Classe.ELEMENTAIRE,
      parent1Id: petit.id,
    },
  });

  await prisma.inscription.create({
    data: { enfantId: alice.id, parentId: petit.id, dateInscription: new Date('2024-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
  });

  // ============================================================
  // FAMILLE 5 : LEROY — 2 parents, 2 enfants maternelle
  // ============================================================
  console.log('Famille 5 : Leroy (2 parents, 2 enfants maternelle)...');
  const leroy1 = await prisma.user.create({
    data: {
      email: 'sandrine.leroy@email.com',
      password: passwordHash,
      name: 'Sandrine Leroy',
      nom: 'Leroy',
      prenom: 'Sandrine',
      telephone: '06 10 20 30 40',
      adresse: '3 impasse des Cerisiers, 68350 Brunstatt',
      role: Role.PARENT,
      premiereConnexion: false,
      actif: true,
      frequencePaiement: FrequencePaiement.MENSUEL,
      modePaiementPref: ModePaiement.PRELEVEMENT,
      destinataireFacture: DestinataireFacture.LES_DEUX,
      ibanParent: 'FR76 3000 1234 5678 9012 3456 789',
      mandatSepaRef: 'MANDAT-LEROY-001',
    },
  });
  const leroy2 = await prisma.user.create({
    data: {
      email: 'olivier.leroy@email.com',
      password: passwordHash,
      name: 'Olivier Leroy',
      nom: 'Leroy',
      prenom: 'Olivier',
      telephone: '06 50 60 70 80',
      adresse: '3 impasse des Cerisiers, 68350 Brunstatt',
      role: Role.PARENT,
      premiereConnexion: false,
      actif: true,
    },
  });

  const lina = await prisma.enfant.create({
    data: {
      nom: 'Leroy', prenom: 'Lina',
      dateNaissance: new Date('2020-08-14'),
      lieuNaissance: 'Mulhouse',
      classe: Classe.MATERNELLE,
      parent1Id: leroy1.id,
      parent2Id: leroy2.id,
    },
  });
  const noah = await prisma.enfant.create({
    data: {
      nom: 'Leroy', prenom: 'Noah',
      dateNaissance: new Date('2022-02-03'),
      lieuNaissance: 'Mulhouse',
      classe: Classe.MATERNELLE,
      parent1Id: leroy1.id,
      parent2Id: leroy2.id,
    },
  });

  await prisma.inscription.createMany({
    data: [
      { enfantId: lina.id, parentId: leroy1.id, dateInscription: new Date('2025-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
      { enfantId: noah.id, parentId: leroy1.id, dateInscription: new Date('2025-09-01'), statut: StatutInscription.ACTIVE, anneeScolaire: '2025-2026' },
    ],
  });

  // ============================================================
  // PRÉINSCRIPTIONS EN ATTENTE (pour qu'Audrey puisse tester les annotations)
  // ============================================================
  console.log('Préinscriptions en attente...');
  await prisma.preinscription.createMany({
    data: [
      {
        numeroDossier: 'DOSS-2026-DEMO01',
        nomEnfant: 'Moreau', prenomEnfant: 'Rose',
        dateNaissance: new Date('2021-04-12'),
        classeSouhaitee: Classe.MATERNELLE,
        civiliteParent: 'Mme',
        nomParent: 'Moreau', prenomParent: 'Isabelle',
        emailParent: 'isabelle.moreau@email.com',
        telephoneParent: '06 22 33 44 55',
        adresseParent: '7 rue du Marché, 68100 Mulhouse',
        lienParente: 'Mère',
        professionParent: 'Infirmière',
        situationFamiliale: 'MARIES',
        nomParent2: 'Moreau', prenomParent2: 'Pierre',
        emailParent2: 'pierre.moreau@email.com',
        telephoneParent2: '06 66 77 88 99',
        lienParente2: 'Père',
        professionParent2: 'Ingénieur',
        dateIntegration: new Date('2026-09-01'),
        statut: StatutPreinscription.EN_ATTENTE,
        emailVerifie: true,
        decouverte: 'Bouche à oreille',
        attentesStructure: 'Pédagogie bienveillante',
        pedagogieMontessori: 'Nous connaissons les principes et souhaitons cette approche pour Rose.',
      },
      {
        numeroDossier: 'DOSS-2026-DEMO02',
        nomEnfant: 'Roux', prenomEnfant: 'Théo',
        dateNaissance: new Date('2019-11-30'),
        classeSouhaitee: Classe.MATERNELLE,
        civiliteParent: 'M.',
        nomParent: 'Roux', prenomParent: 'David',
        emailParent: 'david.roux@email.com',
        telephoneParent: '06 99 88 77 66',
        adresseParent: '18 boulevard de l\'Europe, 68200 Mulhouse',
        lienParente: 'Père',
        professionParent: 'Commerçant',
        situationFamiliale: 'FAMILLE_MONOPARENTALE',
        dateIntegration: new Date('2026-09-01'),
        statut: StatutPreinscription.EN_ATTENTE,
        emailVerifie: true,
        decouverte: 'Site internet',
        attentesStructure: 'Un cadre structurant et bienveillant pour Théo.',
      },
      {
        numeroDossier: 'DOSS-2026-DEMO03',
        nomEnfant: 'Fournier', prenomEnfant: 'Manon',
        dateNaissance: new Date('2020-07-08'),
        classeSouhaitee: Classe.MATERNELLE,
        civiliteParent: 'Mme',
        nomParent: 'Fournier', prenomParent: 'Céline',
        emailParent: 'celine.fournier@email.com',
        telephoneParent: '06 33 44 55 66',
        adresseParent: '25 rue de la Liberté, 68350 Brunstatt',
        lienParente: 'Mère',
        professionParent: 'Enseignante',
        situationFamiliale: 'PACSES',
        nomParent2: 'Fournier', prenomParent2: 'Antoine',
        emailParent2: 'antoine.fournier@email.com',
        telephoneParent2: '06 77 66 55 44',
        lienParente2: 'Père',
        dateIntegration: new Date('2026-09-01'),
        statut: StatutPreinscription.DEJA_CONTACTE,
        emailVerifie: true,
        decouverte: 'Portes ouvertes',
      },
    ],
  });

  // ============================================================
  // COMMANDES REPAS (quelques-unes pour mars 2026)
  // ============================================================
  console.log('Commandes repas mars 2026...');
  const joursMars = [3, 4, 6, 7, 10, 11, 13, 14]; // lundi, mardi, jeudi, vendredi
  const enfantsRepas = [emma.id, lucas.id, leo.id, chloe.id, hugo.id, jules.id, lina.id];

  const repasData: { enfantId: number; dateRepas: Date; type: 'MIDI' }[] = [];
  for (const enfantId of enfantsRepas) {
    for (const jour of joursMars) {
      repasData.push({
        enfantId,
        dateRepas: new Date(`2026-03-${jour.toString().padStart(2, '0')}`),
        type: 'MIDI',
      });
    }
  }
  await prisma.repas.createMany({ data: repasData });

  // ============================================================
  // COMMANDES PÉRISCOLAIRE (quelques enfants, pas tous)
  // ============================================================
  console.log('Commandes périscolaire mars 2026...');
  const enfantsPeri = [emma.id, leo.id, chloe.id, lina.id]; // 4 enfants en périscolaire
  const joursPeri = [3, 4, 10, 11]; // 4 jours

  const periData: { enfantId: number; datePeriscolaire: Date }[] = [];
  for (const enfantId of enfantsPeri) {
    for (const jour of joursPeri) {
      periData.push({
        enfantId,
        datePeriscolaire: new Date(`2026-03-${jour.toString().padStart(2, '0')}`),
      });
    }
  }
  await prisma.periscolaire.createMany({ data: periData });

  // ============================================================
  // SEED TARIFS pour 2025-2026
  // ============================================================
  console.log('Configuration tarifs 2025-2026...');
  const tarifs = [
    // Scolarité
    { cle: 'scolarite_mensuel_normal', valeur: 575, description: 'Scolarité mensuelle (1 enfant)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_mensuel_fratrie', valeur: 540, description: 'Scolarité mensuelle (fratrie)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_trimestriel_normal', valeur: 1725, description: 'Scolarité trimestrielle (1 enfant)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_trimestriel_fratrie', valeur: 1620, description: 'Scolarité trimestrielle (fratrie)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_annuel_normal', valeur: 6900, description: 'Scolarité annuelle (1 enfant)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_annuel_fratrie', valeur: 6480, description: 'Scolarité annuelle (fratrie)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    // Collège
    { cle: 'scolarite_college_mensuel_normal', valeur: 710, description: 'Collège mensuel (1 enfant)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_college_mensuel_fratrie', valeur: 640, description: 'Collège mensuel (fratrie)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_college_trimestriel_normal', valeur: 2130, description: 'Collège trimestriel (1 enfant)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_college_trimestriel_fratrie', valeur: 1920, description: 'Collège trimestriel (fratrie)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_college_annuel_normal', valeur: 8520, description: 'Collège annuel (1 enfant)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    { cle: 'scolarite_college_annuel_fratrie', valeur: 7680, description: 'Collège annuel (fratrie)', categorie: 'scolarite', anneeScolaire: '2025-2026' },
    // Inscription
    { cle: 'inscription_premiere_annee', valeur: 350, description: 'Frais inscription 1ère année', categorie: 'inscription', anneeScolaire: '2025-2026' },
    { cle: 'inscription_premiere_annee_fratrie', valeur: 150, description: 'Frais inscription 1ère année (fratrie)', categorie: 'inscription', anneeScolaire: '2025-2026' },
    { cle: 'inscription_annees_suivantes', valeur: 195, description: 'Frais inscription années suivantes', categorie: 'inscription', anneeScolaire: '2025-2026' },
    { cle: 'inscription_annees_suivantes_fratrie', valeur: 160, description: 'Frais inscription années suivantes (fratrie)', categorie: 'inscription', anneeScolaire: '2025-2026' },
    // Fonctionnement
    { cle: 'fonctionnement_maternelle', valeur: 65, description: 'Matériel pédagogique maternelle', categorie: 'fonctionnement', anneeScolaire: '2025-2026' },
    { cle: 'fonctionnement_elementaire', valeur: 85, description: 'Matériel pédagogique élémentaire', categorie: 'fonctionnement', anneeScolaire: '2025-2026' },
    { cle: 'fonctionnement_college', valeur: 95, description: 'Matériel pédagogique collège', categorie: 'fonctionnement', anneeScolaire: '2025-2026' },
    // Repas & Périscolaire
    { cle: 'repas_midi', valeur: 5.45, description: 'Repas midi', categorie: 'repas', anneeScolaire: '2025-2026' },
    { cle: 'periscolaire_seance', valeur: 6.20, description: 'Périscolaire (séance)', categorie: 'periscolaire', anneeScolaire: '2025-2026' },
    // RFR
    { cle: 'reduction_rfr_maternelle_elementaire', valeur: 6, description: 'Réduction RFR maternelle/élémentaire (%)', categorie: 'reduction', anneeScolaire: '2025-2026' },
    { cle: 'reduction_rfr_college', valeur: 19, description: 'Réduction RFR collège (%)', categorie: 'reduction', anneeScolaire: '2025-2026' },
  ];

  for (const tarif of tarifs) {
    await prisma.configTarif.upsert({
      where: { cle_anneeScolaire: { cle: tarif.cle, anneeScolaire: tarif.anneeScolaire } },
      update: { valeur: tarif.valeur },
      create: tarif,
    });
  }

  // ============================================================
  // ARTICLES PERSONNALISÉS
  // ============================================================
  console.log('Articles personnalisés...');
  await prisma.articlePersonnalise.createMany({
    data: [
      { nom: 'Classe verte', description: 'Séjour classe verte (3 jours)', prixDefaut: 180 },
      { nom: 'Sortie piscine', description: 'Entrée piscine + transport', prixDefaut: 12 },
      { nom: 'Sortie escalade', description: 'Séance escalade + transport', prixDefaut: 15 },
      { nom: 'Photo de classe', description: 'Photo de classe individuelle + groupe', prixDefaut: 18 },
    ],
  });

  // ============================================================
  // RÉSUMÉ
  // ============================================================
  const stats = {
    parents: await prisma.user.count({ where: { role: Role.PARENT } }),
    enfants: await prisma.enfant.count(),
    inscriptions: await prisma.inscription.count(),
    preinscriptions: await prisma.preinscription.count(),
    reinscriptions: await prisma.reinscription.count(),
    repas: await prisma.repas.count(),
    periscolaires: await prisma.periscolaire.count(),
    tarifs: await prisma.configTarif.count(),
    articles: await prisma.articlePersonnalise.count(),
  };

  console.log('\n=== Seed terminé ===');
  console.log(`Parents    : ${stats.parents} (dont admin)`);
  console.log(`Enfants    : ${stats.enfants}`);
  console.log(`Inscriptions : ${stats.inscriptions}`);
  console.log(`Préinscriptions : ${stats.preinscriptions}`);
  console.log(`Réinscriptions  : ${stats.reinscriptions}`);
  console.log(`Repas      : ${stats.repas}`);
  console.log(`Périscolaire : ${stats.periscolaires}`);
  console.log(`Tarifs     : ${stats.tarifs}`);
  console.log(`Articles   : ${stats.articles}`);
  console.log('\n--- Identifiants parents (tous : Parent2026!) ---');
  console.log('sophie.dupont@email.com   (2 enfants, fratrie, prélèvement)');
  console.log('claire.martin@email.com   (1 enfant, RFR -6%, virement)');
  console.log('nathalie.bernard@email.com (3 enfants, collège, prélèvement)');
  console.log('julie.petit@email.com     (1 enfant, paiement annuel)');
  console.log('sandrine.leroy@email.com  (2 enfants maternelle, prélèvement)');
}

main()
  .catch((e) => {
    console.error('Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
