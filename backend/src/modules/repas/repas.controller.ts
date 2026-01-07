import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RepasService } from './repas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, TypeRepas } from '@prisma/client';

@ApiTags('repas')
@Controller('repas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RepasController {
  constructor(private readonly repasService: RepasService) {}

  @Post('commander')
  @ApiOperation({ summary: 'Commander un repas' })
  commander(
    @Body() body: { enfantId: number; date: string; type?: TypeRepas },
  ) {
    return this.repasService.commander(body.enfantId, body.date, body.type);
  }

  @Post('commander-multiple')
  @ApiOperation({ summary: 'Commander plusieurs repas' })
  commanderMultiple(
    @Body() body: { enfantId: number; dates: string[]; type?: TypeRepas },
  ) {
    return this.repasService.commanderMultiple(body.enfantId, body.dates, body.type);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler un repas' })
  annuler(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.repasService.annuler(id, req.user.id, isAdmin);
  }

  @Get('enfant/:enfantId')
  @ApiOperation({ summary: 'Liste les repas d\'un enfant' })
  @ApiQuery({ name: 'mois', required: false, example: '2025-01' })
  getRepasEnfant(
    @Param('enfantId', ParseIntPipe) enfantId: number,
    @Query('mois') mois?: string,
  ) {
    return this.repasService.getRepasEnfant(enfantId, mois);
  }

  @Get('date/:date')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDUCATEUR)
  @ApiOperation({ summary: 'Liste les repas pour une date (Admin/Éducateur)' })
  getRepasParDate(@Param('date') date: string) {
    return this.repasService.getRepasParDate(date);
  }

  @Get('non-inscrits/:date')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDUCATEUR)
  @ApiOperation({ summary: 'Liste les enfants non inscrits pour une date' })
  getEnfantsNonInscrits(@Param('date') date: string) {
    return this.repasService.getEnfantsNonInscrits(date);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Statistiques des repas (Admin)' })
  @ApiQuery({ name: 'mois', example: '2025-01' })
  getStats(@Query('mois') mois: string) {
    return this.repasService.getStatsRepas(mois);
  }
}

