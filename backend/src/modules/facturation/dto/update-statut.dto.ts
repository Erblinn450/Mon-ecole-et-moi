import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutFacture } from '@prisma/client';

export class UpdateStatutDto {
  @ApiProperty({ description: 'Nouveau statut de la facture', enum: StatutFacture })
  @IsEnum(StatutFacture)
  statut: StatutFacture;

  @ApiPropertyOptional({ description: 'Commentaire sur le changement de statut' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commentaire?: string;
}
