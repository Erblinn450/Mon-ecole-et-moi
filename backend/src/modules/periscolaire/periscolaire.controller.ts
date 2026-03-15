import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PeriscolaireService } from './periscolaire.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces';

@ApiTags('periscolaire')
@Controller('periscolaire')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PeriscolaireController {
  constructor(private readonly periscolaireService: PeriscolaireService) {}

  @Post('inscrire')
  @ApiOperation({ summary: 'Inscrire un enfant au périscolaire' })
  inscrire(
    @Body() body: { enfantId: number; date: string },
    @Request() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.periscolaireService.inscrire(body.enfantId, body.date, req.user.id, isAdmin);
  }

  @Post('inscrire-multiple')
  @ApiOperation({ summary: 'Inscrire un enfant à plusieurs dates' })
  inscrireMultiple(
    @Body() body: { enfantId: number; dates: string[] },
    @Request() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.periscolaireService.inscrireMultiple(body.enfantId, body.dates, req.user.id, isAdmin);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une inscription périscolaire' })
  annuler(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.periscolaireService.annuler(id, req.user.id, isAdmin);
  }

  @Get('enfant/:enfantId')
  @ApiOperation({ summary: 'Liste le périscolaire d\'un enfant' })
  @ApiQuery({ name: 'mois', required: false, example: '2025-01' })
  getPeriscolaireEnfant(
    @Param('enfantId', ParseIntPipe) enfantId: number,
    @Request() req: AuthenticatedRequest,
    @Query('mois') mois?: string,
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.periscolaireService.getPeriscolaireEnfant(enfantId, req.user.id, isAdmin, mois);
  }

  @Get('date/:date')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDUCATEUR)
  @ApiOperation({ summary: 'Liste les inscriptions pour une date' })
  getPeriscolaireParDate(@Param('date') date: string) {
    return this.periscolaireService.getPeriscolaireParDate(date);
  }

  @Get('non-inscrits/:date')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDUCATEUR)
  @ApiOperation({ summary: 'Liste les enfants non inscrits pour une date' })
  getEnfantsNonInscrits(@Param('date') date: string) {
    return this.periscolaireService.getEnfantsNonInscrits(date);
  }
}

