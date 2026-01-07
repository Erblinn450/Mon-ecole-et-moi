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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PeriscolaireService } from './periscolaire.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('periscolaire')
@Controller('periscolaire')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PeriscolaireController {
  constructor(private readonly periscolaireService: PeriscolaireService) {}

  @Post('inscrire')
  @ApiOperation({ summary: 'Inscrire un enfant au périscolaire' })
  inscrire(@Body() body: { enfantId: number; date: string }) {
    return this.periscolaireService.inscrire(body.enfantId, body.date);
  }

  @Post('inscrire-multiple')
  @ApiOperation({ summary: 'Inscrire un enfant à plusieurs dates' })
  inscrireMultiple(@Body() body: { enfantId: number; dates: string[] }) {
    return this.periscolaireService.inscrireMultiple(body.enfantId, body.dates);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une inscription périscolaire' })
  annuler(@Param('id', ParseIntPipe) id: number) {
    return this.periscolaireService.annuler(id);
  }

  @Get('enfant/:enfantId')
  @ApiOperation({ summary: 'Liste le périscolaire d\'un enfant' })
  @ApiQuery({ name: 'mois', required: false, example: '2025-01' })
  getPeriscolaireEnfant(
    @Param('enfantId', ParseIntPipe) enfantId: number,
    @Query('mois') mois?: string,
  ) {
    return this.periscolaireService.getPeriscolaireEnfant(enfantId, mois);
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

