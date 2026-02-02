import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';
import { Classe, SituationFamiliale } from '@prisma/client';

export class CreatePreinscriptionDto {
  // Enfant
  @ApiProperty({ example: 'Dupont' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  nomEnfant: string;

  @ApiProperty({ example: 'Marie' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le prénom ne peut pas dépasser 50 caractères' })
  prenomEnfant: string;

  @ApiProperty({ example: '2020-05-15' })
  @IsNotEmpty()
  @IsDateString()
  dateNaissance: string;

  @ApiPropertyOptional({ example: 'Mulhouse' })
  @IsOptional()
  @IsString()
  lieuNaissance?: string;

  @ApiPropertyOptional({ example: 'Française' })
  @IsOptional()
  @IsString()
  nationalite?: string;

  @ApiPropertyOptional({ example: 'Allergie aux arachides' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({ enum: Classe, example: 'MATERNELLE' })
  @IsNotEmpty()
  @IsEnum(Classe)
  classeSouhaitee: Classe;

  @ApiPropertyOptional({ example: 'École Jean Macé' })
  @IsOptional()
  @IsString()
  etablissementPrecedent?: string;

  @ApiPropertyOptional({ example: 'Grande Section' })
  @IsOptional()
  @IsString()
  classeActuelle?: string;

  // Parent 1
  @ApiPropertyOptional({ example: 'M.' })
  @IsOptional()
  @IsString()
  civiliteParent?: string;

  @ApiProperty({ example: 'Dupont' })
  @IsNotEmpty()
  @IsString()
  nomParent: string;

  @ApiProperty({ example: 'Jean' })
  @IsNotEmpty()
  @IsString()
  prenomParent: string;

  @ApiProperty({ example: 'jean.dupont@email.fr' })
  @IsNotEmpty()
  @IsEmail()
  emailParent: string;

  @ApiProperty({ example: '0612345678' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^0[1-9][0-9]{8}$/, {
    message: 'Le numéro de téléphone doit être au format français (10 chiffres)',
  })
  telephoneParent: string;

  @ApiPropertyOptional({ example: 'pere' })
  @IsOptional()
  @IsString()
  lienParente?: string;

  @ApiPropertyOptional({ example: '123 rue de la Paix, 68100 Mulhouse' })
  @IsOptional()
  @IsString()
  adresseParent?: string;

  @ApiPropertyOptional({ example: 'Ingénieur' })
  @IsOptional()
  @IsString()
  professionParent?: string;

  // Parent 2 (optionnel)
  @ApiPropertyOptional({ example: 'Mme' })
  @IsOptional()
  @IsString()
  civiliteParent2?: string;

  @ApiPropertyOptional({ example: 'Dupont' })
  @IsOptional()
  @IsString()
  nomParent2?: string;

  @ApiPropertyOptional({ example: 'Marie' })
  @IsOptional()
  @IsString()
  prenomParent2?: string;

  @ApiPropertyOptional({ example: 'marie.dupont@email.fr' })
  @IsOptional()
  @IsEmail()
  emailParent2?: string;

  @ApiPropertyOptional({ example: '0687654321' })
  @IsOptional()
  @IsString()
  @Matches(/^0[1-9][0-9]{8}$/, {
    message: 'Le numéro de téléphone doit être au format français (10 chiffres)',
  })
  telephoneParent2?: string;

  @ApiPropertyOptional({ example: 'mere' })
  @IsOptional()
  @IsString()
  lienParente2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresseParent2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  professionParent2?: string;

  // Dates et infos complémentaires
  @ApiPropertyOptional({ example: '2025-09-01' })
  @IsOptional()
  @IsDateString()
  dateIntegration?: string;

  @ApiPropertyOptional({ enum: SituationFamiliale })
  @IsOptional()
  @IsEnum(SituationFamiliale)
  situationFamiliale?: SituationFamiliale;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  decouverte?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attentesStructure?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pedagogieMontessori?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  difficultes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  situationAutre?: string;
}

