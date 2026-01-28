import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Classe } from '@prisma/client';

export class CreateEnfantDto {
  @ApiProperty({ description: 'Nom de famille de l\'enfant', example: 'Dupont' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  nom: string;

  @ApiProperty({ description: 'Prénom de l\'enfant', example: 'Lucas' })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le prénom ne peut pas dépasser 100 caractères' })
  prenom: string;

  @ApiPropertyOptional({ description: 'Date de naissance', example: '2020-03-15' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de naissance doit être une date valide (YYYY-MM-DD)' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dateNaissance?: Date;

  @ApiPropertyOptional({ description: 'Lieu de naissance', example: 'Mulhouse' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lieuNaissance?: string;

  @ApiPropertyOptional({ description: 'Classe de l\'enfant', enum: Classe })
  @IsOptional()
  @IsEnum(Classe, { message: 'La classe doit être MATERNELLE, ELEMENTAIRE ou COLLEGE' })
  classe?: Classe;

  @ApiProperty({ description: 'ID du parent principal', example: 1 })
  @IsInt({ message: 'L\'ID du parent doit être un nombre entier' })
  @IsNotEmpty({ message: 'Le parent principal est obligatoire' })
  parent1Id: number;

  @ApiPropertyOptional({ description: 'ID du second parent', example: 2 })
  @IsOptional()
  @IsInt({ message: 'L\'ID du second parent doit être un nombre entier' })
  parent2Id?: number;

  @ApiPropertyOptional({ description: 'ID de la préinscription associée' })
  @IsOptional()
  @IsInt()
  preinscriptionId?: number;
}
