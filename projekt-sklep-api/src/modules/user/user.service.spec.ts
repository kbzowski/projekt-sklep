import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { UserService } from './user.service';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}; 

jest.mock('argon2', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prismaService: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService, typeof mockPrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const argon2 = require('argon2');
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
      const createUserDto = { email: 'test@example.com', name: 'Test', password: 'password' };

      argon2.hash.mockResolvedValue('hashedPassword');
      prismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(argon2.hash).toHaveBeenCalledWith(createUserDto.password);
    });

    it('should throw ConflictException on duplicate email', async () => {
      const argon2 = require('argon2');
      const createUserDto = { email: 'test@example.com', name: 'Test', password: 'password' };
      const error = new Error('Duplicate');
      (error as any).code = 'P2002';

      argon2.hash.mockResolvedValue('hashedPassword');
      prismaService.user.create.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should find user by id', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test' };
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });
});