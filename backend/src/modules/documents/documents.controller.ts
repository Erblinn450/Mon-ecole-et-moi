import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Ip,
  Headers,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { join } from 'path';
import { existsSync } from 'fs';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('reglement-interieur')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Télécharger le règlement intérieur' })
  downloadReglement(@Res() res: Response) {
    const filePath = join(process.cwd(), '..', 'frontend', 'public', 'documents', 'reglement-interieur.pdf');
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    res.download(filePath, 'reglement-interieur.pdf');
  }

  @Post('reglement-ouvert')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enregistrer l\'ouverture du règlement' })
  async enregistrerOuverture(
    @Body() body: { enfant_id: number; document_type?: string },
    @Request() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.documentsService.enregistrerOuverture(
      req.user.id,
      body.enfant_id,
      body.document_type || 'reglement-interieur',
      ip || 'unknown',
      userAgent || 'Unknown',
    );
  }

  @Get('reglement-ouvert/:enfantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier si le règlement a été ouvert' })
  async verifierOuverture(
    @Param('enfantId', ParseIntPipe) enfantId: number,
    @Request() req: any,
  ) {
    return this.documentsService.verifierOuverture(
      req.user.id,
      enfantId,
      'reglement-interieur',
    );
  }
}

