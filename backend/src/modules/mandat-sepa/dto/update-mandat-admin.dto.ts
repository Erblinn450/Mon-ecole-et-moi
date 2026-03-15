import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMandatAdminDto {
  @ApiPropertyOptional({ description: 'IBAN du débiteur', example: 'FR76 3000 6000 0112 3456 7890 189' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}\d{2}\s?[\dA-Z]{4}(\s?[\dA-Z]{4}){2,7}\s?[\dA-Z]{1,4}$/, {
    message: 'Format IBAN invalide',
  })
  iban?: string;

  @ApiPropertyOptional({ description: 'BIC/SWIFT', example: 'BNPAFRPP' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, {
    message: 'Format BIC invalide (8 ou 11 caractères)',
  })
  bic?: string;

  @ApiPropertyOptional({ description: 'Nom du titulaire du compte', example: 'Jean Dupont' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  titulaire?: string;
}
