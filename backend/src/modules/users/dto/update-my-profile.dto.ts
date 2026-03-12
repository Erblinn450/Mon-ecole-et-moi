import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour la modification du profil par le parent lui-même.
 * Limité aux champs que le parent a le droit de modifier.
 * Pas de champ role, actif, etc. (réservé admin).
 */
export class UpdateMyProfileDto {
  @ApiPropertyOptional({ description: 'Nom de famille', example: 'Dupont' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom?: string;

  @ApiPropertyOptional({ description: 'Prénom', example: 'Jean' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  prenom?: string;

  @ApiPropertyOptional({ description: 'Téléphone', example: '0612345678' })
  @IsOptional()
  @Matches(/^0[1-9][0-9]{8}$/, {
    message: 'Le numéro de téléphone doit être au format français (10 chiffres)',
  })
  telephone?: string;

  @ApiPropertyOptional({ description: 'Adresse postale', example: '12 rue des Lilas, 68000 Colmar' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'jean.dupont@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;
}
