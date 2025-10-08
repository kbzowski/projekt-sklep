import { Test, TestingModule } from '@nestjs/testing';

import { TokenGuard } from '../auth/token.guard';
import { TokenService } from '../token/token.service';

import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
  create: jest.fn(),
  findOne: jest.fn(),
};
 
const mockTokenGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockTokenService = {
  verifyToken: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: typeof mockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: TokenGuard, useValue: mockTokenGuard },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService, typeof mockUserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create user and return UserDto', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
      };

      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result.password).toBeUndefined(); // Password should not be exposed
    });
  });

  describe('me (integration test)', () => {
    it('should return current user without password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
      };

      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.me(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result.password).toBeUndefined(); // Password should be excluded
    });
  });
});