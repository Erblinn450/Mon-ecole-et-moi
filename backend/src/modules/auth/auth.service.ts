import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
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

    const { password: _, ...result } = user;

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: result,
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    const { password: _, ...result } = user;
    return result;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Valider le nouveau mot de passe
    if (newPassword.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    // Hasher et mettre à jour
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.usersService.updatePassword(userId, hashedPassword);

    console.log(`[AUTH] Mot de passe changé pour user ${userId}, premiereConnexion = ${updatedUser.premiereConnexion}`);

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

    // Générer un token unique
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Sauvegarder le token
    await this.usersService.setResetToken(user.id, resetToken);

    // Envoyer l'email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name || user.prenom || 'Utilisateur',
    );

    return { message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Trouver l'utilisateur avec ce token
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException('Lien invalide ou expiré');
    }

    // Valider le nouveau mot de passe
    if (newPassword.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    // Hasher et mettre à jour
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.resetPasswordWithToken(user.id, hashedPassword);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}

