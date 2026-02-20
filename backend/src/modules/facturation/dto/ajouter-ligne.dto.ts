import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TypeLigne } from '@prisma/client';

export class AjouterLigneDto {
  @ApiProperty({ description: 'Description de la ligne', example: 'Dépassement périscolaire - 15 min' })
  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire' })
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'Quantité', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantite: number;

  @ApiProperty({ description: 'Prix unitaire en euros', example: 5.0 })
  @IsNumber({}, { message: 'Le prix unitaire doit être un nombre' })
  @Min(0, { message: 'Le prix unitaire ne peut pas être négatif' })
  @Type(() => Number)
  prixUnit: number;

  @ApiProperty({ description: 'Type de ligne', enum: TypeLigne })
  @IsEnum(TypeLigne)
  type: TypeLigne;

  @ApiPropertyOptional({ description: 'Commentaire', example: 'Calcul : 15 min à 20€/h' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commentaire?: string;
}

export class ModifierLigneDto {
  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Quantité' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantite?: number;

  @ApiPropertyOptional({ description: 'Prix unitaire en euros' })
  @IsOptional()
  @IsNumber({})
  @Type(() => Number)
  prixUnit?: number;

  @ApiPropertyOptional({ description: 'Commentaire' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commentaire?: string;
}
