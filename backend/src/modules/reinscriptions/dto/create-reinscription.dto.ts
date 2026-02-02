import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReinscriptionDto {
  @ApiProperty({ description: 'ID de l\'enfant à réinscrire' })
  @IsInt()
  @IsNotEmpty()
  enfantId: number;

  @ApiProperty({ description: 'Classe souhaitée pour l\'année prochaine', required: false })
  @IsString()
  @IsOptional()
  classeSouhaitee?: string;
}

export class CreateReinscriptionBulkDto {
  @ApiProperty({
    description: 'Liste des réinscriptions',
    type: [CreateReinscriptionDto]
  })
  @IsNotEmpty()
  reinscriptions: CreateReinscriptionDto[];
}
