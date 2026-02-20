import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FrequencePaiement } from '@prisma/client';

export class GenererFactureDto {
  @ApiProperty({ description: 'ID du parent', example: 1 })
  @IsInt()
  @Type(() => Number)
  parentId: number;

  @ApiProperty({ description: 'Période au format YYYY-MM', example: '2026-02' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, { message: 'La période doit être au format YYYY-MM' })
  periode: string;

  @ApiProperty({ description: 'Année scolaire', example: '2025-2026' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{4}$/, { message: "L'année scolaire doit être au format YYYY-YYYY" })
  anneeScolaire: string;

  @ApiPropertyOptional({ description: 'Surcharger la fréquence de paiement', enum: FrequencePaiement })
  @IsOptional()
  @IsEnum(FrequencePaiement)
  frequence?: FrequencePaiement;

  @ApiPropertyOptional({ description: 'Inclure les frais de scolarité', default: true })
  @IsOptional()
  @IsBoolean()
  inclureScolarite?: boolean;

  @ApiPropertyOptional({ description: 'Inclure les repas', default: true })
  @IsOptional()
  @IsBoolean()
  inclureRepas?: boolean;

  @ApiPropertyOptional({ description: 'Inclure le périscolaire', default: true })
  @IsOptional()
  @IsBoolean()
  inclurePeriscolaire?: boolean;

  @ApiPropertyOptional({ description: "Inclure les frais d'inscription", default: false })
  @IsOptional()
  @IsBoolean()
  inclureInscription?: boolean;

  @ApiPropertyOptional({ description: 'Inclure les frais de fonctionnement', default: false })
  @IsOptional()
  @IsBoolean()
  inclureFonctionnement?: boolean;
}
