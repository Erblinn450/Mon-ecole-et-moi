import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FacturationService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implémenter la logique de facturation
  // - Génération de factures mensuelles automatiques
  // - Factures ponctuelles (activités, matériel)
  // - Génération fichier XML prélèvements SEPA
  // - Suivi des paiements
  // - Relances automatiques

  async getFacturesParent(parentId: number) {
    return this.prisma.facture.findMany({
      where: { parentId },
      include: { lignes: true },
      orderBy: { dateEmission: 'desc' },
    });
  }

  async getAllFactures(mois?: string) {
    const where: any = {};
    
    if (mois) {
      where.periode = mois;
    }

    return this.prisma.facture.findMany({
      where,
      include: { lignes: true },
      orderBy: { dateEmission: 'desc' },
    });
  }

  async genererFactureMensuelle(parentId: number, periode: string) {
    // TODO: Calculer le montant basé sur repas + périscolaire + scolarité
    // Pour l'instant, juste un placeholder
    
    const numero = this.generateNumeroFacture();
    
    return this.prisma.facture.create({
      data: {
        numero,
        parentId,
        montantTotal: 0,
        dateEmission: new Date(),
        dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        type: 'MENSUELLE',
        periode,
        description: `Facture mensuelle ${periode}`,
      },
    });
  }

  private generateNumeroFacture(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FAC-${year}${month}-${random}`;
  }
}

