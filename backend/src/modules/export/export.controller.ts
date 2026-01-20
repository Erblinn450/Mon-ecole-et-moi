import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ExportService } from './export.service';

@ApiTags('export')
@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('eleves')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Exporter la liste des élèves en CSV' })
  async exportEleves(@Res() res: Response) {
    const csv = await this.exportService.exportElevesCSV();
    const date = new Date().toISOString().split('T')[0];
    const filename = `eleves_${date}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM pour Excel
  }

  @Get('preinscriptions')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Exporter les préinscriptions en CSV' })
  async exportPreinscriptions(@Res() res: Response) {
    const csv = await this.exportService.exportPreinscriptionsCSV();
    const date = new Date().toISOString().split('T')[0];
    const filename = `preinscriptions_${date}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  }

  @Get('parents')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Exporter la liste des parents en CSV' })
  async exportParents(@Res() res: Response) {
    const csv = await this.exportService.exportParentsCSV();
    const date = new Date().toISOString().split('T')[0];
    const filename = `parents_${date}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  }

  @Get('factures')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Exporter les factures en CSV' })
  async exportFactures(@Res() res: Response) {
    const csv = await this.exportService.exportFacturesCSV();
    const date = new Date().toISOString().split('T')[0];
    const filename = `factures_${date}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  }

  @Get('complet')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Exporter toutes les données (CSV combiné)' })
  async exportComplet(@Res() res: Response) {
    const data = await this.exportService.exportAllDataCSV();
    const date = new Date().toISOString().split('T')[0];

    // CSV combiné avec séparateurs
    const combined = `=== ÉLÈVES ===\n${data.eleves}\n\n` +
                    `=== PRÉINSCRIPTIONS ===\n${data.preinscriptions}\n\n` +
                    `=== PARENTS ===\n${data.parents}\n\n` +
                    `=== FACTURES ===\n${data.factures}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="export_complet_${date}.csv"`);
    res.send('\uFEFF' + combined);
  }
}
