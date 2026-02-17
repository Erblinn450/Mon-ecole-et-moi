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

    return this.prisma.user.create({ data });
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
      include: {
        enfantsParent1: true,
        enfantsParent2: true,
      },
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
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
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

  async setResetToken(id: number, token: string) {
    // Token expire dans 1 heure
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    return this.prisma.user.update({
      where: { id },
      data: {
        rememberToken: token,
        resetTokenExpiresAt: expiresAt,
      },
    });
  }

  async findByResetToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { rememberToken: token },
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
        rememberToken: null, // Clear the token
        resetTokenExpiresAt: null, // Clear expiration
        premiereConnexion: false,
      },
    });
  }
}

