import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatutFacture } from '@prisma/client';
import { Decimal } from 'decimal.js';

/** Infos créancier SEPA (Audrey Ballester / Mon Ecole et Moi) */
const CREANCIER = {
  nom: 'Mon Ecole et Moi',
  ics: 'FR40ZZZ81563B',
  iban: 'FR7630087332280002045700129',
  bic: 'CMCIFRPP',
};

interface SepaTransaction {
  factureId: number;
  numero: string;
  montant: number;
  parentNom: string;
  parentPrenom: string;
  iban: string;
  bic: string;
  rum: string;
  dateSignatureMandat: Date;
  description: string;
}

@Injectable()
export class SepaXmlService {
  private readonly logger = new Logger(SepaXmlService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Génère un fichier XML SEPA pain.008.001.02 pour les prélèvements.
   * @param mois Période au format "YYYY-MM" (ex: "2026-03")
   * @param inclureImpayes Inclure les impayés des mois précédents
   * @param datePrelevement Date souhaitée pour le prélèvement
   */
  async genererSepaXml(
    mois: string,
    inclureImpayes: boolean = false,
    datePrelevement?: Date,
  ): Promise<{ xml: string; transactions: SepaTransaction[]; totalMontant: number; nbTransactions: number }> {
    // Récupérer les factures éligibles au prélèvement
    const whereConditions: any[] = [
      {
        periode: mois,
        statut: { in: ['EN_ATTENTE', 'ENVOYEE', 'PARTIELLE'] as StatutFacture[] },
        modePaiement: 'PRELEVEMENT',
      },
    ];

    if (inclureImpayes) {
      whereConditions.push({
        statut: { in: ['EN_RETARD', 'PARTIELLE'] as StatutFacture[] },
        modePaiement: 'PRELEVEMENT',
        periode: { not: mois },
      });
    }

    const factures = await this.prisma.facture.findMany({
      where: { OR: whereConditions },
      include: {
        parent: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            mandatsSepa: {
              where: { actif: true },
              take: 1,
            },
          },
        },
      },
    });

    if (factures.length === 0) {
      throw new BadRequestException('Aucune facture éligible au prélèvement SEPA');
    }

    // Construire les transactions
    const transactions: SepaTransaction[] = [];
    const erreurs: string[] = [];

    for (const facture of factures) {
      const mandat = facture.parent?.mandatsSepa?.[0];
      if (!mandat) {
        erreurs.push(`Facture ${facture.numero}: parent ${facture.parent?.prenom} ${facture.parent?.nom} sans mandat SEPA actif`);
        continue;
      }

      const resteAPayer = new Decimal(facture.montantTotal).minus(facture.montantPaye);
      if (resteAPayer.lte(0)) continue;

      transactions.push({
        factureId: facture.id,
        numero: facture.numero,
        montant: resteAPayer.toDecimalPlaces(2).toNumber(),
        parentNom: facture.parent?.nom || '',
        parentPrenom: facture.parent?.prenom || '',
        iban: mandat.iban,
        bic: mandat.bic,
        rum: mandat.rum,
        dateSignatureMandat: mandat.dateSignature!,
        description: `${facture.numero} - ${facture.description || facture.periode}`,
      });
    }

    if (transactions.length === 0) {
      throw new BadRequestException(
        erreurs.length > 0
          ? `Aucune transaction valide. Erreurs: ${erreurs.join('; ')}`
          : 'Aucune transaction à prélever (toutes les factures sont déjà payées)',
      );
    }

    const totalMontant = transactions.reduce((sum, t) => new Decimal(sum).plus(t.montant).toNumber(), 0);
    const datePrelev = datePrelevement || this.getProchaineDatePrelevement();
    const msgId = `MEMM-${mois.replace('-', '')}-${Date.now()}`;
    const creationDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

    // Générer le XML pain.008.001.02
    const xml = this.buildXml(msgId, creationDate, datePrelev, transactions, totalMontant);

    this.logger.log(
      `SEPA XML généré: ${transactions.length} transactions, total ${totalMontant}€, ${erreurs.length} erreurs`,
    );

