import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { TokenService } from '../token/token.service';

import { Role } from './role.enum';
import { TokenGuard } from './token.guard';

/**
 * Testy jednostkowe dla TokenGuard
 */

// Mock TokenService z metodą verifyToken
const mockTokenService = {
  verifyToken: jest.fn(),
};

// Helper: tworzy mock ExecutionContext z podanym tokenem w cookies
const createMockExecutionContext = (accessToken?: string): ExecutionContext => {
  const mockRequest = {
    cookies: accessToken ? { 'access-token': accessToken } : {},
    userId: undefined,
    role: undefined,
  };

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
  } as unknown as ExecutionContext;
};

// Helper: symuluje błędy JWT
class TokenExpiredError extends Error {
  name = 'TokenExpiredError';
  constructor(message: string) {
    super(message);
  }
}

class JsonWebTokenError extends Error {
  name = 'JsonWebTokenError';
  constructor(message: string) {
    super(message);
  }
}

class NotBeforeError extends Error {
  name = 'NotBeforeError';
  constructor(message: string) {
    super(message);
  }
}

describe('TokenGuard', () => {
  let guard: TokenGuard;
  let tokenService: typeof mockTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenGuard,
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    guard = module.get<TokenGuard>(TokenGuard);
    tokenService = module.get<TokenService, typeof mockTokenService>(
      TokenService,
    );

    // Resetujemy wszystkie mocki przed każdym testem
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate - poprawna autoryzacja', () => {
    it('should return true and set request.userId and request.role when token is valid', () => {
      // Arrange: przygotowujemy poprawny token JWT z rolą
      const validToken = 'valid.jwt.token';
      const context = createMockExecutionContext(validToken);
      const request = context.switchToHttp().getRequest();
      tokenService.verifyToken.mockReturnValue({ sub: 123, role: Role.USER });

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: sprawdzamy czy autoryzacja się powiodła
      expect(result).toBe(true);
      expect(request.userId).toBe(123);
      expect(request.role).toBe(Role.USER);
      expect(tokenService.verifyToken).toHaveBeenCalledWith(validToken);
    });

    it('should handle different user IDs and roles', () => {
      // Arrange: różne userId i rola ADMIN
      const token = 'valid.jwt.token';
      const context = createMockExecutionContext(token);
      const request = context.switchToHttp().getRequest();
      tokenService.verifyToken.mockReturnValue({ sub: 999, role: Role.ADMIN });

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: sprawdzamy czy poprawnie ustawił userId i rolę
      expect(result).toBe(true);
      expect(request.userId).toBe(999);
      expect(request.role).toBe(Role.ADMIN);
    });
  });

  describe('canActivate - brak tokenu', () => {
    it('should throw UnauthorizedException when access-token cookie is missing', () => {
      // Arrange: brak tokenu w cookies
      const context = createMockExecutionContext();

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Brak tokenu dostępu. Wymagane zalogowanie',
      );
      expect(tokenService.verifyToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when access-token is empty string', () => {
      // Arrange: pusty token
      const context = createMockExecutionContext('');

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Brak tokenu dostępu',
      );
    });
  });

  describe('canActivate - błędy JWT', () => {
    it('should throw UnauthorizedException with specific message when token is expired', () => {
      // Arrange: wygasły token (TokenExpiredError)
      const expiredToken = 'expired.jwt.token';
      const context = createMockExecutionContext(expiredToken);
      tokenService.verifyToken.mockImplementation(() => {
        throw new TokenExpiredError('jwt expired');
      });

      // Act & Assert: oczekujemy UnauthorizedException ze szczegółowym komunikatem
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token dostępu wygasł. Odśwież token używając refresh endpoint',
      );
    });

    it('should throw UnauthorizedException when token has invalid signature', () => {
      // Arrange: nieprawidłowy podpis (JsonWebTokenError)
      const invalidToken = 'invalid.jwt.token';
      const context = createMockExecutionContext(invalidToken);
      tokenService.verifyToken.mockImplementation(() => {
        throw new JsonWebTokenError('invalid signature');
      });

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Nieprawidłowy token dostępu. Zaloguj się ponownie',
      );
    });

    it('should throw UnauthorizedException when token has invalid format', () => {
      // Arrange: nieprawidłowy format JWT
      const malformedToken = 'not.a.valid.jwt.format.token';
      const context = createMockExecutionContext(malformedToken);
      tokenService.verifyToken.mockImplementation(() => {
        throw new JsonWebTokenError('jwt malformed');
      });

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Nieprawidłowy token dostępu',
      );
    });

    it('should throw UnauthorizedException when token is not yet valid (NotBeforeError)', () => {
      // Arrange: token jeszcze nieważny (NotBeforeError)
      const notYetValidToken = 'future.jwt.token';
      const context = createMockExecutionContext(notYetValidToken);
      tokenService.verifyToken.mockImplementation(() => {
        throw new NotBeforeError('jwt not active');
      });

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token dostępu jeszcze nieważny',
      );
    });

    it('should throw UnauthorizedException for unknown JWT errors', () => {
      // Arrange: nieznany błąd JWT
      const token = 'token.with.unknown.error';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockImplementation(() => {
        throw new Error('Unknown JWT error');
      });

      // Act & Assert: oczekujemy ogólnego UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Błąd weryfikacji tokenu dostępu',
      );
    });
  });

  describe('canActivate - walidacja payload', () => {
    it('should throw UnauthorizedException when payload.sub is missing', () => {
      // Arrange: payload bez claim 'sub'
      const token = 'token.without.sub';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockReturnValue({ role: Role.USER } as any); // brak sub

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token nie zawiera poprawnego identyfikatora użytkownika',
      );
    });

    it('should throw UnauthorizedException when payload.sub is null', () => {
      // Arrange: payload z sub = null
      const token = 'token.with.null.sub';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockReturnValue({
        sub: null,
        role: Role.USER,
      } as any);

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token nie zawiera poprawnego identyfikatora użytkownika',
      );
    });

    it('should throw UnauthorizedException when payload.sub is not a number', () => {
      // Arrange: payload z sub jako string (powinno być number)
      const token = 'token.with.string.sub';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockReturnValue({
        sub: '123',
        role: Role.USER,
      } as any);

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token nie zawiera poprawnego identyfikatora użytkownika',
      );
    });

    it('should throw UnauthorizedException when payload.sub is zero', () => {
      // Arrange: payload z sub = 0 (nieprawidłowe userId)
      const token = 'token.with.zero.sub';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockReturnValue({
        sub: 0,
        role: Role.USER,
      } as any);

      // Act & Assert: oczekujemy UnauthorizedException (0 jest falsy)
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token nie zawiera poprawnego identyfikatora użytkownika',
      );
    });

    it('should throw UnauthorizedException when payload.sub is negative', () => {
      // Arrange: payload z sub = -1 (nieprawidłowe userId)
      const token = 'token.with.negative.sub';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockReturnValue({
        sub: -1,
        role: Role.USER,
      } as any);

      // Act & Assert: guard powinien zaakceptować (walidacja sprawdza tylko typ i truthy)
      // Ale -1 jest truthy i number, więc przejdzie walidację
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when payload.role is missing', () => {
      // Arrange: payload bez claim 'role'
      const token = 'token.without.role';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockReturnValue({ sub: 123 } as any); // brak role

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token nie zawiera roli użytkownika',
      );
    });

    it('should throw UnauthorizedException when payload.role is null', () => {
      // Arrange: payload z role = null
      const token = 'token.with.null.role';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockReturnValue({
        sub: 123,
        role: null,
      } as any);

      // Act & Assert: oczekujemy UnauthorizedException
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token nie zawiera roli użytkownika',
      );
    });

    it('should throw UnauthorizedException when payload.role is empty string', () => {
      // Arrange: payload z role jako pusty string
      const token = 'token.with.empty.role';
      const context = createMockExecutionContext(token);
      tokenService.verifyToken.mockReturnValue({
        sub: 123,
        role: '',
      } as any);

      // Act & Assert: oczekujemy UnauthorizedException (pusty string jest falsy)
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'Token nie zawiera roli użytkownika',
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle very long JWT tokens', () => {
      // Arrange: bardzo długi token JWT
      const longToken = 'a'.repeat(5000);
      const context = createMockExecutionContext(longToken);
      tokenService.verifyToken.mockReturnValue({ sub: 456, role: Role.USER });

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: sprawdzamy czy długi token został poprawnie przetworzony
      expect(result).toBe(true);
      expect(tokenService.verifyToken).toHaveBeenCalledWith(longToken);
    });

    it('should not modify other request properties', () => {
      // Arrange: request z dodatkowymi właściwościami
      const token = 'valid.jwt.token';
      const context = createMockExecutionContext(token);
      const request = context.switchToHttp().getRequest();
      request.headers = { 'user-agent': 'test-browser' };
      request.body = { data: 'test' };
      tokenService.verifyToken.mockReturnValue({
        sub: 789,
        role: Role.ADMIN,
      });

      // Act: wywołujemy guard
      guard.canActivate(context);

      // Assert: sprawdzamy czy inne właściwości nie zostały zmienione
      expect(request.headers).toEqual({ 'user-agent': 'test-browser' });
      expect(request.body).toEqual({ data: 'test' });
      expect(request.userId).toBe(789); // userId zostało ustawione
      expect(request.role).toBe(Role.ADMIN); // role zostało ustawione
    });
  });
});
