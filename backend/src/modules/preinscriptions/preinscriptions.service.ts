import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreatePreinscriptionDto } from './dto/create-preinscription.dto';
import { UpdatePreinscriptionDto } from './dto/update-preinscription.dto';
import { StatutPreinscription, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PreinscriptionsService {
  private readonly logger = new Logger(PreinscriptionsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) { }

  async create(createDto: CreatePreinscriptionDto) {
    const numeroDossier = this.generateNumeroDossier();

    // Générer un token de vérification unique (valide 24h)
    const requireEmailVerification = this.configService.get('REQUIRE_EMAIL_VERIFICATION', 'false') === 'true';
    const verificationToken = requireEmailVerification ? this.generateVerificationToken() : null;
    const tokenExpiresAt = requireEmailVerification ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null; // 24h

    const preinscription = await this.prisma.preinscription.create({
      data: {
        numeroDossier,
        nomEnfant: createDto.nomEnfant,
        prenomEnfant: createDto.prenomEnfant,
        dateNaissance: new Date(createDto.dateNaissance),
        lieuNaissance: createDto.lieuNaissance,
        nationalite: createDto.nationalite,
        allergies: createDto.allergies,
        classeSouhaitee: createDto.classeSouhaitee,
        etablissementPrecedent: createDto.etablissementPrecedent,
        classeActuelle: createDto.classeActuelle,
        civiliteParent: createDto.civiliteParent,
        nomParent: createDto.nomParent,
        prenomParent: createDto.prenomParent,
        emailParent: createDto.emailParent,
        telephoneParent: createDto.telephoneParent,
        lienParente: createDto.lienParente,
        adresseParent: createDto.adresseParent,
        professionParent: createDto.professionParent,
        civiliteParent2: createDto.civiliteParent2,
        nomParent2: createDto.nomParent2,
        prenomParent2: createDto.prenomParent2,
        emailParent2: createDto.emailParent2,
        telephoneParent2: createDto.telephoneParent2,
        lienParente2: createDto.lienParente2,
        adresseParent2: createDto.adresseParent2,
        professionParent2: createDto.professionParent2,
        dateIntegration: createDto.dateIntegration ? new Date(createDto.dateIntegration) : null,
        situationFamiliale: createDto.situationFamiliale,
        situationAutre: createDto.situationAutre,
        decouverte: createDto.decouverte,
        pedagogieMontessori: createDto.pedagogieMontessori,
        difficultes: createDto.difficultes,
        // Vérification email
        emailVerifie: !requireEmailVerification, // true si vérification désactivée
        tokenVerification: verificationToken,
        tokenExpiresAt,
      },
    });

    // Envoyer l'email approprié
    try {
      if (requireEmailVerification) {
        // Envoyer email de vérification
        await this.emailService.sendEmailVerification({
          numeroDossier: preinscription.numeroDossier,
          nomEnfant: preinscription.nomEnfant,
          prenomEnfant: preinscription.prenomEnfant,
          civiliteParent: preinscription.civiliteParent,
          nomParent: preinscription.nomParent,
          emailParent: preinscription.emailParent,
          verificationToken: verificationToken!,
        });
        this.logger.log(`Email de vérification envoyé pour ${numeroDossier}`);
      } else {
        // Envoyer email de confirmation classique (mode développement)
        await this.emailService.sendPreinscriptionConfirmation({
          numeroDossier: preinscription.numeroDossier,
          nomEnfant: preinscription.nomEnfant,
          prenomEnfant: preinscription.prenomEnfant,
          dateNaissance: preinscription.dateNaissance,
          classeSouhaitee: preinscription.classeSouhaitee,
          dateIntegration: preinscription.dateIntegration,
          civiliteParent: preinscription.civiliteParent,
          nomParent: preinscription.nomParent,
          emailParent: preinscription.emailParent,
          emailParent2: preinscription.emailParent2,
        });
        this.logger.log(`Email de confirmation envoyé pour ${numeroDossier}`);
      }
    } catch (error) {
      this.logger.error(`Erreur envoi email: ${error.message}`);
    }

    return {
      ...preinscription,
      requiresEmailVerification: requireEmailVerification,
    };
  }

  /**
   * Vérifie le token de vérification email
   */
  async verifyEmail(token: string) {
    const preinscription = await this.prisma.preinscription.findUnique({
      where: { tokenVerification: token },
    });

    if (!preinscription) {
      return { success: false, message: 'Lien de vérification invalide' };
    }

    if (preinscription.emailVerifie) {
      return { success: true, message: 'Email déjà vérifié', alreadyVerified: true };
    }

    if (preinscription.tokenExpiresAt && new Date() > preinscription.tokenExpiresAt) {
      return { success: false, message: 'Lien de vérification expiré. Veuillez soumettre une nouvelle demande.' };
    }

    // Marquer l'email comme vérifié
    await this.prisma.preinscription.update({
      where: { id: preinscription.id },
      data: {
        emailVerifie: true,
        tokenVerification: null, // Invalider le token
        tokenExpiresAt: null,
      },
    });

    // Envoyer l'email de confirmation maintenant que l'email est vérifié
    try {
      await this.emailService.sendPreinscriptionConfirmation({
        numeroDossier: preinscription.numeroDossier,
        nomEnfant: preinscription.nomEnfant,
        prenomEnfant: preinscription.prenomEnfant,
        dateNaissance: preinscription.dateNaissance,
        classeSouhaitee: preinscription.classeSouhaitee,
        dateIntegration: preinscription.dateIntegration,
        civiliteParent: preinscription.civiliteParent,
        nomParent: preinscription.nomParent,
        emailParent: preinscription.emailParent,
        emailParent2: preinscription.emailParent2,
      });
    } catch (error) {
      this.logger.error(`Erreur envoi email confirmation: ${error.message}`);
    }

    return {
      success: true,
      message: 'Email vérifié avec succès',
      numeroDossier: preinscription.numeroDossier,
    };
  }

  /**
   * Génère un token de vérification unique
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async findAll(statut?: StatutPreinscription) {
    const where = statut ? { statut } : {};

    return this.prisma.preinscription.findMany({
      where,
      include: {
        enfants: {
          include: {
            justificatifs: true,
            signatureReglements: true,
          },
        },
      },
      orderBy: [
        { statut: 'asc' },
        { dateDemande: 'desc' },
      ],
    });
  }

  async findOne(id: number) {
    const preinscription = await this.prisma.preinscription.findUnique({
      where: { id },
      include: {
        enfants: true,
      },
    });

    if (!preinscription) {
      throw new NotFoundException('Préinscription non trouvée');
    }

    // Ajouter l'enfantId s'il existe
    const enfant = preinscription.enfants?.[0];
    return {
      ...preinscription,
      enfantId: enfant?.id || null,
    };
  }

  async findByNumeroDossier(numeroDossier: string) {
    const preinscription = await this.prisma.preinscription.findUnique({
      where: { numeroDossier },
    });

    if (!preinscription) {
      throw new NotFoundException('Préinscription non trouvée');
    }

    return preinscription;
  }

  /**
   * Récupère les dossiers de préinscription d'un parent par son email
   * Inclut l'enfant associé si la préinscription est validée
   */
  async findByParentEmailWithEnfants(email: string) {
    // Récupérer les préinscriptions du parent
    const preinscriptions = await this.prisma.preinscription.findMany({
      where: {
        OR: [
          { emailParent: email },
          { emailParent2: email },
        ],
      },
      include: {
        enfants: true, // Inclure les enfants liés
      },
      orderBy: { dateDemande: 'desc' },
    });

    // Formater la réponse pour inclure l'enfant associé
    return preinscriptions.map(p => {
      const enfant = p.enfants?.[0] || null;
      return {
        id: p.id,
        numeroDossier: p.numeroDossier,
        nomEnfant: p.nomEnfant,
        prenomEnfant: p.prenomEnfant,
        dateNaissance: p.dateNaissance,
        classeSouhaitee: p.classeSouhaitee,
        classeActuelle: p.classeActuelle,
        statut: p.statut,
        dateDemande: p.dateDemande,
        compteCree: p.compteCree,
        // Enfant associé (créé lors de la validation)
        enfantId: enfant?.id || null,
        enfant: enfant ? {
          id: enfant.id,
          nom: enfant.nom,
          prenom: enfant.prenom,
          classe: enfant.classe,
        } : null,
      };
    });
  }

  async update(id: number, updateDto: UpdatePreinscriptionDto) {
    await this.findOne(id); // Vérifie que la préinscription existe

    return this.prisma.preinscription.update({
      where: { id },
      data: {
        ...updateDto,
        dateNaissance: updateDto.dateNaissance ? new Date(updateDto.dateNaissance) : undefined,
        dateIntegration: updateDto.dateIntegration ? new Date(updateDto.dateIntegration) : undefined,
      },
    });
  }

  async updateStatut(id: number, statut: StatutPreinscription, commentaire?: string) {
    const preinscription = await this.findOne(id);

    // Si validation, créer le compte parent et l'enfant
    let motDePasseGenere: string | null = null;
    let parentCree = false;

    if (statut === StatutPreinscription.VALIDE && !preinscription.compteCree) {
      const { parent, enfant, password } = await this.creerCompteParentEtEnfant(preinscription);
      motDePasseGenere = password;
      parentCree = true;
      this.logger.log(`Compte parent créé: ${parent.email}, enfant: ${enfant.prenom} ${enfant.nom}`);
    }

    const updated = await this.prisma.preinscription.update({
      where: { id },
      data: {
        statut,
        commentaireRefus: statut === StatutPreinscription.REFUSE ? commentaire : undefined,
        compteCree: parentCree ? true : preinscription.compteCree,
      },
    });

    // Envoyer les emails selon le nouveau statut
    const emailData = {
      numeroDossier: preinscription.numeroDossier,
      nomEnfant: preinscription.nomEnfant,
      prenomEnfant: preinscription.prenomEnfant,
      dateNaissance: preinscription.dateNaissance,
      classeSouhaitee: preinscription.classeSouhaitee,
      civiliteParent: preinscription.civiliteParent,
      nomParent: preinscription.nomParent,
      emailParent: preinscription.emailParent,
      emailParent2: preinscription.emailParent2,
    };

    try {
      if (statut === StatutPreinscription.VALIDE) {
        // Email de validation avec les identifiants si nouveau compte
        await this.emailService.sendPreinscriptionValidated({
          ...emailData,
          dateIntegration: preinscription.dateIntegration,
          motDePasse: motDePasseGenere, // Ajouter le mot de passe pour l'email
        } as any);
        this.logger.log(`Email de validation envoyé pour ${preinscription.numeroDossier}`);
      } else if (statut === StatutPreinscription.REFUSE) {
        await this.emailService.sendPreinscriptionRefused(emailData);
        this.logger.log(`Email de refus envoyé pour ${preinscription.numeroDossier}`);
      } else if (statut === StatutPreinscription.ANNULE) {
        await this.emailService.sendPreinscriptionCancelled(emailData);
        this.logger.log(`Email d'annulation envoyé pour ${preinscription.numeroDossier}`);
      }
    } catch (error) {
      this.logger.error(`Erreur envoi email statut: ${error.message}`);
    }

    return updated;
  }

  /**
   * Créer un compte parent et l'enfant associé lors de la validation
   * En production: mot de passe aléatoire sécurisé
   * En développement: mot de passe fixe 'parent1234' pour faciliter les tests
   */
  private async creerCompteParentEtEnfant(preinscription: any) {
    // Utiliser un mot de passe aléatoire en production
    const useRandomPassword = this.configService.get('USE_RANDOM_PASSWORD', 'false') === 'true'
      || this.configService.get('NODE_ENV') === 'production';

    const motDePasse = useRandomPassword
      ? this.generateSecurePassword(12)
      : 'parent1234'; // Mot de passe par défaut pour le développement

    if (useRandomPassword) {
      this.logger.log(`Mot de passe sécurisé généré pour ${preinscription.emailParent}`);
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Vérifier si le parent existe déjà
    let parent = await this.prisma.user.findUnique({
      where: { email: preinscription.emailParent },
    });

    if (!parent) {
      // Créer le compte parent
      parent = await this.prisma.user.create({
        data: {
          email: preinscription.emailParent,
          password: hashedPassword,
          name: `${preinscription.prenomParent || ''} ${preinscription.nomParent}`.trim(),
          nom: preinscription.nomParent,
          prenom: preinscription.prenomParent,
          telephone: preinscription.telephoneParent,
          adresse: preinscription.adresseParent,
          role: Role.PARENT,
          actif: true,
          premiereConnexion: true,
        },
      });
    }

    // Vérifier si l'enfant existe déjà pour cette préinscription
    let enfant = await this.prisma.enfant.findFirst({
      where: { preinscriptionId: preinscription.id },
    });

    if (!enfant) {
      // Créer l'enfant lié au parent ET à la préinscription
      enfant = await this.prisma.enfant.create({
        data: {
          nom: preinscription.nomEnfant,
          prenom: preinscription.prenomEnfant,
          dateNaissance: preinscription.dateNaissance,
          lieuNaissance: preinscription.lieuNaissance,
          classe: preinscription.classeSouhaitee,
          parent1Id: parent.id,
          preinscriptionId: preinscription.id, // Lier à la préinscription
        },
      });
    }

    return { parent, enfant, password: motDePasse };
  }

  /**
   * Générer un mot de passe sécurisé avec crypto
   * - Au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
   * - Utilise crypto.randomBytes pour une vraie aléatoirité
   */
  private generateSecurePassword(length = 12): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '@#$%&*!?';
    const allChars = uppercase + lowercase + numbers + special;

    // Garantir au moins un caractère de chaque type
    let password = '';
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    // Compléter avec des caractères aléatoires
    for (let i = 4; i < length; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }

    // Mélanger le mot de passe pour ne pas avoir un pattern prévisible
    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.preinscription.delete({ where: { id } });
  }

  async getStats() {
    const [total, enAttente, valide, refuse] = await Promise.all([
      this.prisma.preinscription.count(),
      this.prisma.preinscription.count({ where: { statut: StatutPreinscription.EN_ATTENTE } }),
      this.prisma.preinscription.count({ where: { statut: StatutPreinscription.VALIDE } }),
      this.prisma.preinscription.count({ where: { statut: StatutPreinscription.REFUSE } }),
    ]);

    // Récupérer tous les dossiers validés pour checker leur avancement réel (optimisé)
    const dossiersValides = await this.prisma.preinscription.findMany({
      where: { statut: StatutPreinscription.VALIDE },
      select: {
        enfants: {
          select: {
            justificatifs: { select: { valide: true } },
            signatureReglements: { select: { parentAccepte: true } },
          }
        }
      }
    });

    // Compter ceux qui ne sont PAS complets
    const piecesAValider = dossiersValides.filter(p => {
      const enfant = p.enfants?.[0];
      if (!enfant) return true;

      const isSigned = enfant.signatureReglements?.parentAccepte || false;
      const hasDocs = enfant.justificatifs.some(j => j.valide === true);
      const hasPendingDocs = enfant.justificatifs.some(j => j.valide === null);

      const isComplet = isSigned && hasDocs && !hasPendingDocs;
      return !isComplet;
    }).length;

    return { total, enAttente, piecesAValider, valide, refuse };
  }

  /**
   * Génère un numéro de dossier unique
   * Format: DOSS-YYYY-XXXXXX (timestamp + random pour garantir l'unicité)
   */
  private generateNumeroDossier(): string {
    const year = new Date().getFullYear();
    // Utiliser timestamp + random pour garantir l'unicité
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const random = Math.random().toString(36).toUpperCase().slice(2, 4);
    return `DOSS-${year}-${timestamp}${random}`;
  }

  /**
   * Génère un PDF du dossier de préinscription
   */
  async generatePdf(id: number): Promise<Buffer> {
    const preinscription = await this.prisma.preinscription.findUnique({
      where: { id },
      include: {
        enfants: true,
      },
    });

    if (!preinscription) {
      throw new NotFoundException('Préinscription non trouvée');
    }

    // Import dynamique de PDFKit
    const PDFDocument = require('pdfkit');

    // Formater les dates
    const formatDate = (date: Date | string | null) => {
      if (!date) return 'Non renseigné';
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('fr-FR');
    };

    const getStatutLabel = (statut: StatutPreinscription) => {
      const labels = {
        EN_ATTENTE: 'En attente',
        DEJA_CONTACTE: 'Déjà contacté',
        VALIDE: 'Validé',
        REFUSE: 'Refusé',
        ANNULE: 'Annulé',
      };
      return labels[statut] || statut;
    };

    const getClasseLabel = (classe: string) => {
      const labels: Record<string, string> = {
        MATERNELLE: 'Maternelle (3-6 ans)',
        ELEMENTAIRE: 'Élémentaire (6-12 ans)',
        COLLEGE: 'Collège',
      };
      return labels[classe] || classe;
    };

    // Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Collecter les chunks du PDF
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // === EN-TÊTE ===
      doc.fontSize(20).fillColor('#10b981').text('DOSSIER DE PRÉ-INSCRIPTION', { align: 'center' });
      doc.fontSize(14).fillColor('#6b7280').text('Mon École Montessori et Moi', { align: 'center' });
      doc.moveDown(1);

      // Numéro de dossier et statut
      doc.fontSize(10).fillColor('#000000');
      doc.text(`Numéro de dossier: ${preinscription.numeroDossier}`, 50);
      doc.text(`Statut: ${getStatutLabel(preinscription.statut)}`, 300, doc.y - 12);
      doc.text(`Date de demande: ${formatDate(preinscription.dateDemande)}`, 50);
      doc.moveDown(1);

      // === SECTION 1: ENFANT ===
      doc.fontSize(12).fillColor('#374151').text('1. INFORMATIONS DE L\'ENFANT', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#000000');
      doc.text(`Nom: ${preinscription.nomEnfant}`);
      doc.text(`Prénom: ${preinscription.prenomEnfant}`);
      doc.text(`Date de naissance: ${formatDate(preinscription.dateNaissance)}`);
      doc.text(`Lieu de naissance: ${preinscription.lieuNaissance || 'Non renseigné'}`);
      doc.text(`Nationalité: ${preinscription.nationalite || 'Non renseigné'}`);
      doc.text(`Allergies: ${preinscription.allergies || 'Aucune'}`);
      doc.moveDown(1);

      // === SECTION 2: SCOLARITÉ ===
      doc.fontSize(12).fillColor('#374151').text('2. SCOLARITÉ', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#000000');
      doc.text(`Classe souhaitée: ${getClasseLabel(preinscription.classeSouhaitee)}`);
      doc.text(`Classe actuelle: ${preinscription.classeActuelle || 'Non renseigné'}`);
      doc.text(`Établissement précédent: ${preinscription.etablissementPrecedent || 'Non renseigné'}`);
      doc.text(`Date d'intégration souhaitée: ${formatDate(preinscription.dateIntegration)}`);
      doc.moveDown(1);

      // === SECTION 3: PARENT 1 ===
      doc.fontSize(12).fillColor('#374151').text('3. PARENT / RESPONSABLE LÉGAL 1', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#000000');
      doc.text(`Civilité: ${preinscription.civiliteParent || 'Non renseigné'}`);
      doc.text(`Nom: ${preinscription.nomParent}`);
      doc.text(`Prénom: ${preinscription.prenomParent || 'Non renseigné'}`);
      doc.text(`Email: ${preinscription.emailParent}`);
      doc.text(`Téléphone: ${preinscription.telephoneParent}`);
      doc.text(`Lien de parenté: ${preinscription.lienParente || 'Non renseigné'}`);
      doc.text(`Adresse: ${preinscription.adresseParent || 'Non renseigné'}`);
      doc.text(`Profession: ${preinscription.professionParent || 'Non renseigné'}`);
      doc.moveDown(1);

      // === SECTION 4: PARENT 2 (si renseigné) ===
      if (preinscription.nomParent2) {
        doc.fontSize(12).fillColor('#374151').text('4. PARENT / RESPONSABLE LÉGAL 2', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000000');
        doc.text(`Civilité: ${preinscription.civiliteParent2 || 'Non renseigné'}`);
        doc.text(`Nom: ${preinscription.nomParent2}`);
        doc.text(`Prénom: ${preinscription.prenomParent2 || 'Non renseigné'}`);
        doc.text(`Email: ${preinscription.emailParent2 || 'Non renseigné'}`);
        doc.text(`Téléphone: ${preinscription.telephoneParent2 || 'Non renseigné'}`);
        doc.text(`Lien de parenté: ${preinscription.lienParente2 || 'Non renseigné'}`);
        doc.text(`Adresse: ${preinscription.adresseParent2 || 'Non renseigné'}`);
        doc.text(`Profession: ${preinscription.professionParent2 || 'Non renseigné'}`);
        doc.moveDown(1);
      }

      // === SECTION 5: INFORMATIONS COMPLÉMENTAIRES ===
      const sectionNum = preinscription.nomParent2 ? '5' : '4';
      doc.fontSize(12).fillColor('#374151').text(`${sectionNum}. INFORMATIONS COMPLÉMENTAIRES`, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#000000');
      doc.text(`Situation familiale: ${preinscription.situationFamiliale || 'Non renseigné'}`);
      if (preinscription.situationAutre) {
        doc.text(`Autre situation: ${preinscription.situationAutre}`);
      }
      doc.text(`Comment avez-vous découvert l'école?: ${preinscription.decouverte || 'Non renseigné'}`);
      doc.text(`Connaissance de la pédagogie Montessori: ${preinscription.pedagogieMontessori || 'Non renseigné'}`);
      doc.text(`Difficultés particulières: ${preinscription.difficultes || 'Non renseigné'}`);
      doc.moveDown(1);

      // === COMMENTAIRE (si refusé) ===
      if (preinscription.commentaireRefus) {
        doc.fontSize(12).fillColor('#374151').text('COMMENTAIRE', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000000');
        doc.text(preinscription.commentaireRefus);
        doc.moveDown(1);
      }

      // === FOOTER ===
      doc.moveDown(2);
      doc.fontSize(9).fillColor('#6b7280').text(`Document généré le ${formatDate(new Date())}`, { align: 'center' });

      // Finaliser le document
      doc.end();
    });
  }
}