    return {
      xml,
      transactions,
      totalMontant: new Decimal(totalMontant).toDecimalPlaces(2).toNumber(),
      nbTransactions: transactions.length,
    };
  }

  /**
   * Marque les factures comme "prélevées" après génération du fichier SEPA.
   */
  async marquerFacturesPrelevees(factureIds: number[], datePrelevement: Date) {
    const updated = await this.prisma.facture.updateMany({
      where: { id: { in: factureIds } },
      data: {
        datePrelevement,
        statut: 'ENVOYEE' as StatutFacture,
      },
    });

    this.logger.log(`${updated.count} factures marquées comme prélevées`);
    return updated;
  }

  /**
   * Génère le XML au format pain.008.001.02
   */
  private buildXml(
    msgId: string,
    creationDate: string,
    datePrelevement: Date,
    transactions: SepaTransaction[],
    totalMontant: number,
  ): string {
    const datePrelStr = datePrelevement.toISOString().split('T')[0];
    const ctrlSum = new Decimal(totalMontant).toDecimalPlaces(2).toFixed(2);

    const txBlocks = transactions.map((tx) => {
      const mandatDate = tx.dateSignatureMandat
        ? new Date(tx.dateSignatureMandat).toISOString().split('T')[0]
        : datePrelStr;

      return `      <DrctDbtTxInf>
        <PmtId>
          <EndToEndId>${this.escapeXml(tx.numero)}</EndToEndId>
        </PmtId>
        <InstdAmt Ccy="EUR">${new Decimal(tx.montant).toFixed(2)}</InstdAmt>
        <DrctDbtTx>
          <MndtRltdInf>
            <MndtId>${this.escapeXml(tx.rum)}</MndtId>
            <DtOfSgntr>${mandatDate}</DtOfSgntr>
          </MndtRltdInf>
        </DrctDbtTx>
        <DbtrAgt>
          <FinInstnId>
            <BIC>${tx.bic}</BIC>
          </FinInstnId>
        </DbtrAgt>
        <Dbtr>
          <Nm>${this.escapeXml(`${tx.parentPrenom} ${tx.parentNom}`.trim())}</Nm>
        </Dbtr>
        <DbtrAcct>
          <Id>
            <IBAN>${tx.iban}</IBAN>
          </Id>
        </DbtrAcct>
        <RmtInf>
          <Ustrd>${this.escapeXml(tx.description.substring(0, 140))}</Ustrd>
        </RmtInf>
      </DrctDbtTxInf>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creationDate}</CreDtTm>
      <NbOfTxs>${transactions.length}</NbOfTxs>
      <CtrlSum>${ctrlSum}</CtrlSum>
      <InitgPty>
        <Nm>${CREANCIER.nom}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${msgId}-001</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>${transactions.length}</NbOfTxs>
      <CtrlSum>${ctrlSum}</CtrlSum>
      <PmtTpInf>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
        <LclInstrm>
          <Cd>CORE</Cd>
        </LclInstrm>
        <SeqTp>RCUR</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>${datePrelStr}</ReqdColltnDt>
      <Cdtr>
        <Nm>${CREANCIER.nom}</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id>
          <IBAN>${CREANCIER.iban}</IBAN>
        </Id>
      </CdtrAcct>
      <CdtrAgt>
        <FinInstnId>
          <BIC>${CREANCIER.bic}</BIC>
        </FinInstnId>
      </CdtrAgt>
      <CdtrSchmeId>
        <Id>
          <PrvtId>
            <Othr>
              <Id>${CREANCIER.ics}</Id>
              <SchmeNm>
                <Prtry>SEPA</Prtry>
              </SchmeNm>
            </Othr>
          </PrvtId>
        </Id>
      </CdtrSchmeId>
${txBlocks.join('\n')}
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private getProchaineDatePrelevement(): Date {
    const now = new Date();
    // Prélèvement le 5 du mois suivant (convention bancaire)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    return nextMonth;
  }
}
