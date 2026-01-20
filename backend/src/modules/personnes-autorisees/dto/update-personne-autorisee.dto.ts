import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePersonneAutoriseeDto } from './create-personne-autorisee.dto';

export class UpdatePersonneAutoriseeDto extends PartialType(
  OmitType(CreatePersonneAutoriseeDto, ['enfantId'] as const),
) {}
