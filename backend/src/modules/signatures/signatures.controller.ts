import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SignaturesService } from './signatures.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('signatures')
@Controller('signatures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  /**
   * Statut de signature pour un enfant OU une préinscription
   * GET /api/signatures/status/:id (enfantId ou preinscriptionId)
   * Compatible avec l'ancien Laravel: /api/signatures/enfant/{enfantId}
   */
  @Get('status/:id')
  @ApiOperation({ summary: 'Statut de signature pour un enfant ou préinscription' })
  getSignatureStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.signaturesService.getSignatureStatus(id, req.user.email);
  }

  /**
   * Route compatible avec l'ancien Laravel: /api/signatures/enfant/{enfantId}
   */
  @Get('enfant/:id')
  @ApiOperation({ summary: 'Statut de signature (alias Laravel)' })
  getSignatureStatusLegacy(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.signaturesService.getSignatureStatus(id, req.user.email);
  }

  /**
   * Signer le règlement intérieur
   * POST /api/signatures/signer
   * Accepte: enfant_id OU preinscription_id (comme Laravel)
   */
  @Post('signer')
  @ApiOperation({ summary: 'Signer le règlement intérieur' })
  signerReglement(
    @Body() body: { enfant_id?: number; preinscription_id?: number; enfantId?: number; preinscriptionId?: number },
    @Request() req: any,
    @Ip() ip: string,
  ) {
    // Support des deux formats de noms (snake_case et camelCase)
    const enfantId = body.enfant_id || body.enfantId;
    const preinscriptionId = body.preinscription_id || body.preinscriptionId;

    return this.signaturesService.signerReglement(
      { enfantId, preinscriptionId },
      req.user.id,
      req.user.email,
      ip || 'unknown',
    );
  }

  /**
   * Route compatible avec l'ancien Laravel: POST /api/signatures/parent-accepte
   */
  @Post('parent-accepte')
  @ApiOperation({ summary: 'Signature parent (alias Laravel)' })
  parentAccepte(
    @Body() body: { enfant_id?: number; preinscription_id?: number },
    @Request() req: any,
    @Ip() ip: string,
  ) {
    return this.signaturesService.signerReglement(
      { enfantId: body.enfant_id, preinscriptionId: body.preinscription_id },
      req.user.id,
      req.user.email,
      ip || 'unknown',
    );
  }

  @Get('non-signees')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste les enfants sans signature (Admin)' })
  getSignaturesNonSignees() {
    return this.signaturesService.getSignaturesNonSignees();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste toutes les signatures (Admin)' })
  getAllSignatures() {
    return this.signaturesService.getAllSignatures();
  }
}
