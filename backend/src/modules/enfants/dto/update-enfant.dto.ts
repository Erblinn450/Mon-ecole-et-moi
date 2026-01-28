import { PartialType } from '@nestjs/swagger';
import { CreateEnfantDto } from './create-enfant.dto';

export class UpdateEnfantDto extends PartialType(CreateEnfantDto) {}
