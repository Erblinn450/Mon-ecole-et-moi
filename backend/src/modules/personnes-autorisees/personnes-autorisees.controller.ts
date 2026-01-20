import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PersonnesAutoriseesService } from './personnes-autorisees.service';
import { CreatePersonneAutoriseeDto } from './dto/create-personne-autorisee.dto';
import { UpdatePersonneAutoriseeDto } from './dto/update-personne-autorisee.dto';
import { Request as ExpressRequest } from 'express';

@ApiTags('personnes-autorisees')
@Controller('personnes-autorisees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PersonnesAutoriseesController {
  constructor(private readonly service: PersonnesAutoriseesService) { }

  @Post()
  @ApiOperation({ summary: 'Ajouter une personne autorisée à récupérer un enfant' })
  create(@Request() req: ExpressRequest & { user: { id: number } }, @Body() dto: CreatePersonneAutoriseeDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des personnes autorisées pour tous mes enfants' })
  findAll(@Request() req: ExpressRequest & { user: { id: number } }) {
    return this.service.findAllForParent(req.user.id);
  }

  @Get('enfant/:enfantId')
  @ApiOperation({ summary: 'Liste des personnes autorisées pour un enfant spécifique' })
  findByEnfant(@Request() req: ExpressRequest & { user: { id: number } }, @Param('enfantId', ParseIntPipe) enfantId: number) {
    return this.service.findByEnfant(req.user.id, enfantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une personne autorisée' })
  update(
    @Request() req: ExpressRequest & { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonneAutoriseeDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une personne autorisée' })
  remove(@Request() req: ExpressRequest & { user: { id: number } }, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(req.user.id, id);
  }
}
