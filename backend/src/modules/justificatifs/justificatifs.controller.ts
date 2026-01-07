import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JustificatifsService } from './justificatifs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { diskStorage, FileFilterCallback } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';

// Configuration de stockage Multer
const storage = diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    const uploadPath = join(process.cwd(), 'uploads', 'justificatifs');
    // Créer le dossier s'il n'existe pas
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    // Générer un nom unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `justif-${uniqueSuffix}${ext}`);
  },
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

@ApiTags('justificatifs')
@Controller('justificatifs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JustificatifsController {
  constructor(private readonly justificatifsService: JustificatifsService) {}

  @Get('types')
  @ApiOperation({ summary: 'Liste les types de justificatifs attendus' })
  getTypesAttendus() {
    return this.justificatifsService.getTypesAttendus();
  }

  @Get('enfant/:enfantId')
  @ApiOperation({ summary: 'Liste les justificatifs d\'un enfant' })
  getJustificatifsEnfant(@Param('enfantId', ParseIntPipe) enfantId: number) {
    return this.justificatifsService.getJustificatifsEnfant(enfantId);
  }

  @Get('en-attente')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste les justificatifs en attente de validation' })
  getJustificatifsEnAttente() {
    return this.justificatifsService.getJustificatifsEnAttente();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Uploader un justificatif' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        enfantId: { type: 'number' },
        typeId: { type: 'number' },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { enfantId: string; typeId: string },
  ) {
    if (!file) {
      throw new BadRequestException('Fichier requis');
    }

    const enfantId = parseInt(body.enfantId, 10);
    const typeId = parseInt(body.typeId, 10);

    if (isNaN(enfantId) || isNaN(typeId)) {
      throw new BadRequestException('enfantId et typeId sont requis');
    }

    // Stocker le chemin relatif
    const fichierUrl = `justificatifs/${file.filename}`;

    return this.justificatifsService.upload(enfantId, typeId, fichierUrl);
  }

  @Patch(':id/valider')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Valider ou refuser un justificatif' })
  valider(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { valide?: boolean; commentaire?: string },
  ) {
    // Par défaut valide = true si non spécifié
    const valide = body.valide !== undefined ? body.valide : true;
    return this.justificatifsService.valider(id, valide, body.commentaire);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un justificatif' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.justificatifsService.remove(id);
  }
}

