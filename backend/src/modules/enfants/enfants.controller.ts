import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EnfantsService } from './enfants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, Classe } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces';

@ApiTags('enfants')
@Controller('enfants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnfantsController {
  constructor(private readonly enfantsService: EnfantsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDUCATEUR)
  @ApiOperation({ summary: 'Liste tous les enfants (Admin/Éducateur)' })
  @ApiQuery({ name: 'classe', required: false, enum: Classe })
  findAll(@Query('classe') classe?: Classe) {
    return this.enfantsService.findAll(classe);
  }

  @Get('mes-enfants')
  @ApiOperation({ summary: 'Liste les enfants du parent connecté' })
  findMyChildren(@Request() req: AuthenticatedRequest) {
    return this.enfantsService.findByParent(req.user.id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Statistiques des enfants (Admin)' })
  getStats() {
    return this.enfantsService.getStats();
  }

  @Get('classe/:classe')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDUCATEUR)
  @ApiOperation({ summary: 'Liste les enfants par classe' })
  getByClasse(@Param('classe') classe: Classe) {
    return this.enfantsService.getByClasse(classe);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un enfant par ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enfantsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Créer un enfant (Admin)' })
  create(@Body() createDto: any) {
    return this.enfantsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Modifier un enfant (Admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any) {
    return this.enfantsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer un enfant (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enfantsService.remove(id);
  }
}

