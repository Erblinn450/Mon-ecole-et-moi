import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, Matches, MinLength, MaxLength } from 'class-validator';

export class CreatePersonneAutoriseeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  enfantId: number;

  @ApiProperty({ example: 'Martin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(50)
  nom: string;

  @ApiProperty({ example: 'Marie' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(50)
  prenom: string;

  @ApiProperty({ example: '0612345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0[1-9][0-9]{8}$/, {
    message: 'Le numéro de téléphone doit être au format français (10 chiffres)',
  })
  telephone: string;

  @ApiPropertyOptional({ example: 'Grand-mère' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lienParente?: string;
}
