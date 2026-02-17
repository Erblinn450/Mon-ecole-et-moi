import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StatutReinscription, Role } from '@prisma/client';
import { ReinscriptionsService } from './reinscriptions.service';
import { CreateReinscriptionDto, CreateReinscriptionBulkDto } from './dto/create-reinscription.dto';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('Réinscriptions')
@ApiBearerAuth()
@Controller('reinscriptions')
@UseGuards(JwtAuthGuard)
export class ReinscriptionsController {
  constructor(private readonly reinscriptionsService: ReinscriptionsService) {}

  @Get('mes-enfants')
  @ApiOperation({ summary: 'Récupère les enfants éligibles à la réinscription (parent)' })
  async getMesEnfants(@Request() req: AuthenticatedRequest) {
    return this.reinscriptionsService.getEnfantsEligibles(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée une demande de réinscription pour un enfant' })
  async create(
    @Body() dto: CreateReinscriptionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reinscriptionsService.create(dto, req.user.id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Crée plusieurs demandes de réinscription en une fois' })
  async createBulk(
    @Body() dto: CreateReinscriptionBulkDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reinscriptionsService.createBulk(dto.reinscriptions, req.user.id);
  }

  @Get('mes-reinscriptions')
  @ApiOperation({ summary: 'Récupère les réinscriptions du parent connecté' })
  async getMesReinscriptions(@Request() req: AuthenticatedRequest) {
    return this.reinscriptionsService.findByParent(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste toutes les réinscriptions (admin)' })
  @ApiQuery({ name: 'anneeScolaire', required: false })
  async findAll(@Query('anneeScolaire') anneeScolaire?: string) {
    return this.reinscriptionsService.findAll(anneeScolaire);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Statistiques des réinscriptions (admin)' })
  @ApiQuery({ name: 'anneeScolaire', required: false })
  async getStats(@Query('anneeScolaire') anneeScolaire?: string) {
    return this.reinscriptionsService.getStats(anneeScolaire);
  }

  @Patch(':id/statut')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Met à jour le statut d\'une réinscription (admin)' })
  async updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { statut: StatutReinscription; commentaire?: string },
  ) {
    return this.reinscriptionsService.updateStatut(id, body.statut, body.commentaire);
  }
}
