import { PrismaClient, Role, Classe, StatutPreinscription } from '@prisma/client';
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

