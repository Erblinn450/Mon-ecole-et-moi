import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Génère un export CSV complet de la base de données
   */
  async exportAllDataCSV(): Promise<{
    eleves: string;
    preinscriptions: string;
    parents: string;
    factures: string;
  }> {
    const eleves = await this.exportElevesCSV();
    const preinscriptions = await this.exportPreinscriptionsCSV();
    const parents = await this.exportParentsCSV();
    const factures = await this.exportFacturesCSV();

    return { eleves, preinscriptions, parents, factures };
  }

  /**
   * Export des élèves avec infos parents
   */
  async exportElevesCSV(): Promise<string> {
    const enfants = await this.prisma.enfant.findMany({
      where: { deletedAt: null },
      include: {
        parent1: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
        parent2: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
        inscriptions: {
          orderBy: { dateInscription: 'desc' },
          take: 1,
        },
        signatureReglements: true,
      },
      orderBy: [{ classe: 'asc' }, { nom: 'asc' }],
    });

    const headers = [
      'ID',
      'Nom',
      'Prénom',
      'Date Naissance',
      'Lieu Naissance',
      'Classe',
      'Parent 1 - Nom',
      'Parent 1 - Prénom',
      'Parent 1 - Email',
      'Parent 1 - Téléphone',
      'Parent 2 - Nom',
      'Parent 2 - Prénom',
      'Parent 2 - Email',
      'Parent 2 - Téléphone',
      'Règlement Signé',
      'Date Inscription',
    ].join(';');

    const rows = enfants.map((e) => {
      const inscription = e.inscriptions[0];
      return [
        e.id,
        this.escapeCSV(e.nom),
        this.escapeCSV(e.prenom),
        e.dateNaissance ? new Date(e.dateNaissance).toLocaleDateString('fr-FR') : '',
        this.escapeCSV(e.lieuNaissance || ''),
        e.classe || '',
        this.escapeCSV(e.parent1?.nom || ''),
        this.escapeCSV(e.parent1?.prenom || ''),
        e.parent1?.email || '',
        e.parent1?.telephone || '',
        this.escapeCSV(e.parent2?.nom || ''),
        this.escapeCSV(e.parent2?.prenom || ''),
        e.parent2?.email || '',
        e.parent2?.telephone || '',
        e.signatureReglements?.parentAccepte ? 'Oui' : 'Non',
        inscription ? new Date(inscription.dateInscription).toLocaleDateString('fr-FR') : '',
      ].join(';');
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * Export des préinscriptions
   */
  async exportPreinscriptionsCSV(): Promise<string> {
    const preinscriptions = await this.prisma.preinscription.findMany({
      orderBy: { dateDemande: 'desc' },
    });

    const headers = [
      'Numéro Dossier',
      'Statut',
      'Date Demande',
      'Nom Enfant',
      'Prénom Enfant',
      'Date Naissance',
      'Classe Souhaitée',
      'Nom Parent',
      'Prénom Parent',
      'Email Parent',
      'Téléphone Parent',
      'Adresse',
      'Situation Familiale',
      'Email Vérifié',
      'Compte Créé',
    ].join(';');

    const rows = preinscriptions.map((p) => [
      p.numeroDossier,
      p.statut,
      new Date(p.dateDemande).toLocaleDateString('fr-FR'),
      this.escapeCSV(p.nomEnfant),
      this.escapeCSV(p.prenomEnfant),
      new Date(p.dateNaissance).toLocaleDateString('fr-FR'),
      p.classeSouhaitee,
      this.escapeCSV(p.nomParent),
      this.escapeCSV(p.prenomParent),
      p.emailParent,
      p.telephoneParent,
      this.escapeCSV(p.adresseParent || ''),
      p.situationFamiliale || '',
      p.emailVerifie ? 'Oui' : 'Non',
      p.compteCree ? 'Oui' : 'Non',
    ].join(';'));

    return [headers, ...rows].join('\n');
  }

  /**
   * Export des parents (utilisateurs)
   */
  async exportParentsCSV(): Promise<string> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        adresse: true,
        role: true,
        actif: true,
        createdAt: true,
        enfantsParent1: { where: { deletedAt: null } },
        enfantsParent2: { where: { deletedAt: null } },
      },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    });

    const headers = [
      'ID',
      'Email',
      'Nom',
      'Prénom',
      'Téléphone',
      'Adresse',
      'Rôle',
      'Actif',
      'Nombre Enfants',
      'Date Création',
    ].join(';');

    const rows = users.map((u) => {
      const nbEnfants = u.enfantsParent1.length + u.enfantsParent2.length;
      return [
        u.id,
        u.email,
        this.escapeCSV(u.nom || ''),
        this.escapeCSV(u.prenom || ''),
        u.telephone || '',
        this.escapeCSV(u.adresse || ''),
        u.role,
        u.actif ? 'Oui' : 'Non',
        nbEnfants,
        new Date(u.createdAt).toLocaleDateString('fr-FR'),
      ].join(';');
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * Export des factures
   */
  async exportFacturesCSV(): Promise<string> {
    const factures = await this.prisma.facture.findMany({
      include: {
        parent: { select: { id: true, nom: true, prenom: true, email: true } },
        lignes: true,
      },
      orderBy: { dateEmission: 'desc' },
    });

    const headers = [
      'Numéro',
      'Type',
      'Statut',
      'Date Émission',
      'Date Échéance',
      'Période',
      'Parent - Nom',
      'Parent - Email',
      'Montant Total',
      'Montant Payé',
      'Description',
    ].join(';');

    const rows = factures.map((f) => [
      f.numero,
      f.type,
      f.statut,
      new Date(f.dateEmission).toLocaleDateString('fr-FR'),
      new Date(f.dateEcheance).toLocaleDateString('fr-FR'),
      f.periode || '',
      this.escapeCSV(f.parent?.nom || ''),
      f.parent?.email || '',
      Number(f.montantTotal).toFixed(2) + ' €',
      Number(f.montantPaye).toFixed(2) + ' €',
      this.escapeCSV(f.description || ''),
    ].join(';'));

    return [headers, ...rows].join('\n');
  }

  /**
   * Escape les caractères spéciaux pour CSV
   */
  private escapeCSV(value: string): string {
    if (!value) return '';
    // Si contient ; ou " ou saut de ligne, entourer de guillemets
    if (value.includes(';') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
