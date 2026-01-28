import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nom complet', example: 'Jean Dupont' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

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

  @ApiPropertyOptional({ description: 'Email', example: 'jean.dupont@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @ApiPropertyOptional({ description: 'Téléphone', example: '0612345678' })
  @IsOptional()
  @Matches(/^0[1-9][0-9]{8}$/, {
    message: 'Le numéro de téléphone doit être au format français (10 chiffres)',
  })
  telephone?: string;

  @ApiPropertyOptional({ description: 'Compte actif', example: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
