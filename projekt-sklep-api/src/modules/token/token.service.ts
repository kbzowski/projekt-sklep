import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  createAccessToken(userId: number): string {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '15m' });
  }

  // Test method - creates short-lived access token for testing
  createShortAccessToken(userId: number): string {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '5s' });
  }

  async createRefreshToken(userId: number): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  verifyToken(token: string): { sub: number } {
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

  async revokeAllRefreshTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  // Legacy method for backward compatibility
  createToken(userId: number): string {
    return this.createAccessToken(userId);
  }
}
