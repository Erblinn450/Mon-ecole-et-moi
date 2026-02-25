import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import * as path from 'path';
import * as fs from 'fs';

/** Informations légales de l'école, affichées sur chaque facture */
const ECOLE_INFO = {
  nom: 'Mon École Montessori et Moi',
  adresse: '58 rue Damberg',
  codePostal: '68350',
  ville: 'Brunstatt-Didenheim',
  email: 'contact@montessorietmoi.com',
  site: 'www.mon-ecole-et-moi.com',
  siret: '813 743 978 00021',
  iban: 'FR76 3008 7332 2800 0204 5700 129',
  bic: 'CMCIFRPP',
};

@Injectable()
export class FacturationPdfService {
  constructor(private prisma: PrismaService) {}

  async generateFacturePdf(factureId: number): Promise<Buffer> {
    const facture = await this.prisma.facture.findUnique({
      where: { id: factureId },
      include: {
        lignes: { orderBy: { id: 'asc' } },
        paiements: { orderBy: { datePaiement: 'desc' } },
        parent: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            modePaiementPref: true,
          },
        },
        enfant: {
          select: { id: true, nom: true, prenom: true, classe: true },
        },
      },
    });

    if (!facture) {
      throw new NotFoundException(`Facture #${factureId} non trouvée`);
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- En-tête ---
      this.drawHeader(doc, facture);

      // --- Infos facture ---
      this.drawFactureInfo(doc, facture);

      // --- Destinataire ---
      this.drawDestinataire(doc, facture);

      // --- Enfant ---
      if (facture.enfant) {
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica')
          .text(`Élève : ${facture.enfant.prenom} ${facture.enfant.nom} (${facture.enfant.classe || ''})`, 50);
      }

      // --- Tableau des lignes ---
      doc.moveDown(1);
      this.drawLignesTable(doc, facture.lignes);

      // --- Totaux ---
      this.drawTotaux(doc, facture);

      // --- Paiement ---
      this.drawPaiementInfo(doc, facture);

      // --- Pied de page ---
      this.drawFooter(doc);

      doc.end();
    });
  }

  private drawHeader(doc: any, _facture: any) {
    // Logo
    const logoPath = path.resolve(__dirname, '../../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }

    // Nom école
    doc.fontSize(16).font('Helvetica-Bold')
      .text(ECOLE_INFO.nom, 120, 50);

    doc.fontSize(8).font('Helvetica')
      .text(`${ECOLE_INFO.adresse}, ${ECOLE_INFO.codePostal} ${ECOLE_INFO.ville}`, 120, 70)
      .text(`${ECOLE_INFO.email} | ${ECOLE_INFO.site}`, 120, 80)
      .text(`SIRET : ${ECOLE_INFO.siret}`, 120, 90);

    // Ligne séparatrice
    doc.moveTo(50, 110).lineTo(545, 110).stroke('#2d6a4f');
  }

  private drawFactureInfo(doc: any, facture: any) {
    const formatDate = (d: Date | null) =>
      d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    const statutLabels: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      ENVOYEE: 'Envoyée',
      PAYEE: 'Payée',
      PARTIELLE: 'Partiellement payée',
      EN_RETARD: 'Impayé',
      ANNULEE: 'Annulée',
    };

    // Bloc facture à droite
    const x = 380;
    let y = 125;
    doc.fontSize(14).font('Helvetica-Bold')
      .text('FACTURE', x, y);
    y += 20;

    doc.fontSize(9).font('Helvetica');
    doc.text(`N° : ${facture.numero}`, x, y); y += 13;
    doc.text(`Date : ${formatDate(facture.dateEmission)}`, x, y); y += 13;
    doc.text(`Échéance : ${formatDate(facture.dateEcheance)}`, x, y); y += 13;
    doc.text(`Période : ${facture.periode || '-'}`, x, y); y += 13;
    doc.text(`Statut : ${statutLabels[facture.statut] || facture.statut}`, x, y);
  }

  private drawDestinataire(doc: any, facture: any) {
    const parent = facture.parent;
    if (!parent) return;

    doc.fontSize(10).font('Helvetica-Bold')
      .text('Destinataire :', 50, 125);

    doc.fontSize(10).font('Helvetica')
      .text(`${parent.prenom || ''} ${parent.nom || ''}`.trim(), 50, 140)
      .text(parent.email || '', 50, 153)
      .text(parent.telephone || '', 50, 166);
  }

  private drawLignesTable(doc: any, lignes: any[]) {
    const startY = doc.y + 10;
    const colX = { desc: 50, qte: 340, pu: 390, montant: 470 };
    const lineHeight = 18;

    // En-tête tableau
    doc.rect(50, startY, 495, 20).fill('#2d6a4f');
    doc.fontSize(9).font('Helvetica-Bold').fill('#ffffff')
      .text('Description', colX.desc + 5, startY + 5, { width: 280 })
      .text('Qté', colX.qte, startY + 5, { width: 40, align: 'center' })
      .text('P.U. (€)', colX.pu, startY + 5, { width: 70, align: 'right' })
      .text('Montant (€)', colX.montant, startY + 5, { width: 70, align: 'right' });

    let y = startY + 25;
    doc.fill('#000000');

    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const montant = Number(ligne.montant);
      const prixUnit = Number(ligne.prixUnit);
      const isReduction = montant < 0;

      // Fond alterné
      if (i % 2 === 0) {
        doc.rect(50, y - 3, 495, lineHeight).fill('#f0f7f4').fill('#000000');
      }

      doc.fontSize(9).font(isReduction ? 'Helvetica-Oblique' : 'Helvetica');

      doc.text(ligne.description, colX.desc + 5, y, { width: 280 })
        .text(String(ligne.quantite), colX.qte, y, { width: 40, align: 'center' })
        .text(prixUnit.toFixed(2), colX.pu, y, { width: 70, align: 'right' })
        .text(montant.toFixed(2), colX.montant, y, { width: 70, align: 'right' });

      // Commentaire de ligne
      if (ligne.commentaire) {
        y += lineHeight;
        doc.fontSize(7).font('Helvetica-Oblique').fill('#666666')
          .text(`  ${ligne.commentaire}`, colX.desc + 5, y, { width: 280 });
        doc.fill('#000000');
      }

      y += lineHeight;

      // Saut de page si nécessaire
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    }

    // Ligne sous le tableau
    doc.moveTo(50, y + 2).lineTo(545, y + 2).stroke('#cccccc');
    doc.y = y + 10;
  }

  private drawTotaux(doc: any, facture: any) {
    const montantTotal = new Decimal(facture.montantTotal).toDecimalPlaces(2).toNumber();
    const montantPaye = new Decimal(facture.montantPaye).toDecimalPlaces(2).toNumber();
    const resteAPayer = new Decimal(facture.montantTotal).minus(facture.montantPaye).toDecimalPlaces(2).toNumber();

    const x = 380;
    let y = doc.y + 5;

    doc.fontSize(10).font('Helvetica');

    // Total
    doc.font('Helvetica-Bold')
      .text('Total :', x, y, { width: 90, align: 'right' })
      .text(`${montantTotal.toFixed(2)} €`, x + 90, y, { width: 75, align: 'right' });
    y += 18;

    // Montant payé (si > 0)
    if (montantPaye > 0) {
      doc.font('Helvetica')
        .text('Déjà payé :', x, y, { width: 90, align: 'right' })
        .text(`-${montantPaye.toFixed(2)} €`, x + 90, y, { width: 75, align: 'right' });
      y += 18;

      // Reste à payer
      doc.font('Helvetica-Bold');
      doc.rect(x - 5, y - 3, 175, 20).fill('#fff3cd').fill('#000000');
      doc.text('Reste à payer :', x, y, { width: 90, align: 'right' })
        .text(`${resteAPayer.toFixed(2)} €`, x + 90, y, { width: 75, align: 'right' });
    }

    // Mention exonération TVA
    doc.moveDown(1.5);
    doc.fontSize(8).font('Helvetica-Oblique').fill('#666666')
      .text('TVA non applicable - article 261-4-4° du CGI', 50, doc.y);

    doc.fill('#000000');
    doc.y += 10;
  }

  private drawPaiementInfo(doc: any, facture: any) {
    const y = doc.y + 5;
    const modePaiementLabels: Record<string, string> = {
      PRELEVEMENT: 'Prélèvement SEPA',
      VIREMENT: 'Virement bancaire',
      CHEQUE: 'Chèque',
    };

    doc.fontSize(10).font('Helvetica-Bold')
      .text('Informations de paiement', 50, y);

    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica');

    const mode = facture.modePaiement
      ? modePaiementLabels[facture.modePaiement] || facture.modePaiement
      : 'Non défini';
    doc.text(`Mode de paiement : ${mode}`);

    if (facture.datePrelevement) {
      doc.text(`Date de prélèvement : ${new Date(facture.datePrelevement).toLocaleDateString('fr-FR')}`);
    }

    doc.moveDown(0.5);
    doc.text(`IBAN : ${ECOLE_INFO.iban}`);
    doc.text(`BIC : ${ECOLE_INFO.bic}`);

    // Commentaire facture
    if (facture.commentaire) {
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica-Bold').text('Commentaire :');
      doc.font('Helvetica').text(facture.commentaire);
    }
  }

  private drawFooter(doc: any) {
    const bottomY = doc.page.height - 50;
    doc.moveTo(50, bottomY - 15).lineTo(545, bottomY - 15).stroke('#2d6a4f');
    doc.fontSize(7).font('Helvetica').fill('#888888')
      .text(
        `${ECOLE_INFO.nom} | ${ECOLE_INFO.adresse}, ${ECOLE_INFO.codePostal} ${ECOLE_INFO.ville} | SIRET : ${ECOLE_INFO.siret}`,
        50,
        bottomY - 10,
        { align: 'center', width: 495 },
      );
  }

  async generateZipFactures(mois: string): Promise<Buffer> {
    const archiver = require('archiver');

    const factures = await this.prisma.facture.findMany({
      where: {
        periode: mois,
        statut: { not: 'ANNULEE' },
      },
      select: { id: true, numero: true },
      orderBy: { numero: 'asc' },
    });

    if (factures.length === 0) {
      throw new NotFoundException(`Aucune facture trouvée pour la période ${mois}`);
    }

    return new Promise<Buffer>((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err: Error) => reject(err));

      const addPdfs = async () => {
        for (const facture of factures) {
          const pdfBuffer = await this.generateFacturePdf(facture.id);
          archive.append(pdfBuffer, { name: `facture-${facture.numero}.pdf` });
        }
        await archive.finalize();
      };

      addPdfs().catch(reject);
    });
  }
}
