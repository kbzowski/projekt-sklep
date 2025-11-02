import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Role } from '../auth/role.enum';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Tworzy token dostępu (access token) JWT dla użytkownika.
   *
   * Token zawiera:
   * - sub: ID użytkownika
   * - role: Rola użytkownika (domyślnie USER)
   * - exp: Czas wygaśnięcia (15 minut)
   *
   * Uwaga: Rola powinna być pobierana z bazy danych.
   * Obecna implementacja używa domyślnej roli USER dla celów demonstracyjnych.
   * Zadanie dla studentów: rozszerzyć model User o pole role i pobierać je z bazy.
   *
   * @param userId - ID użytkownika
   * @param role - Rola użytkownika (domyślnie Role.USER)
   * @returns Podpisany token JWT
   */
  createAccessToken(userId: number, role: Role = Role.USER): string {
    return this.jwtService.sign(
      { sub: userId, role },
      { expiresIn: '15m' },
    );
  }

  async createRefreshToken(userId: number): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dni

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Weryfikuje token JWT i zwraca jego payload.
   *
   * Payload zawiera:
   * - sub: ID użytkownika
   * - role: Rola użytkownika
   *
   * @param token - Token JWT do weryfikacji
   * @returns Payload tokenu z userId i rolą
   * @throws JsonWebTokenError - gdy token jest nieprawidłowy
   * @throws TokenExpiredError - gdy token wygasł
   */
  verifyToken(token: string): { sub: number; role: Role } {
    return this.jwtService.verify(token);
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }
}
