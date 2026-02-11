import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export const CATEGORIES_TARIF = [
  'SCOLARITE',
  'REPAS',
  'PERISCOLAIRE',
  'INSCRIPTION',
  'FONCTIONNEMENT',
  'FRATRIE',
  'AUTRE',
] as const;

export class CreateConfigTarifDto {
  @ApiProperty({ description: 'Clé unique du tarif', example: 'SCOLARITE_MENSUEL' })
  @IsString()
  @IsNotEmpty({ message: 'La clé est obligatoire' })
  @MinLength(2)
  @MaxLength(100)
  cle: string;

  @ApiProperty({ description: 'Montant en euros', example: 575.0 })
  @IsNumber({}, { message: 'La valeur doit être un nombre' })
  @Min(0, { message: 'La valeur ne peut pas être négative' })
  @Type(() => Number)
  valeur: number;

  @ApiPropertyOptional({ description: 'Description du tarif', example: 'Frais de scolarité mensuel par élève' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Année scolaire au format YYYY-YYYY', example: '2025-2026' })
  @IsString()
  @IsNotEmpty({ message: "L'année scolaire est obligatoire" })
  anneeScolaire: string;

  @ApiProperty({ description: 'Catégorie du tarif', example: 'SCOLARITE', enum: CATEGORIES_TARIF })
  @IsString()
  @IsNotEmpty({ message: 'La catégorie est obligatoire' })
  @IsIn([...CATEGORIES_TARIF], {
    message: `La catégorie doit être l'une des suivantes : ${CATEGORIES_TARIF.join(', ')}`,
  })
  categorie: string;
}

export class UpdateConfigTarifDto {
  @ApiPropertyOptional({ example: 580.0 })
  @IsOptional()
  @IsNumber({}, { message: 'La valeur doit être un nombre' })
  @Min(0, { message: 'La valeur ne peut pas être négative' })
  @Type(() => Number)
  valeur?: number;

  @ApiPropertyOptional({ example: 'Description mise à jour' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class UpsertConfigTarifDto extends CreateConfigTarifDto {}
