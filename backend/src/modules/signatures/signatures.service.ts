import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SignaturesService {
  constructor(private prisma: PrismaService) { }

  /**
   * Obtenir le statut de signature pour un enfant OU une préinscription.
   * Accepte enfantId ou preinscriptionId.
   */
  async getSignatureStatus(idOrPreinscriptionId: number, parentEmail: string) {
    let enfantId: number | null = null;

    // Essayer de trouver l'enfant par ID direct
    const enfant = await this.prisma.enfant.findUnique({
      where: { id: idOrPreinscriptionId },
    });

    if (enfant) {
      enfantId = enfant.id;
    } else {
      // Sinon, chercher via la préinscription
      const preinscription = await this.prisma.preinscription.findUnique({
        where: { id: idOrPreinscriptionId },
        include: { enfants: true },
      });

      if (preinscription) {
        // Vérifier que le parent a accès
        if (preinscription.emailParent !== parentEmail && preinscription.emailParent2 !== parentEmail) {
          throw new ForbiddenException('Accès refusé');
        }

        // Trouver l'enfant lié
        const enfantLie = preinscription.enfants?.[0];
        if (enfantLie) {
          enfantId = enfantLie.id;
        } else {
          // Pas d'enfant encore créé
          return { signed: false, reglement_accepte: false };
        }
      } else {
        // Ni enfant ni préinscription trouvés
        return { signed: false, reglement_accepte: false };
      }
    }

    // Chercher la signature
    const signature = await this.prisma.signatureReglement.findFirst({
      where: { enfantId },
      include: {
        parent: { select: { id: true, name: true, email: true } },
      },
    });

    if (!signature) {
      return { signed: false, reglement_accepte: false };
    }

    return {
      signed: signature.parentAccepte,
      reglement_accepte: signature.parentAccepte,
      date_acceptation: signature.parentDateSignature,
      parent_signed: signature.parent ? {
        id: signature.parent.id,
        name: signature.parent.name,
        email: signature.parent.email,
      } : null,
    };
  }

  /**
   * Signer le règlement.
   * Accepte enfantId ou preinscriptionId.
   */
  async signerReglement(
    data: { enfantId?: number; preinscriptionId?: number },
    parentId: number,
    parentEmail: string,
    ipAdresse: string,
  ) {
    let enfantId = data.enfantId;
    let enfant: any = null;

    // Si enfantId n'est pas fourni, créer/trouver l'enfant depuis la préinscription
    if (!enfantId && data.preinscriptionId) {
      const preinscription = await this.prisma.preinscription.findUnique({
        where: { id: data.preinscriptionId },
        include: { enfants: true },
      });

      if (!preinscription) {
        throw new NotFoundException('Préinscription non trouvée');
      }

      // Vérifier que le parent a accès
      if (preinscription.emailParent !== parentEmail && preinscription.emailParent2 !== parentEmail) {
        throw new ForbiddenException('Accès refusé');
      }

      // Trouver ou créer l'enfant
      if (preinscription.enfants?.length > 0) {
        enfant = preinscription.enfants[0];
        enfantId = enfant.id;
      } else {
        // Créer l'enfant depuis la préinscription
        enfant = await this.prisma.enfant.create({
          data: {
            nom: preinscription.nomEnfant,
            prenom: preinscription.prenomEnfant,
            dateNaissance: preinscription.dateNaissance,
            lieuNaissance: preinscription.lieuNaissance,
            classe: preinscription.classeSouhaitee,
            parent1Id: parentId,
            preinscriptionId: preinscription.id,
          },
        });
        enfantId = enfant.id;
      }
    } else if (enfantId) {
      enfant = await this.prisma.enfant.findUnique({
        where: { id: enfantId },
      });

      if (!enfant) {
        throw new NotFoundException('Enfant non trouvé');
      }

      // Vérifier que le parent a accès à cet enfant
      if (enfant.parent1Id !== parentId && enfant.parent2Id !== parentId) {
        throw new ForbiddenException('Accès refusé');
      }
    } else {
      throw new BadRequestException('enfant_id ou preinscription_id requis');
    }

    // Récupérer les infos du parent
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
    });

    // Vérifier si une signature existe déjà
    const existingSignature = await this.prisma.signatureReglement.findFirst({
      where: { enfantId },
    });

    if (existingSignature?.parentAccepte) {
      return {
        message: 'Le règlement a déjà été signé',
        signature: existingSignature,
      };
    }

    // Créer ou mettre à jour la signature
    let signature;
    if (existingSignature) {
      signature = await this.prisma.signatureReglement.update({
        where: { id: existingSignature.id },
        data: {
          parentAccepte: true,
          parentDateSignature: new Date(),
          parentIpAdresse: ipAdresse,
        },
      });
    } else {
      signature = await this.prisma.signatureReglement.create({
        data: {
          enfantId: enfantId!,
          parentId,
          parentName: parent?.name || '',
          parentEmail: parent?.email || '',
          enfantName: `${enfant.prenom} ${enfant.nom}`,
          parentAccepte: true,
          parentDateSignature: new Date(),
          parentIpAdresse: ipAdresse,
        },
      });
    }

    return {
      message: 'Signature parent enregistrée',
      signature,
    };
  }

  async getSignaturesNonSignees() {
    // Tous les enfants sans signature parent
    const enfantsSansSignature = await this.prisma.enfant.findMany({
      where: {
        classe: { not: null },
        OR: [
          { signatureReglements: null },
          { signatureReglements: { parentAccepte: false } }
        ],
      },
      include: {
        parent1: { select: { id: true, name: true, email: true } },
      },
    });

    return enfantsSansSignature;
  }

  async getAllSignatures() {
    return this.prisma.signatureReglement.findMany({
      include: {
        enfant: { select: { id: true, nom: true, prenom: true, classe: true } },
        parent: { select: { id: true, name: true, email: true } },
      },
      orderBy: { parentDateSignature: 'desc' },
    });
  }
}
