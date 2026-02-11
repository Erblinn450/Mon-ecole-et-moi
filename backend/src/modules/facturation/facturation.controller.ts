import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FacturationService } from './facturation.service';
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

@ApiTags('facturation')
@Controller('facturation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacturationController {
  constructor(private readonly facturationService: FacturationService) {}

  // ============================================
  // FACTURES - Parent
  // ============================================

  @Get('mes-factures')
  @ApiOperation({ summary: 'Liste mes factures (Parent)' })
  getFacturesParent(@Request() req: AuthenticatedRequest) {
    return this.facturationService.getFacturesParent(req.user.id);
  }

  // ============================================
  // FACTURES - Admin
  // ============================================

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
  @ApiOperation({ summary: 'Générer une facture mensuelle (Admin)' })
  genererFacture(@Body() body: { parentId: number; periode: string }) {
    return this.facturationService.genererFactureMensuelle(
      body.parentId,
      body.periode,
    );
  }

  // ============================================
  // CONFIG TARIFS - Admin
  // ============================================

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

  // ============================================
  // ARTICLES PERSONNALISÉS - Admin
  // ============================================

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
}
