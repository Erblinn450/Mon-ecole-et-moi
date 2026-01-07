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
      nom: 'Règlement intérieur signé',
      description: "Règlement intérieur de l'école lu et signé par les parents",
      obligatoire: true,
    },
  ];

  for (const type of justificatifsTypes) {
    await prisma.justificatifAttendu.upsert({
      where: { id: justificatifsTypes.indexOf(type) + 1 },
      update: type,
      create: type,
    });
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
  const parentPassword = await bcrypt.hash('parent123', 10);
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

