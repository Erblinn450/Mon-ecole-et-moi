import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FacturationService } from './facturation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces';

@ApiTags('facturation')
@Controller('facturation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacturationController {
  constructor(private readonly facturationService: FacturationService) {}

  @Get('mes-factures')
  @ApiOperation({ summary: 'Liste mes factures (Parent)' })
  getFacturesParent(@Request() req: AuthenticatedRequest) {
    return this.facturationService.getFacturesParent(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste toutes les factures (Admin)' })
  @ApiQuery({ name: 'mois', required: false, example: '2025-01' })
  getAllFactures(@Query('mois') mois?: string) {
    return this.facturationService.getAllFactures(mois);
  }

  @Post('generer')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Générer une facture mensuelle (Admin)' })
  genererFacture(@Body() body: { parentId: number; periode: string }) {
    return this.facturationService.genererFactureMensuelle(body.parentId, body.periode);
  }
}

