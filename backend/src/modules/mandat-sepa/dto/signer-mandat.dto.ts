import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignerMandatDto {
  @ApiProperty({ description: 'IBAN du débiteur', example: 'FR76 3000 6000 0112 3456 7890 189' })
  @IsNotEmpty({ message: 'L\'IBAN est obligatoire' })
  @IsString()
  @Matches(/^[A-Z]{2}\d{2}\s?[\dA-Z]{4}(\s?[\dA-Z]{4}){2,7}\s?[\dA-Z]{1,4}$/, {
    message: 'Format IBAN invalide',
  })
  iban: string;

  @ApiProperty({ description: 'BIC/SWIFT', example: 'BNPAFRPP' })
  @IsNotEmpty({ message: 'Le BIC est obligatoire' })
  @IsString()
  @Matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, {
    message: 'Format BIC invalide (8 ou 11 caractères)',
  })
  bic: string;

  @ApiProperty({ description: 'Nom du titulaire du compte', example: 'Jean Dupont' })
  @IsNotEmpty({ message: 'Le nom du titulaire est obligatoire' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  titulaire: string;

  @ApiProperty({ description: 'Signature électronique (base64 PNG)' })
  @IsNotEmpty({ message: 'La signature est obligatoire' })
  @IsString()
  @MaxLength(500000)
  signatureData: string;
}
