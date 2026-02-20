import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ModePaiement } from '@prisma/client';

export class EnregistrerPaiementDto {
  @ApiProperty({ description: 'Montant du paiement en euros', example: 575.0 })
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  @Type(() => Number)
  montant: number;

  @ApiProperty({ description: 'Date du paiement', example: '2026-02-05' })
  @IsDateString({}, { message: 'La date doit être au format ISO' })
  @IsNotEmpty()
  datePaiement: string;

  @ApiProperty({ description: 'Mode de paiement', enum: ModePaiement })
  @IsEnum(ModePaiement)
  modePaiement: ModePaiement;

  @ApiPropertyOptional({ description: 'Référence du paiement', example: 'VIR-20260205-001' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Commentaire', example: 'Paiement reçu par virement' })
  @IsOptional()
  @IsString()
  commentaire?: string;
}
