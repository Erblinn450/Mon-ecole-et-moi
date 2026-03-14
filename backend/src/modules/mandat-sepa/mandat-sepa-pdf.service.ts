import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Informations créancier SEPA (fournies par Audrey) */
const CREANCIER = {
  nom: 'Mon Ecole et Moi',
  ics: 'FR40ZZZ81563B',
  adresse: '58 rue Damberg',
  codePostal: '68350',
  ville: 'Brunstatt-Didenheim',
  pays: 'France',
};

@Injectable()
export class MandatSepaPdfService {
  constructor(private prisma: PrismaService) {}

  /**
   * Génère le PDF du mandat SEPA signé (imprimable).
   */
  async generateMandatPdf(mandatId: number): Promise<Buffer> {
    const mandat = await this.prisma.mandatSepa.findUnique({
      where: { id: mandatId },
      include: {
        parent: {
          select: { id: true, nom: true, prenom: true, email: true, adresse: true },
        },
      },
    });

    if (!mandat) {
      throw new NotFoundException('Mandat non trouvé');
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- Titre ---
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('MANDAT DE PRÉLÈVEMENT SEPA', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Réf. Unique du Mandat (RUM) : ' + mandat.rum, { align: 'center' });
      doc.moveDown(1.5);

      // --- Informations Créancier ---
      doc.fontSize(12).font('Helvetica-Bold').text('CRÉANCIER');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nom : ${CREANCIER.nom}`);
      doc.text(`ICS (Identifiant Créancier SEPA) : ${CREANCIER.ics}`);
      doc.text(`Adresse : ${CREANCIER.adresse}, ${CREANCIER.codePostal} ${CREANCIER.ville}`);
      doc.text(`Pays : ${CREANCIER.pays}`);
      doc.moveDown(1);

      // --- Informations Débiteur ---
      doc.fontSize(12).font('Helvetica-Bold').text('DÉBITEUR');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nom : ${mandat.titulaire}`);
      doc.text(`Adresse : ${mandat.parent?.adresse || 'Non renseignée'}`);
      doc.moveDown(0.5);
      doc.text(`IBAN : ${this.formatIBAN(mandat.iban)}`);
      doc.text(`BIC : ${mandat.bic}`);
      doc.moveDown(1);

      // --- Type de paiement ---
      doc.fontSize(12).font('Helvetica-Bold').text('TYPE DE PAIEMENT');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text('☑ Paiement récurrent / répétitif');
      doc.moveDown(1);

      // --- Texte légal ---
      doc.fontSize(12).font('Helvetica-Bold').text('AUTORISATION');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica');
      doc.text(
        'En signant ce formulaire de mandat, vous autorisez ' +
          CREANCIER.nom +
          ' à envoyer des instructions à votre banque pour débiter votre compte, ' +
          'et votre banque à débiter votre compte conformément aux instructions de ' +
          CREANCIER.nom +
          '.',
        { align: 'justify' },
      );
      doc.moveDown(0.5);
      doc.text(
        'Vous bénéficiez du droit d\'être remboursé par votre banque selon les conditions ' +
          'décrites dans la convention que vous avez passée avec elle. Toute demande de ' +
          'remboursement doit être présentée dans les 8 semaines suivant la date de débit de ' +
          'votre compte pour un prélèvement autorisé, ou sans limite de délai pour un ' +
          'prélèvement non autorisé.',
        { align: 'justify' },
      );
      doc.moveDown(1);

      // --- Signature ---
      doc.fontSize(12).font('Helvetica-Bold').text('SIGNATURE');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');

      const dateStr = mandat.dateSignature
        ? new Date(mandat.dateSignature).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
        : 'N/A';

      doc.text(`Date de signature : ${dateStr}`);
      doc.text(`Signé électroniquement par : ${mandat.parent?.prenom || ''} ${mandat.parent?.nom || ''}`);
      doc.text(`Adresse IP : ${mandat.ipAdresse || 'N/A'}`);
      doc.moveDown(0.5);

      // Insérer l'image de signature si disponible
      if (mandat.signatureData) {
        try {
          // signatureData est en base64 PNG (format: data:image/png;base64,xxxxx)
          const base64Data = mandat.signatureData.replace(/^data:image\/png;base64,/, '');
          const imgBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imgBuffer, { width: 200, height: 80 });
        } catch {
          doc.text('[Signature électronique enregistrée]');
        }
      }

      doc.moveDown(2);

      // --- Pied de page ---
      doc
        .fontSize(7)
        .fillColor('#666')
        .text(
          `Document généré le ${new Date().toLocaleDateString('fr-FR')} — ` +
            `${CREANCIER.nom} — ICS: ${CREANCIER.ics} — RUM: ${mandat.rum}`,
          50,
          doc.page.height - 60,
          { align: 'center' },
        );

      doc.end();
    });
  }

  /**
   * Formate un IBAN avec des espaces tous les 4 caractères.
   */
  private formatIBAN(iban: string): string {
    const clean = iban.replace(/\s/g, '');
    return clean.replace(/(.{4})/g, '$1 ').trim();
  }
}
