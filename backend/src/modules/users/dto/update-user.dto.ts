import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FrequencePaiement, ModePaiement, DestinataireFacture } from '@prisma/client';

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

  @ApiPropertyOptional({ description: 'Fréquence de paiement', enum: FrequencePaiement })
  @ValidateIf((o) => o.frequencePaiement !== null && o.frequencePaiement !== undefined)
  @IsEnum(FrequencePaiement, { message: 'Fréquence de paiement invalide' })
  frequencePaiement?: FrequencePaiement | null;

  @ApiPropertyOptional({ description: 'Mode de paiement préféré', enum: ModePaiement })
  @ValidateIf((o) => o.modePaiementPref !== null && o.modePaiementPref !== undefined)
  @IsEnum(ModePaiement, { message: 'Mode de paiement invalide' })
  modePaiementPref?: ModePaiement | null;

  @ApiPropertyOptional({ description: 'Destinataire des factures', enum: DestinataireFacture })
  @ValidateIf((o) => o.destinataireFacture !== null && o.destinataireFacture !== undefined)
  @IsEnum(DestinataireFacture, { message: 'Destinataire invalide' })
  destinataireFacture?: DestinataireFacture | null;

  @ApiPropertyOptional({ description: 'Réduction RFR activée', example: false })
  @IsOptional()
  @IsBoolean()
  reductionRFR?: boolean;

  @ApiPropertyOptional({ description: 'Taux de réduction RFR (%)', example: 10 })
  @ValidateIf((o) => o.tauxReductionRFR !== null && o.tauxReductionRFR !== undefined)
  @IsNumber({}, { message: 'Le taux doit être un nombre' })
  @Min(0, { message: 'Le taux ne peut pas être négatif' })
  @Max(100, { message: 'Le taux ne peut pas dépasser 100%' })
  tauxReductionRFR?: number | null;

  @ApiPropertyOptional({ description: 'IBAN du parent' })
  @ValidateIf((o) => o.ibanParent !== null && o.ibanParent !== undefined)
  @IsString()
  ibanParent?: string | null;

  @ApiPropertyOptional({ description: 'Référence mandat SEPA' })
  @ValidateIf((o) => o.mandatSepaRef !== null && o.mandatSepaRef !== undefined)
  @IsString()
  mandatSepaRef?: string | null;
}
