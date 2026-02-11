import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateArticlePersonnaliseDto {
  @ApiProperty({ description: "Nom de l'article", example: 'Sortie scolaire - Musée' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(200, { message: 'Le nom ne peut pas dépasser 200 caractères' })
  nom: string;

  @ApiPropertyOptional({ description: "Description de l'article", example: 'Sortie scolaire au Musée Unterlinden' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Prix par défaut en euros', example: 25.0 })
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0, { message: 'Le prix ne peut pas être négatif' })
  @Type(() => Number)
  prixDefaut: number;
}

export class UpdateArticlePersonnaliseDto {
  @ApiPropertyOptional({ example: 'Sortie scolaire - Zoo' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(200)
  nom?: string;

  @ApiPropertyOptional({ example: 'Sortie au zoo de Mulhouse' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 30.0 })
  @IsOptional()
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0, { message: 'Le prix ne peut pas être négatif' })
  @Type(() => Number)
  prixDefaut?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
