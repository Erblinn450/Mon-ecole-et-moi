import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FacturationService } from './facturation.service';
import { FacturationPdfService } from './facturation-pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces';
import {
  CreateConfigTarifDto,
  UpdateConfigTarifDto,
  UpsertConfigTarifDto,
} from './dto/config-tarif.dto';
import {
  CreateArticlePersonnaliseDto,
  UpdateArticlePersonnaliseDto,
} from './dto/article-personnalise.dto';
import { GenererFactureDto } from './dto/generer-facture.dto';
import { GenererBatchDto } from './dto/generer-batch.dto';
import { EnregistrerPaiementDto } from './dto/enregistrer-paiement.dto';
import { AjouterLigneDto, ModifierLigneDto } from './dto/ajouter-ligne.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';

@ApiTags('facturation')
@Controller('facturation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacturationController {
  constructor(
    private readonly facturationService: FacturationService,
    private readonly facturationPdfService: FacturationPdfService,
  ) {}

  // --- Factures : Parent ---

  @Get('mes-factures')
  @ApiOperation({ summary: 'Liste mes factures (Parent)' })
  getFacturesParent(@Request() req: AuthenticatedRequest) {
    return this.facturationService.getFacturesParent(req.user.id);
  }

  @Get('mes-factures/:id/pdf')
  @ApiOperation({ summary: 'Télécharger le PDF de ma facture (Parent)' })
  async getFactureParentPdf(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const facture = await this.facturationService.getFactureParentById(id, req.user.id);
    const buffer = await this.facturationPdfService.generateFacturePdf(facture.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${facture.numero}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('mes-factures/:id')
  @ApiOperation({ summary: "Détail d'une de mes factures (Parent)" })
  getFactureParentById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.facturationService.getFactureParentById(id, req.user.id);
  }

  // --- Config Tarifs : Admin (AVANT les routes paramétrées :id) ---

  @Get('config-tarifs')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste des tarifs configurés (Admin)' })
  @ApiQuery({ name: 'anneeScolaire', required: false, example: '2025-2026' })
  @ApiQuery({ name: 'categorie', required: false, example: 'SCOLARITE' })
  getConfigTarifs(
    @Query('anneeScolaire') anneeScolaire?: string,
    @Query('categorie') categorie?: string,
  ) {
    return this.facturationService.getConfigTarifs(anneeScolaire, categorie);
  }

  @Post('config-tarifs')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un tarif (Admin)' })
  createConfigTarif(@Body() dto: CreateConfigTarifDto) {
    return this.facturationService.createConfigTarif(dto);
  }

  @Put('config-tarifs/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Modifier un tarif (Admin)' })
  updateConfigTarif(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConfigTarifDto,
  ) {
    return this.facturationService.updateConfigTarif(id, dto);
  }

  @Post('config-tarifs/upsert')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer ou mettre à jour un tarif par clé + année (Admin)' })
  upsertConfigTarif(@Body() dto: UpsertConfigTarifDto) {
    return this.facturationService.upsertConfigTarif(dto);
  }

  @Post('config-tarifs/seed')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Initialiser les tarifs par défaut pour une année scolaire (Admin)' })
  seedDefaultTarifs(@Body() body: { anneeScolaire: string }) {
    return this.facturationService.seedDefaultTarifs(body.anneeScolaire);
  }

  // --- Articles Personnalisés : Admin ---

  @Get('articles')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste des articles personnalisés (Admin)' })
  @ApiQuery({ name: 'tous', required: false, description: 'Inclure les articles inactifs' })
  getArticlesPersonnalises(@Query('tous') tous?: string) {
    return this.facturationService.getArticlesPersonnalises(tous !== 'true');
  }

  @Get('articles/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Détails d'un article personnalisé (Admin)" })
  getArticlePersonnalise(@Param('id', ParseIntPipe) id: number) {
    return this.facturationService.getArticlePersonnalise(id);
  }

  @Post('articles')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un article personnalisé (Admin)' })
  createArticlePersonnalise(@Body() dto: CreateArticlePersonnaliseDto) {
    return this.facturationService.createArticlePersonnalise(dto);
  }

  @Put('articles/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Modifier un article personnalisé (Admin)' })
  updateArticlePersonnalise(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticlePersonnaliseDto,
  ) {
    return this.facturationService.updateArticlePersonnalise(id, dto);
  }

  @Delete('articles/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Désactiver un article personnalisé (Admin)' })
  deleteArticlePersonnalise(@Param('id', ParseIntPipe) id: number) {
    return this.facturationService.deleteArticlePersonnalise(id);
  }

  // --- Factures : Admin ---

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Statistiques de facturation (Admin)' })
  getStats() {
    return this.facturationService.getStats();
  }

  @Get('export-pdf-zip')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Télécharger toutes les factures du mois en ZIP (Admin)' })
  @ApiQuery({ name: 'mois', required: false, example: '2026-02' })
  async exportPdfZip(
    @Query('mois') mois: string,
    @Res() res: Response,
  ) {
    const buffer = await this.facturationPdfService.generateZipFactures(mois);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="factures-${mois}.zip"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste toutes les factures (Admin)' })
  @ApiQuery({ name: 'mois', required: false, example: '2026-02' })
  getAllFactures(@Query('mois') mois?: string) {
    return this.facturationService.getAllFactures(mois);
  }

  @Post('generer')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Générer une facture pour un parent (Admin)' })
  genererFacture(@Body() dto: GenererFactureDto) {
    return this.facturationService.genererFacture(dto);
  }

  @Post('generer-batch')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Générer les factures de toutes les familles (Admin)' })
  genererBatch(@Body() dto: GenererBatchDto) {
    return this.facturationService.genererBatch(dto);
  }

  @Post('previsualiser')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Prévisualiser une facture sans la persister (Admin)' })
  previsualiserFacture(@Body() dto: GenererFactureDto) {
    return this.facturationService.previsualiserFacture(dto);
  }

  @Post('envoyer-batch')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Envoyer toutes les factures en attente par email (Admin)' })
  envoyerBatch(@Body() body: { mois?: string }) {
    return this.facturationService.envoyerBatch(body.mois);
  }

  // --- Routes paramétrées :id (TOUJOURS en dernier) ---

  @Get(':id/pdf')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Télécharger le PDF d\'une facture (Admin)' })
  async getFacturePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const facture = await this.facturationService.getFactureById(id);
    const buffer = await this.facturationPdfService.generateFacturePdf(facture.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${facture.numero}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Détail d'une facture (Admin)" })
  getFactureById(@Param('id', ParseIntPipe) id: number) {
    return this.facturationService.getFactureById(id);
  }

  @Patch(':id/statut')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Modifier le statut d'une facture (Admin)" })
  updateStatutFacture(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatutDto,
  ) {
    return this.facturationService.updateStatutFacture(id, dto);
  }

  @Post(':id/paiement')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Enregistrer un paiement sur une facture (Admin)' })
  enregistrerPaiement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EnregistrerPaiementDto,
  ) {
    return this.facturationService.enregistrerPaiement(id, dto);
  }

  @Post(':id/avoir')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un avoir pour annuler une facture (Admin)' })
  creerAvoir(@Param('id', ParseIntPipe) id: number) {
    return this.facturationService.creerAvoir(id);
  }

  @Post(':id/lignes')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Ajouter une ligne à une facture (Admin)' })
  ajouterLigne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AjouterLigneDto,
  ) {
    return this.facturationService.ajouterLigne(id, dto);
  }

  @Patch(':id/lignes/:ligneId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Modifier une ligne de facture (Admin)' })
  modifierLigne(
    @Param('id', ParseIntPipe) id: number,
    @Param('ligneId', ParseIntPipe) ligneId: number,
    @Body() dto: ModifierLigneDto,
  ) {
    return this.facturationService.modifierLigne(id, ligneId, dto);
  }

  @Delete(':id/lignes/:ligneId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer une ligne de facture (Admin)' })
  supprimerLigne(
    @Param('id', ParseIntPipe) id: number,
    @Param('ligneId', ParseIntPipe) ligneId: number,
  ) {
    return this.facturationService.supprimerLigne(id, ligneId);
  }
}
