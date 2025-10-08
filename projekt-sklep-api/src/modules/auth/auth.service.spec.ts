import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { AuthService } from './auth.service';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword',
  createdAt: new Date(),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('argon2', () => ({
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService, typeof mockPrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyUser', () => {
    it('should return user when credentials are valid', async () => {
      const argon2 = require('argon2');
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      argon2.verify.mockResolvedValue(true);

      const result = await service.verifyUser('test@example.com', 'correctPassword');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.verifyUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const argon2 = require('argon2');
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      argon2.verify.mockResolvedValue(false);

      const result = await service.verifyUser('test@example.com', 'wrongPassword');

      expect(result).toBeNull();
    });
  });
});