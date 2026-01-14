import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PreinscriptionsService } from './preinscriptions.service';
import { CreatePreinscriptionDto } from './dto/create-preinscription.dto';
import { UpdatePreinscriptionDto } from './dto/update-preinscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RecaptchaGuard } from '../../common/guards/recaptcha.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, StatutPreinscription } from '@prisma/client';

@ApiTags('preinscriptions')
@Controller('preinscriptions')
export class PreinscriptionsController {
  constructor(private readonly preinscriptionsService: PreinscriptionsService) {}

  @Post()
  @UseGuards(RecaptchaGuard) // Protection reCAPTCHA (désactivé si pas de clé configurée)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 préinscriptions par minute par IP
  @ApiOperation({ summary: 'Créer une nouvelle préinscription (public)' })
  @ApiBody({ 
    description: 'Données de préinscription + token reCAPTCHA optionnel',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/CreatePreinscriptionDto' },
        { 
          type: 'object',
          properties: {
            recaptchaToken: { type: 'string', description: 'Token reCAPTCHA v3 (requis en production)' }
          }
        }
      ]
    }
  })
  create(@Body() createDto: CreatePreinscriptionDto) {
    return this.preinscriptionsService.create(createDto);
  }

  @Get('mes-dossiers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste les dossiers du parent connecté' })
  async mesDossiers(@Request() req: any) {
    // Récupère les dossiers du parent connecté via son email
    return this.preinscriptionsService.findByParentEmailWithEnfants(req.user.email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste toutes les préinscriptions (Admin)' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutPreinscription })
  findAll(@Query('statut') statut?: StatutPreinscription) {
    return this.preinscriptionsService.findAll(statut);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statistiques des préinscriptions (Admin)' })
  getStats() {
    return this.preinscriptionsService.getStats();
  }

  @Get('dossier/:numeroDossier')
  @ApiOperation({ summary: 'Récupère une préinscription par numéro de dossier' })
  findByNumeroDossier(@Param('numeroDossier') numeroDossier: string) {
    return this.preinscriptionsService.findByNumeroDossier(numeroDossier);
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Vérifie l\'email via le token de vérification' })
  verifyEmail(@Param('token') token: string) {
    return this.preinscriptionsService.verifyEmail(token);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Génère le PDF du dossier de préinscription (Admin)' })
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.preinscriptionsService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=dossier-preinscription-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupère une préinscription par ID (Admin)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.preinscriptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifie une préinscription (Admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePreinscriptionDto,
  ) {
    return this.preinscriptionsService.update(id, updateDto);
  }

  @Patch(':id/statut')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change le statut d\'une préinscription (Admin)' })
  updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { statut: StatutPreinscription; commentaire?: string },
  ) {
    return this.preinscriptionsService.updateStatut(id, body.statut, body.commentaire);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprime une préinscription (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.preinscriptionsService.remove(id);
  }
}

