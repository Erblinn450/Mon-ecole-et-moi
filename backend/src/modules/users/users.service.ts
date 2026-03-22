import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.UserCreateInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    const { password: _, ...user } = await this.prisma.user.create({ data });
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        nom: true,
        prenom: true,
        telephone: true,
        role: true,
        actif: true,
        createdAt: true,
        frequencePaiement: true,
        modePaiementPref: true,
        reductionRFR: true,
        tauxReductionRFR: true,
        destinataireFacture: true,
        enfantsParent1: {
          select: { id: true, nom: true, prenom: true, classe: true },
        },
      },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        nom: true,
        prenom: true,
        telephone: true,
        adresse: true,
        role: true,
        actif: true,
        premiereConnexion: true,
        modePaiementPref: true,
        frequencePaiement: true,
        reductionRFR: true,
        tauxReductionRFR: true,
        destinataireFacture: true,
        ibanParent: true,
        mandatSepaRef: true,
        createdAt: true,
        enfantsParent1: {
          select: { id: true, nom: true, prenom: true, classe: true, dateNaissance: true },
        },
        enfantsParent2: {
          select: { id: true, nom: true, prenom: true, classe: true, dateNaissance: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async findByIdWithPassword(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    const { password: _, ...user } = await this.prisma.user.update({
      where: { id },
      data,
    });
    return user;
  }

  async remove(id: number) {
    const { password: _, ...user } = await this.prisma.user.delete({
      where: { id },
    });
    return user;
  }

  async updateMyProfile(id: number, dto: UpdateMyProfileDto) {
    // Si changement d'email, vérifier qu'il n'est pas déjà pris
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Cet email est déjà utilisé par un autre compte');
      }
    }

    const { password: _, ...user } = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.nom !== undefined && { nom: dto.nom }),
        ...(dto.prenom !== undefined && { prenom: dto.prenom }),
        ...(dto.telephone !== undefined && { telephone: dto.telephone }),
        ...(dto.adresse !== undefined && { adresse: dto.adresse }),
        ...(dto.email !== undefined && { email: dto.email }),
        // Mettre à jour name aussi pour cohérence
        ...(dto.nom !== undefined || dto.prenom !== undefined
          ? { name: `${dto.prenom ?? ''} ${dto.nom ?? ''}`.trim() }
          : {}),
      },
    });
    return user;
  }

  async updatePassword(id: number, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        premiereConnexion: false,
        tokenVersion: { increment: 1 },
      },
    });
  }

  async getParents() {
    return this.prisma.user.findMany({
      where: { role: Role.PARENT, actif: true },
      select: {
        id: true,
        email: true,
        name: true,
        nom: true,
        prenom: true,
        telephone: true,
        createdAt: true,
        enfantsParent1: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            classe: true,
          },
        },
      },
    });
  }

  async setResetToken(id: number, selector: string, hashedVerifier: string) {
    // Token expire dans 1 heure
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    return this.prisma.user.update({
      where: { id },
      data: {
        resetTokenSelector: selector,
        rememberToken: hashedVerifier,
        resetTokenExpiresAt: expiresAt,
      },
    });
  }

  async findByResetSelector(selector: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetTokenSelector: selector },
      select: {
        id: true,
        rememberToken: true,
        resetTokenExpiresAt: true,
      },
    });

    // Vérifier si le token a expiré
    if (user && user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
      return null; // Token expiré
    }

    return user;
  }

  async resetPasswordWithToken(id: number, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        rememberToken: null,
        resetTokenSelector: null,
        resetTokenExpiresAt: null,
        premiereConnexion: false,
        tokenVersion: { increment: 1 },
      },
    });
  }

  async adminResetPassword(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    // Générer un mot de passe temporaire de 12 caractères
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let temporaryPassword = '';
    for (let i = 0; i < 12; i++) {
      temporaryPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        premiereConnexion: true,
        tokenVersion: { increment: 1 },
      },
    });

    return { temporaryPassword };
  }

  async toggleActive(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const { password: _, ...updated } = await this.prisma.user.update({
      where: { id },
      data: { actif: !user.actif },
    });
    return updated;
  }
}

