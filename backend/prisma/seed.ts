import { PrismaClient, Role, Classe, StatutPreinscription, StatutInscription, StatutFacture, TypeFacture, TypeLigne, ModePaiement, FrequencePaiement } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // ============================================
  // 1. TYPES DE JUSTIFICATIFS ATTENDUS
  // ============================================
  console.log('📋 Création des types de justificatifs...');

  const justificatifsTypes = [
    {
      nom: "Pièce d'identité parent(s)",
      description: "Copie de la pièce d'identité (carte d'identité ou passeport) du ou des parents",
      obligatoire: true,
    },
    {
      nom: 'Acte de naissance / Livret de famille',
      description: "Copie de l'acte de naissance de l'enfant ou du livret de famille",
      obligatoire: true,
    },
    {
      nom: 'Justificatif de domicile',
      description: 'Facture récente (électricité, eau, téléphone) ou quittance de loyer de moins de 3 mois',
      obligatoire: true,
    },
    {
      nom: 'Carnet de vaccination',
      description: "Copie du carnet de vaccination de l'enfant à jour",
      obligatoire: true,
    },
    {
      nom: 'Attestation de responsabilité civile',
      description: "Attestation d'assurance responsabilité civile de l'enfant (à renouveler chaque année en septembre)",
      obligatoire: true,
    },
    {
      nom: 'Règlement intérieur signé',
      description: "Règlement intérieur de l'école lu et signé par les parents",
      obligatoire: true,
    },
    {
      nom: 'Autre',
      description: "Tout autre document que vous souhaitez fournir",
      obligatoire: false,
    },
  ];

  for (const type of justificatifsTypes) {
    // Chercher par nom pour éviter les doublons (plus robuste que par ID)
    const existing = await prisma.justificatifAttendu.findFirst({
      where: { nom: type.nom },
    });

    if (existing) {
      // Mettre à jour si nécessaire
      await prisma.justificatifAttendu.update({
        where: { id: existing.id },
        data: type,
      });
    } else {
      // Créer si n'existe pas
      await prisma.justificatifAttendu.create({ data: type });
    }
  }
  console.log('✅ Types de justificatifs créés');

  // ============================================
  // 2. UTILISATEURS DE TEST
  // ============================================
  console.log('👤 Création des utilisateurs de test...');

  // Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecole.fr' },
    update: {},
    create: {
      email: 'admin@ecole.fr',
      password: adminPassword,
      name: 'Administrateur',
      nom: 'Admin',
      prenom: 'Super',
      role: Role.ADMIN,
      actif: true,
      premiereConnexion: false,
    },
  });
  console.log(`✅ Admin créé: ${admin.email}`);

  // Parent de test
  const parentPassword = await bcrypt.hash('parent1234', 10);
  const parent = await prisma.user.upsert({
    where: { email: 'parent@test.fr' },
    update: {},
    create: {
      email: 'parent@test.fr',
      password: parentPassword,
      name: 'Marie Dupont',
      nom: 'Dupont',
      prenom: 'Marie',
      telephone: '0612345678',
      adresse: '123 rue de la Paix, 68100 Mulhouse',
      role: Role.PARENT,
      actif: true,
      premiereConnexion: false,
    },
  });
  console.log(`✅ Parent créé: ${parent.email}`);

  // ============================================
  // 3. ENFANT DE TEST
  // ============================================
  console.log('👶 Création d\'un enfant de test...');

  const enfant = await prisma.enfant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nom: 'Dupont',
      prenom: 'Lucas',
      dateNaissance: new Date('2020-03-15'),
      lieuNaissance: 'Mulhouse',
      classe: Classe.MATERNELLE,
      parent1Id: parent.id,
    },
  });
  console.log(`✅ Enfant créé: ${enfant.prenom} ${enfant.nom}`);

  // ============================================
  // 4. PRÉINSCRIPTION DE TEST (VALIDÉE)
  // ============================================
  console.log('📝 Création d\'une préinscription de test...');

  const preinscription = await prisma.preinscription.upsert({
    where: { numeroDossier: 'PRE-2025-TEST01' },
    update: {},
    create: {
      numeroDossier: 'PRE-2025-TEST01',
      nomEnfant: 'Dupont',
      prenomEnfant: 'Lucas',
      dateNaissance: new Date('2020-03-15'),
      lieuNaissance: 'Mulhouse',
      nationalite: 'Française',
      classeSouhaitee: Classe.MATERNELLE,
      civiliteParent: 'Mme',
      nomParent: 'Dupont',
      prenomParent: 'Marie',
      emailParent: 'parent@test.fr',
      telephoneParent: '0612345678',
      lienParente: 'Mère',
      adresseParent: '123 rue de la Paix, 68100 Mulhouse',
      statut: StatutPreinscription.VALIDE,
      compteCree: true,
      dateDemande: new Date(),
      decouverte: 'Recommandation',
      pedagogieMontessori: 'Autonomie de l\'enfant',
      difficultes: 'Aucune',
    },
  });
  console.log(`✅ Préinscription créée: ${preinscription.numeroDossier}`);

  // Lier l'enfant à la préinscription
  await prisma.enfant.update({
    where: { id: enfant.id },
    data: { preinscriptionId: preinscription.id },
  });

  // ============================================
  // 5. TARIFS PAR DÉFAUT (2025-2026)
  // ============================================
  console.log('💰 Création des tarifs par défaut...');

  const anneeScolaire = '2025-2026';
  const tarifsDefaut = [
    { cle: 'SCOLARITE_MENSUEL', valeur: 575.0, description: 'Scolarité mensuelle - 1 enfant (maison/élémentaire)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_TRIMESTRIEL', valeur: 1725.0, description: 'Scolarité trimestrielle - 1 enfant (maison/élémentaire)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_ANNUEL', valeur: 6900.0, description: 'Scolarité annuelle - 1 enfant (maison/élémentaire)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_FRATRIE_MENSUEL', valeur: 540.0, description: 'Scolarité mensuelle - fratrie (maison/élémentaire)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_FRATRIE_TRIMESTRIEL', valeur: 1620.0, description: 'Scolarité trimestrielle - fratrie (maison/élémentaire)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_FRATRIE_ANNUEL', valeur: 6480.0, description: 'Scolarité annuelle - fratrie (maison/élémentaire)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_COLLEGE_MENSUEL', valeur: 710.0, description: 'Scolarité mensuelle - 1 enfant (collège)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_COLLEGE_TRIMESTRIEL', valeur: 2130.0, description: 'Scolarité trimestrielle - 1 enfant (collège)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_COLLEGE_ANNUEL', valeur: 8520.0, description: 'Scolarité annuelle - 1 enfant (collège)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_COLLEGE_FRATRIE_MENSUEL', valeur: 640.0, description: 'Scolarité mensuelle - fratrie (collège)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_COLLEGE_FRATRIE_TRIMESTRIEL', valeur: 1920.0, description: 'Scolarité trimestrielle - fratrie (collège)', categorie: 'SCOLARITE' },
    { cle: 'SCOLARITE_COLLEGE_FRATRIE_ANNUEL', valeur: 7680.0, description: 'Scolarité annuelle - fratrie (collège)', categorie: 'SCOLARITE' },
    { cle: 'INSCRIPTION_PREMIERE_ANNEE', valeur: 350.0, description: "Frais d'inscription 1ère année - 1 enfant", categorie: 'INSCRIPTION' },
    { cle: 'INSCRIPTION_FRATRIE_PREMIERE', valeur: 150.0, description: "Frais d'inscription 1ère année - fratrie", categorie: 'INSCRIPTION' },
    { cle: 'INSCRIPTION_ANNEES_SUIVANTES', valeur: 195.0, description: "Frais d'inscription années suivantes - 1 enfant", categorie: 'INSCRIPTION' },
    { cle: 'INSCRIPTION_FRATRIE_SUIVANTES', valeur: 160.0, description: "Frais d'inscription années suivantes - fratrie", categorie: 'INSCRIPTION' },
    { cle: 'FONCTIONNEMENT_MATERNELLE', valeur: 65.0, description: 'Frais matériel pédagogique - 3 à 6 ans', categorie: 'FONCTIONNEMENT' },
    { cle: 'FONCTIONNEMENT_ELEMENTAIRE', valeur: 85.0, description: 'Frais matériel pédagogique - 6 à 12 ans', categorie: 'FONCTIONNEMENT' },
    { cle: 'FONCTIONNEMENT_COLLEGE', valeur: 95.0, description: 'Frais matériel pédagogique - collège', categorie: 'FONCTIONNEMENT' },
    { cle: 'REDUCTION_FRATRIE_POURCENTAGE', valeur: 6.0, description: 'Réduction fratrie en % (maison/élémentaire)', categorie: 'FRATRIE' },
    { cle: 'REDUCTION_FRATRIE_COLLEGE_POURCENTAGE', valeur: 19.0, description: 'Réduction fratrie en % (collège) - RFR', categorie: 'FRATRIE' },
    { cle: 'REPAS_MIDI', valeur: 5.45, description: 'Tarif repas du midi (traiteur)', categorie: 'REPAS' },
    { cle: 'PERISCOLAIRE_SEANCE', valeur: 6.20, description: 'Tarif périscolaire par séance (16h-17h30, goûter inclus)', categorie: 'PERISCOLAIRE' },
  ];

  for (const tarif of tarifsDefaut) {
    await prisma.configTarif.upsert({
      where: {
        cle_anneeScolaire: { cle: tarif.cle, anneeScolaire },
      },
      update: {
        valeur: tarif.valeur,
        description: tarif.description,
        categorie: tarif.categorie,
        actif: true,
      },
      create: {
        ...tarif,
        anneeScolaire,
      },
    });
  }
  console.log(`✅ ${tarifsDefaut.length} tarifs par défaut créés pour ${anneeScolaire}`);

  // ============================================
  // 6. ARTICLES PERSONNALISÉS DE DÉMO
  // ============================================
  console.log('📦 Création des articles personnalisés de démo...');

  const articlesDemo = [
    { nom: 'Sortie scolaire - Musée', description: 'Sortie pédagogique au musée', prixDefaut: 25.0 },
    { nom: 'Classe verte - 3 jours', description: 'Séjour classe verte avec hébergement', prixDefaut: 180.0 },
    { nom: 'Matériel pédagogique supplémentaire', description: 'Fournitures spécifiques pour activités', prixDefaut: 45.0 },
  ];

  for (const article of articlesDemo) {
    const existing = await prisma.articlePersonnalise.findFirst({
      where: { nom: article.nom },
    });
    if (!existing) {
      await prisma.articlePersonnalise.create({ data: article });
    }
  }
  console.log(`✅ ${articlesDemo.length} articles personnalisés créés`);

  // ============================================
  // 7. FAMILLES SUPPLÉMENTAIRES
  // ============================================
  console.log('👨‍👩‍👧‍👦 Création des familles supplémentaires...');

  // Famille Martin — 2 enfants (fratrie), mère seule
  const parent2Password = await bcrypt.hash('parent1234', 10);
  const parentMartin = await prisma.user.upsert({
    where: { email: 'sophie.martin@email.fr' },
    update: {},
    create: {
      email: 'sophie.martin@email.fr',
      password: parent2Password,
      name: 'Sophie Martin',
      nom: 'Martin',
      prenom: 'Sophie',
      telephone: '0687451239',
      adresse: '45 avenue de Colmar, 68200 Mulhouse',
      role: Role.PARENT,
      actif: true,
      premiereConnexion: false,
      frequencePaiement: FrequencePaiement.MENSUEL,
      modePaiementPref: ModePaiement.PRELEVEMENT,
      ibanParent: 'FR7630006000011234567890189',
      mandatSepaRef: 'MANDAT-2025-002',
    },
  });

  const enfantMartin1 = await prisma.enfant.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nom: 'Martin',
      prenom: 'Emma',
      dateNaissance: new Date('2019-06-22'),
      lieuNaissance: 'Mulhouse',
      classe: Classe.MATERNELLE,
      parent1Id: parentMartin.id,
    },
  });

  const enfantMartin2 = await prisma.enfant.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nom: 'Martin',
      prenom: 'Noah',
      dateNaissance: new Date('2017-01-10'),
      lieuNaissance: 'Mulhouse',
      classe: Classe.ELEMENTAIRE,
      parent1Id: parentMartin.id,
    },
  });

  // Famille Bernard — couple, 1 enfant élémentaire
  const parent3Password = await bcrypt.hash('parent1234', 10);
  const parentBernard1 = await prisma.user.upsert({
    where: { email: 'claire.bernard@email.fr' },
    update: {},
    create: {
      email: 'claire.bernard@email.fr',
      password: parent3Password,
      name: 'Claire Bernard',
      nom: 'Bernard',
      prenom: 'Claire',
      telephone: '0654321987',
      adresse: '12 rue du Sauvage, 68100 Mulhouse',
      role: Role.PARENT,
      actif: true,
      premiereConnexion: false,
      frequencePaiement: FrequencePaiement.TRIMESTRIEL,
      modePaiementPref: ModePaiement.VIREMENT,
    },
  });

  const parentBernard2 = await prisma.user.upsert({
    where: { email: 'thomas.bernard@email.fr' },
    update: {},
    create: {
      email: 'thomas.bernard@email.fr',
      password: parent3Password,
      name: 'Thomas Bernard',
      nom: 'Bernard',
      prenom: 'Thomas',
      telephone: '0698765432',
      adresse: '12 rue du Sauvage, 68100 Mulhouse',
      role: Role.PARENT,
      actif: true,
      premiereConnexion: false,
    },
  });

  const enfantBernard = await prisma.enfant.upsert({
    where: { id: 4 },
    update: {},
    create: {
      nom: 'Bernard',
      prenom: 'Léa',
      dateNaissance: new Date('2018-09-05'),
      lieuNaissance: 'Colmar',
      classe: Classe.ELEMENTAIRE,
      parent1Id: parentBernard1.id,
      parent2Id: parentBernard2.id,
    },
  });

  // Famille Petit — 1 enfant maternelle, préinscription récente
  const parent4Password = await bcrypt.hash('parent1234', 10);
  const parentPetit = await prisma.user.upsert({
    where: { email: 'amandine.petit@email.fr' },
    update: {},
    create: {
      email: 'amandine.petit@email.fr',
      password: parent4Password,
      name: 'Amandine Petit',
      nom: 'Petit',
      prenom: 'Amandine',
      telephone: '0612987654',
      adresse: '8 rue des Tanneurs, 68100 Mulhouse',
      role: Role.PARENT,
      actif: true,
      premiereConnexion: true, // N'a pas encore changé son mot de passe
      frequencePaiement: FrequencePaiement.MENSUEL,
      modePaiementPref: ModePaiement.PRELEVEMENT,
    },
  });

  const enfantPetit = await prisma.enfant.upsert({
    where: { id: 5 },
    update: {},
    create: {
      nom: 'Petit',
      prenom: 'Jade',
      dateNaissance: new Date('2021-11-28'),
      lieuNaissance: 'Strasbourg',
      classe: Classe.MATERNELLE,
      parent1Id: parentPetit.id,
    },
  });

  console.log('✅ 3 familles supplémentaires créées');

  // ============================================
  // 8. INSCRIPTIONS
  // ============================================
  console.log('📚 Création des inscriptions...');

  const inscriptionsData = [
    { enfantId: enfant.id, parentId: parent.id, statut: StatutInscription.ACTIVE },
    { enfantId: enfantMartin1.id, parentId: parentMartin.id, statut: StatutInscription.ACTIVE },
    { enfantId: enfantMartin2.id, parentId: parentMartin.id, statut: StatutInscription.ACTIVE },
    { enfantId: enfantBernard.id, parentId: parentBernard1.id, statut: StatutInscription.ACTIVE },
    { enfantId: enfantPetit.id, parentId: parentPetit.id, statut: StatutInscription.EN_COURS },
  ];

  for (const insc of inscriptionsData) {
    const existing = await prisma.inscription.findFirst({
      where: { enfantId: insc.enfantId, anneeScolaire },
    });
    if (!existing) {
      await prisma.inscription.create({
        data: {
          enfantId: insc.enfantId,
          parentId: insc.parentId,
          dateInscription: new Date('2025-09-01'),
          statut: insc.statut,
          anneeScolaire,
        },
      });
    }
  }
  console.log('✅ Inscriptions créées');

  // ============================================
  // 9. PERSONNES AUTORISÉES
  // ============================================
  console.log('👥 Création des personnes autorisées...');

  const personnesAutorisees = [
    { enfantId: enfant.id, nom: 'Dupont', prenom: 'Jean', telephone: '0611223344', lienParente: 'Grand-père' },
    { enfantId: enfant.id, nom: 'Moreau', prenom: 'Catherine', telephone: '0622334455', lienParente: 'Tante' },
    { enfantId: enfantMartin1.id, nom: 'Martin', prenom: 'Pierre', telephone: '0633445566', lienParente: 'Grand-père' },
    { enfantId: enfantBernard.id, nom: 'Dubois', prenom: 'Marie', telephone: '0644556677', lienParente: 'Nounou' },
  ];

  for (const pa of personnesAutorisees) {
    const existing = await prisma.personneAutorisee.findFirst({
      where: { enfantId: pa.enfantId, nom: pa.nom, prenom: pa.prenom },
    });
    if (!existing) {
      await prisma.personneAutorisee.create({ data: pa });
    }
  }
  console.log('✅ Personnes autorisées créées');

  // ============================================
  // 10. FACTURES DE DÉMO
  // ============================================
  console.log('🧾 Création des factures de démo...');

  // --- Factures de Lucas Dupont (parent@test.fr) ---

  // Janvier 2026 — Payée
  const facture1 = await prisma.facture.upsert({
    where: { numero: 'FA-2026-001' },
    update: {},
    create: {
      numero: 'FA-2026-001',
      parentId: parent.id,
      enfantId: enfant.id,
      montantTotal: 639.35,
      montantPaye: 639.35,
      dateEmission: new Date('2026-01-05'),
      dateEcheance: new Date('2026-01-31'),
      periode: '2026-01',
      statut: StatutFacture.PAYEE,
      type: TypeFacture.MENSUELLE,
      modePaiement: ModePaiement.VIREMENT,
      anneeScolaire,
    },
  });

  // Lignes facture 1
  const lignesF1 = [
    { factureId: facture1.id, description: 'Scolarité mensuelle - Maternelle', quantite: 1, prixUnit: 575.0, montant: 575.0, type: TypeLigne.SCOLARITE },
    { factureId: facture1.id, description: 'Repas midi', quantite: 10, prixUnit: 5.45, montant: 54.50, type: TypeLigne.REPAS },
    { factureId: facture1.id, description: 'Frais matériel pédagogique - Maternelle', quantite: 1, prixUnit: 9.85, montant: 9.85, type: TypeLigne.MATERIEL },
  ];
  for (const ligne of lignesF1) {
    const existing = await prisma.ligneFacture.findFirst({
      where: { factureId: ligne.factureId, description: ligne.description },
    });
    if (!existing) {
      await prisma.ligneFacture.create({ data: ligne });
    }
  }

  // Paiement facture 1
  const existingP1 = await prisma.paiement.findFirst({ where: { factureId: facture1.id } });
  if (!existingP1) {
    await prisma.paiement.create({
      data: {
        factureId: facture1.id,
        montant: 639.35,
        datePaiement: new Date('2026-01-15'),
        modePaiement: ModePaiement.VIREMENT,
        reference: 'VIR-DUPONT-202601',
      },
    });
  }

  // Février 2026 — Envoyée (en attente de paiement)
  const facture2 = await prisma.facture.upsert({
    where: { numero: 'FA-2026-002' },
    update: {},
    create: {
      numero: 'FA-2026-002',
      parentId: parent.id,
      enfantId: enfant.id,
      montantTotal: 693.15,
      montantPaye: 0,
      dateEmission: new Date('2026-02-03'),
      dateEcheance: new Date('2026-02-28'),
      periode: '2026-02',
      statut: StatutFacture.ENVOYEE,
      type: TypeFacture.MENSUELLE,
      modePaiement: ModePaiement.VIREMENT,
      anneeScolaire,
    },
  });

  const lignesF2 = [
    { factureId: facture2.id, description: 'Scolarité mensuelle - Maternelle', quantite: 1, prixUnit: 575.0, montant: 575.0, type: TypeLigne.SCOLARITE },
    { factureId: facture2.id, description: 'Repas midi', quantite: 18, prixUnit: 5.45, montant: 98.10, type: TypeLigne.REPAS },
    { factureId: facture2.id, description: 'Périscolaire', quantite: 4, prixUnit: 5.0125, montant: 20.05, type: TypeLigne.PERISCOLAIRE },
  ];
  for (const ligne of lignesF2) {
    const existing = await prisma.ligneFacture.findFirst({
      where: { factureId: ligne.factureId, description: ligne.description },
    });
    if (!existing) {
      await prisma.ligneFacture.create({ data: ligne });
    }
  }

  // --- Factures de la famille Martin (fratrie, 2 enfants) ---

  // Emma Martin — Janvier 2026, payée
  const facture3 = await prisma.facture.upsert({
    where: { numero: 'FA-2026-003' },
    update: {},
    create: {
      numero: 'FA-2026-003',
      parentId: parentMartin.id,
      enfantId: enfantMartin1.id,
      montantTotal: 594.50,
      montantPaye: 594.50,
      dateEmission: new Date('2026-01-05'),
      dateEcheance: new Date('2026-01-31'),
      periode: '2026-01',
      statut: StatutFacture.PAYEE,
      type: TypeFacture.MENSUELLE,
      modePaiement: ModePaiement.PRELEVEMENT,
      anneeScolaire,
    },
  });

  const lignesF3 = [
    { factureId: facture3.id, description: 'Scolarité mensuelle fratrie - Maternelle', quantite: 1, prixUnit: 540.0, montant: 540.0, type: TypeLigne.SCOLARITE },
    { factureId: facture3.id, description: 'Repas midi', quantite: 10, prixUnit: 5.45, montant: 54.50, type: TypeLigne.REPAS },
  ];
  for (const ligne of lignesF3) {
    const existing = await prisma.ligneFacture.findFirst({
      where: { factureId: ligne.factureId, description: ligne.description },
    });
    if (!existing) {
      await prisma.ligneFacture.create({ data: ligne });
    }
  }

  const existingP3 = await prisma.paiement.findFirst({ where: { factureId: facture3.id } });
  if (!existingP3) {
    await prisma.paiement.create({
      data: {
        factureId: facture3.id,
        montant: 594.50,
        datePaiement: new Date('2026-01-10'),
        modePaiement: ModePaiement.PRELEVEMENT,
        reference: 'PRLV-MARTIN-202601-E',
      },
    });
  }

  // Noah Martin — Janvier 2026, payée
  const facture4 = await prisma.facture.upsert({
    where: { numero: 'FA-2026-004' },
    update: {},
    create: {
      numero: 'FA-2026-004',
      parentId: parentMartin.id,
      enfantId: enfantMartin2.id,
      montantTotal: 621.50,
      montantPaye: 621.50,
      dateEmission: new Date('2026-01-05'),
      dateEcheance: new Date('2026-01-31'),
      periode: '2026-01',
      statut: StatutFacture.PAYEE,
      type: TypeFacture.MENSUELLE,
      modePaiement: ModePaiement.PRELEVEMENT,
      anneeScolaire,
    },
  });

  const lignesF4 = [
    { factureId: facture4.id, description: 'Scolarité mensuelle fratrie - Élémentaire', quantite: 1, prixUnit: 540.0, montant: 540.0, type: TypeLigne.SCOLARITE },
    { factureId: facture4.id, description: 'Repas midi', quantite: 15, prixUnit: 5.45, montant: 81.75, type: TypeLigne.REPAS },
    { factureId: facture4.id, description: 'Réduction fratrie', quantite: 1, prixUnit: -0.25, montant: -0.25, type: TypeLigne.REDUCTION },
  ];
  for (const ligne of lignesF4) {
    const existing = await prisma.ligneFacture.findFirst({
      where: { factureId: ligne.factureId, description: ligne.description },
    });
    if (!existing) {
      await prisma.ligneFacture.create({ data: ligne });
    }
  }

  const existingP4 = await prisma.paiement.findFirst({ where: { factureId: facture4.id } });
  if (!existingP4) {
    await prisma.paiement.create({
      data: {
        factureId: facture4.id,
        montant: 621.50,
        datePaiement: new Date('2026-01-10'),
        modePaiement: ModePaiement.PRELEVEMENT,
        reference: 'PRLV-MARTIN-202601-N',
      },
    });
  }

  // Emma Martin — Février 2026, paiement partiel
  const facture5 = await prisma.facture.upsert({
    where: { numero: 'FA-2026-005' },
    update: {},
    create: {
      numero: 'FA-2026-005',
      parentId: parentMartin.id,
      enfantId: enfantMartin1.id,
      montantTotal: 605.90,
      montantPaye: 540.0,
      dateEmission: new Date('2026-02-03'),
      dateEcheance: new Date('2026-02-28'),
      periode: '2026-02',
      statut: StatutFacture.PARTIELLE,
      type: TypeFacture.MENSUELLE,
      modePaiement: ModePaiement.PRELEVEMENT,
      anneeScolaire,
    },
  });

  const lignesF5 = [
    { factureId: facture5.id, description: 'Scolarité mensuelle fratrie - Maternelle', quantite: 1, prixUnit: 540.0, montant: 540.0, type: TypeLigne.SCOLARITE },
    { factureId: facture5.id, description: 'Repas midi', quantite: 12, prixUnit: 5.45, montant: 65.40, type: TypeLigne.REPAS },
    { factureId: facture5.id, description: 'Sortie scolaire - Musée', quantite: 1, prixUnit: 0.50, montant: 0.50, type: TypeLigne.PERSONNALISE },
  ];
  for (const ligne of lignesF5) {
    const existing = await prisma.ligneFacture.findFirst({
      where: { factureId: ligne.factureId, description: ligne.description },
    });
    if (!existing) {
      await prisma.ligneFacture.create({ data: ligne });
    }
  }

  const existingP5 = await prisma.paiement.findFirst({ where: { factureId: facture5.id } });
  if (!existingP5) {
    await prisma.paiement.create({
      data: {
        factureId: facture5.id,
        montant: 540.0,
        datePaiement: new Date('2026-02-10'),
        modePaiement: ModePaiement.PRELEVEMENT,
        reference: 'PRLV-MARTIN-202602-E',
        commentaire: 'Prélèvement scolarité uniquement, reste repas à régler',
      },
    });
  }

  // --- Facture Léa Bernard — Trimestrielle, en attente ---
  const facture6 = await prisma.facture.upsert({
    where: { numero: 'FA-2026-006' },
    update: {},
    create: {
      numero: 'FA-2026-006',
      parentId: parentBernard1.id,
      enfantId: enfantBernard.id,
      montantTotal: 1893.75,
      montantPaye: 0,
      dateEmission: new Date('2026-01-05'),
      dateEcheance: new Date('2026-03-31'),
      periode: '2026-T1',
      statut: StatutFacture.ENVOYEE,
      type: TypeFacture.MENSUELLE,
      modePaiement: ModePaiement.VIREMENT,
      anneeScolaire,
      commentaire: 'Paiement trimestriel — T1 2026',
    },
  });

  const lignesF6 = [
    { factureId: facture6.id, description: 'Scolarité trimestrielle - Élémentaire', quantite: 1, prixUnit: 1725.0, montant: 1725.0, type: TypeLigne.SCOLARITE },
    { factureId: facture6.id, description: 'Frais matériel pédagogique - Élémentaire', quantite: 1, prixUnit: 85.0, montant: 85.0, type: TypeLigne.MATERIEL },
    { factureId: facture6.id, description: 'Repas midi (estimation T1)', quantite: 15, prixUnit: 5.45, montant: 81.75, type: TypeLigne.REPAS },
    { factureId: facture6.id, description: 'Frais inscription années suivantes', quantite: 1, prixUnit: 2.0, montant: 2.0, type: TypeLigne.INSCRIPTION },
  ];
  for (const ligne of lignesF6) {
    const existing = await prisma.ligneFacture.findFirst({
      where: { factureId: ligne.factureId, description: ligne.description },
    });
    if (!existing) {
      await prisma.ligneFacture.create({ data: ligne });
    }
  }

  // --- Facture Jade Petit — Frais d'inscription première année ---
  const facture7 = await prisma.facture.upsert({
    where: { numero: 'FA-2026-007' },
    update: {},
    create: {
      numero: 'FA-2026-007',
      parentId: parentPetit.id,
      enfantId: enfantPetit.id,
      montantTotal: 415.0,
      montantPaye: 0,
      dateEmission: new Date('2026-02-15'),
      dateEcheance: new Date('2026-03-15'),
      periode: '2026-02',
      statut: StatutFacture.EN_ATTENTE,
      type: TypeFacture.PONCTUELLE,
      anneeScolaire,
      commentaire: 'Frais inscription + matériel première année',
    },
  });

  const lignesF7 = [
    { factureId: facture7.id, description: "Frais d'inscription 1ère année", quantite: 1, prixUnit: 350.0, montant: 350.0, type: TypeLigne.INSCRIPTION },
    { factureId: facture7.id, description: 'Frais matériel pédagogique - Maternelle', quantite: 1, prixUnit: 65.0, montant: 65.0, type: TypeLigne.MATERIEL },
  ];
  for (const ligne of lignesF7) {
    const existing = await prisma.ligneFacture.findFirst({
      where: { factureId: ligne.factureId, description: ligne.description },
    });
    if (!existing) {
      await prisma.ligneFacture.create({ data: ligne });
    }
  }

  console.log('✅ 7 factures de démo créées avec lignes et paiements');

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

