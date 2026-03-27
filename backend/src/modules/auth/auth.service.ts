import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        premiereConnexion: user.premiereConnexion,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return user;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.usersService.updatePassword(userId, hashedPassword);

    return {
      message: 'Mot de passe changé avec succès',
      premiereConnexion: updatedUser.premiereConnexion,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    // On retourne toujours le même message pour des raisons de sécurité
    // (ne pas révéler si l'email existe ou non)
    if (!user) {
      return { message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' };
    }

    // Pattern OWASP selector/verifier : le selector permet le lookup en BDD,
    // le verifier est hashé (bcrypt) pour résister à une fuite de la table.
    const selector = crypto.randomBytes(16).toString('hex');
    const verifier = crypto.randomBytes(32).toString('hex');
    const hashedVerifier = await bcrypt.hash(verifier, 10);

    await this.usersService.setResetToken(user.id, selector, hashedVerifier);

    // Le lien envoyé contient selector + verifier en clair
    const resetToken = `${selector}.${verifier}`;
    await this.emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name || user.prenom || 'Utilisateur',
    );

    return { message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Token format : selector.verifier
    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new BadRequestException('Lien invalide ou expiré');
    }
    const [selector, verifier] = parts;

    const user = await this.usersService.findByResetSelector(selector);
    if (!user || !user.rememberToken) {
      throw new BadRequestException('Lien invalide ou expiré');
    }

    // Vérifier le hash du vérifieur
    const isValid = await bcrypt.compare(verifier, user.rememberToken);
    if (!isValid) {
      throw new BadRequestException('Lien invalide ou expiré');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.resetPasswordWithToken(user.id, hashedPassword);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async deleteAccount(userId: number, password: string) {
    // Vérifier le mot de passe avant suppression
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe incorrect. La suppression nécessite votre mot de passe actuel.');
    }

    // Supprimer les fichiers physiques des justificatifs avant la cascade SQL
    const enfants = await this.prisma.enfant.findMany({
      where: { OR: [{ parent1Id: userId }, { parent2Id: userId }] },
      select: { id: true },
    });

    const enfantIds = enfants.map(e => e.id);

    if (enfantIds.length > 0) {
      const justificatifs = await this.prisma.justificatif.findMany({
        where: { enfantId: { in: enfantIds } },
        select: { fichierUrl: true },
      });

      // Supprimer les fichiers physiques
      const { join } = await import('path');
      const { existsSync, unlinkSync } = await import('fs');
      for (const j of justificatifs) {
        const filePath = join(process.cwd(), 'uploads', j.fichierUrl);
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
          } catch (err) {
            this.logger.warn(`Impossible de supprimer le fichier ${filePath}: ${err}`);
          }
        }
      }
    }

    // Supprimer le user — les enfants et sous-données cascadent via onDelete: Cascade
    await this.prisma.user.delete({ where: { id: userId } });

    this.logger.log(`Compte #${userId} supprimé (droit à l'effacement RGPD)`);

    return { message: 'Votre compte et toutes vos données ont été supprimés définitivement.' };
  }
}

