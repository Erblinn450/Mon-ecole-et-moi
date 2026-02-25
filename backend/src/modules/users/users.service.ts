import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

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
        role: true,
        actif: true,
        premiereConnexion: true,
        modePaiementPref: true,
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

  async updatePassword(id: number, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        premiereConnexion: false,
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
      },
    });
  }
}

