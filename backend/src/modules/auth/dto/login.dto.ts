import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'parent@email.fr' })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @IsNotEmpty({ message: 'Mot de passe requis' })
  @MinLength(8, { message: 'Mot de passe trop court (min 8 caractères)' })
  password: string;
}

