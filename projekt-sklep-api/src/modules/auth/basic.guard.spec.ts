import {
  BadRequestException,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { BasicGuard } from './basic.guard';

/**
 * Testy jednostkowe dla BasicGuard
 */

// Mock użytkownika zwracanego przez AuthService.verifyUser()
const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword',
  createdAt: new Date(),
};

// Mock AuthService z metodą verifyUser
const mockAuthService = {
  verifyUser: jest.fn(),
};

// Helper: tworzy mock ExecutionContext z podanym nagłówkiem Authorization
const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
  const mockRequest = {
    headers: authHeader ? { authorization: authHeader } : {},
    userId: undefined,
  };

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
  } as unknown as ExecutionContext;
};

// Helper: koduje email:hasło do formatu Base64 dla Basic Auth
const encodeBasicAuth = (email: string, password: string): string => {
  const credentials = `${email}:${password}`;
  const base64 = Buffer.from(credentials, 'utf-8').toString('base64');
  return `Basic ${base64}`;
};

describe('BasicGuard', () => {
  let guard: BasicGuard;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BasicGuard,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    guard = module.get<BasicGuard>(BasicGuard);
    authService = module.get<AuthService, typeof mockAuthService>(AuthService);

    // Resetujemy wszystkie mocki przed każdym testem
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate - poprawna autentykacja', () => {
    it('should return true and set request.userId when credentials are valid', async () => {
      // Arrange: przygotowujemy poprawne dane
      const authHeader = encodeBasicAuth('test@example.com', 'password123');
      const context = createMockExecutionContext(authHeader);
      const request = context.switchToHttp().getRequest();
      authService.verifyUser.mockResolvedValue(mockUser);

      // Act: wywołujemy guard
      const result = await guard.canActivate(context);

      // Assert: sprawdzamy czy autentykacja się powiodła
      expect(result).toBe(true);
      expect(request.userId).toBe(1);
      expect(authService.verifyUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('should handle passwords with colon character', async () => {
      // Arrange: hasło z dwukropkiem (pass:word:123)
      const authHeader = encodeBasicAuth('user@test.com', 'pass:word:123');
      const context = createMockExecutionContext(authHeader);
      authService.verifyUser.mockResolvedValue(mockUser);

      // Act: wywołujemy guard
      const result = await guard.canActivate(context);

      // Assert: sprawdzamy czy hasło z dwukropkiem zostało poprawnie zdekodowane
      expect(result).toBe(true);
      expect(authService.verifyUser).toHaveBeenCalledWith(
        'user@test.com',
        'pass:word:123',
      );
    });

    it('should handle case-insensitive "Basic" prefix', async () => {
      // Arrange: nagłówek z małą literą "basic"
      const credentials = Buffer.from('test@example.com:password', 'utf-8').toString('base64');
      const authHeader = `basic ${credentials}`; // lowercase "basic"
      const context = createMockExecutionContext(authHeader);
      authService.verifyUser.mockResolvedValue(mockUser);

      // Act: wywołujemy guard
      const result = await guard.canActivate(context);

      // Assert: sprawdzamy czy guard zaakceptował lowercase "basic"
      expect(result).toBe(true);
      expect(authService.verifyUser).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      );
    });
  });

  describe('canActivate - błędy autentykacji (UnauthorizedException)', () => {
    it('should throw UnauthorizedException when Authorization header is missing', async () => {
      // Arrange: brak nagłówka Authorization
      const context = createMockExecutionContext();

      // Act & Assert: oczekujemy UnauthorizedException
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Brak nagłówka Authorization. Wymagane uwierzytelnienie Basic Auth',
      );
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange: nieprawidłowe dane logowania (verifyUser zwraca null)
      const authHeader = encodeBasicAuth('test@example.com', 'wrongPassword');
      const context = createMockExecutionContext(authHeader);
      authService.verifyUser.mockResolvedValue(null);

      // Act & Assert: oczekujemy UnauthorizedException
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Nieprawidłowy email lub hasło',
      );
    });
  });

  describe('canActivate - błędy formatu (BadRequestException)', () => {
    it('should throw BadRequestException when Authorization header does not start with "Basic "', async () => {
      // Arrange: nagłówek bez "Basic " prefix (np. Bearer token)
      const context = createMockExecutionContext('Bearer sometoken123');

      // Act & Assert: oczekujemy BadRequestException
      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Nieprawidłowy format nagłówka Authorization',
      );
    });

    it('should throw BadRequestException when Base64 part is empty', async () => {
      // Arrange: nagłówek "Basic " bez części Base64
      const context = createMockExecutionContext('Basic ');

      // Act & Assert: oczekujemy BadRequestException
      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Brak danych uwierzytelniających',
      );
    });

    it('should throw BadRequestException when decoded credentials lack colon', async () => {
      // Arrange: Base64 dekoduje się do "emailpassword" (brak dwukropka)
      const invalidCredentials = Buffer.from('emailpassword', 'utf-8').toString('base64');
      const context = createMockExecutionContext(`Basic ${invalidCredentials}`);

      // Act & Assert: oczekujemy BadRequestException
      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Nieprawidłowy format danych uwierzytelniających',
      );
    });

    it('should throw BadRequestException when email is empty', async () => {
      // Arrange: Base64 dekoduje się do ":password" (pusty email)
      const invalidCredentials = Buffer.from(':password123', 'utf-8').toString('base64');
      const context = createMockExecutionContext(`Basic ${invalidCredentials}`);

      // Act & Assert: oczekujemy BadRequestException
      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Email lub hasło nie mogą być puste',
      );
    });

    it('should throw BadRequestException when password is empty', async () => {
      // Arrange: Base64 dekoduje się do "test@example.com:" (puste hasło)
      const invalidCredentials = Buffer.from('test@example.com:', 'utf-8').toString('base64');
      const context = createMockExecutionContext(`Basic ${invalidCredentials}`);

      // Act & Assert: oczekujemy BadRequestException
      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Email lub hasło nie mogą być puste',
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle very long passwords', async () => {
      // Arrange: bardzo długie hasło (500 znaków)
      const longPassword = 'a'.repeat(500);
      const authHeader = encodeBasicAuth('test@example.com', longPassword);
      const context = createMockExecutionContext(authHeader);
      authService.verifyUser.mockResolvedValue(mockUser);

      // Act: wywołujemy guard
      const result = await guard.canActivate(context);

      // Assert: sprawdzamy czy długie hasło zostało poprawnie zdekodowane
      expect(result).toBe(true);
      expect(authService.verifyUser).toHaveBeenCalledWith(
        'test@example.com',
        longPassword,
      );
    });

    it('should handle special characters in password', async () => {
      // Arrange: hasło ze znakami specjalnymi
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const authHeader = encodeBasicAuth('test@example.com', specialPassword);
      const context = createMockExecutionContext(authHeader);
      authService.verifyUser.mockResolvedValue(mockUser);

      // Act: wywołujemy guard
      const result = await guard.canActivate(context);

      // Assert: sprawdzamy czy znaki specjalne zostały poprawnie zdekodowane
      expect(result).toBe(true);
      expect(authService.verifyUser).toHaveBeenCalledWith(
        'test@example.com',
        specialPassword,
      );
    });

    it('should handle UTF-8 characters in password', async () => {
      // Arrange: hasło z polskimi znakami
      const utf8Password = 'hasło123żółćąęśń';
      const authHeader = encodeBasicAuth('test@example.com', utf8Password);
      const context = createMockExecutionContext(authHeader);
      authService.verifyUser.mockResolvedValue(mockUser);

      // Act: wywołujemy guard
      const result = await guard.canActivate(context);

      // Assert: sprawdzamy czy znaki UTF-8 zostały poprawnie zdekodowane
      expect(result).toBe(true);
      expect(authService.verifyUser).toHaveBeenCalledWith(
        'test@example.com',
        utf8Password,
      );
    });
  });
});
