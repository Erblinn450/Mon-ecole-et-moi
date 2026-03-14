import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Ip,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { MandatSepaService } from './mandat-sepa.service';
import { MandatSepaPdfService } from './mandat-sepa-pdf.service';
import { SignerMandatDto } from './dto/signer-mandat.dto';

@ApiTags('mandats-sepa')
@Controller('mandats-sepa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MandatSepaController {
  constructor(
    private readonly mandatSepaService: MandatSepaService,
    private readonly mandatSepaPdfService: MandatSepaPdfService,
  ) {}

  // ========== PARENT ==========

  @Get('mon-mandat')
  @ApiOperation({ summary: 'Récupérer mon mandat SEPA actif' })
  getMonMandat(@Request() req: AuthenticatedRequest) {
    return this.mandatSepaService.getMonMandat(req.user.id);
  }

  @Post('signer')
  @ApiOperation({ summary: 'Signer un nouveau mandat SEPA' })
  signerMandat(
    @Body() dto: SignerMandatDto,
    @Request() req: AuthenticatedRequest,
    @Ip() ip: string,
  ) {
    return this.mandatSepaService.signerMandat(dto, req.user.id, ip || 'unknown');
  }

  @Post(':id/revoquer')
  @ApiOperation({ summary: 'Révoquer mon mandat SEPA' })
  revoquerMandat(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.mandatSepaService.revoquerMandat(id, req.user.id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Télécharger le PDF du mandat SEPA' })
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    // Vérifier l'accès : le parent ne peut télécharger que son mandat
    if (req.user.role !== Role.ADMIN) {
      const monMandat = await this.mandatSepaService.getMonMandat(req.user.id);
      if (!monMandat.mandat || monMandat.mandat.id !== id) {
        return res.status(403).json({ message: 'Accès refusé' });
      }
    }

    const pdfBuffer = await this.mandatSepaPdfService.generateMandatPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="mandat-sepa-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  // ========== ADMIN ==========

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste tous les mandats SEPA (Admin)' })
  getAllMandats() {
    return this.mandatSepaService.getAllMandats();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Détail d\'un mandat SEPA (Admin)' })
  getMandatById(@Param('id', ParseIntPipe) id: number) {
    return this.mandatSepaService.getMandatById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Modifier un mandat SEPA (Admin)' })
  updateMandat(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { iban?: string; bic?: string; titulaire?: string },
  ) {
    return this.mandatSepaService.updateMandatAdmin(id, data);
  }
}
