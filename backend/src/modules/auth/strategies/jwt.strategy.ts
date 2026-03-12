import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET must be defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: number; email: string; role: string; tokenVersion?: number }) {
    // Vérifier que le tokenVersion du JWT correspond à celui en BDD
    // Si le mot de passe a changé, tokenVersion est incrémenté et les anciens tokens sont invalidés
    if (payload.tokenVersion !== undefined) {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { tokenVersion: true, actif: true },
      });

      if (!user || !user.actif) {
        throw new UnauthorizedException('Compte désactivé ou inexistant');
      }

      if (user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
      }
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
