import { ExecutionContext } from '@nestjs/common';

import { Role } from './role.enum';
import { RolesGuard } from './roles.guard';

/**
 * Testy jednostkowe dla RolesGuard
 *
 * RolesGuard jest guard fabrykującym (factory guard) wykorzystującym mixin,
 * dlatego każdy test tworzy nową instancję guarda z różnymi rolami.
 */

// Helper: tworzy mock ExecutionContext z podaną rolą użytkownika
const createMockExecutionContext = (userRole?: Role): ExecutionContext => {
  const mockRequest = {
    userId: 1,
    role: userRole,
  };

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
  } as unknown as ExecutionContext;
};

describe('RolesGuard', () => {
  describe('Mixin pattern', () => {
    it('should create different guard classes for different roles', () => {
      // Arrange: tworzymy dwa guardy z różnymi rolami
      const AdminGuard = RolesGuard(Role.ADMIN);
      const UserGuard = RolesGuard(Role.USER);

      // Act: tworzymy instancje guardów
      const adminGuardInstance = new AdminGuard();
      const userGuardInstance = new UserGuard();

      // Assert: sprawdzamy czy guardy są różnymi klasami
      // Każdy guard powinien być unikalną klasą przez mixin()
      expect(adminGuardInstance).toBeDefined();
      expect(userGuardInstance).toBeDefined();
      expect(adminGuardInstance.constructor).not.toBe(
        userGuardInstance.constructor,
      );
    });

    it('should implement CanActivate interface', () => {
      // Arrange: tworzymy guard
      const AdminGuard = RolesGuard(Role.ADMIN);
      const guard = new AdminGuard();

      // Assert: sprawdzamy czy guard ma metodę canActivate
      expect(guard.canActivate).toBeDefined();
      expect(typeof guard.canActivate).toBe('function');
    });
  });

  describe('canActivate - autoryzacja z pojedynczą rolą', () => {
    it('should return true when user has ADMIN role and ADMIN is required', () => {
      // Arrange: użytkownik z rolą ADMIN, guard wymaga ADMIN
      const AdminGuard = RolesGuard(Role.ADMIN);
      const guard = new AdminGuard();
      const context = createMockExecutionContext(Role.ADMIN);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: autoryzacja powinna się powieść
      expect(result).toBe(true);
    });

    it('should return true when user has USER role and USER is required', () => {
      // Arrange: użytkownik z rolą USER, guard wymaga USER
      const UserGuard = RolesGuard(Role.USER);
      const guard = new UserGuard();
      const context = createMockExecutionContext(Role.USER);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: autoryzacja powinna się powieść
      expect(result).toBe(true);
    });

    it('should return false when user has USER role but ADMIN is required', () => {
      // Arrange: użytkownik z rolą USER, guard wymaga ADMIN
      const AdminGuard = RolesGuard(Role.ADMIN);
      const guard = new AdminGuard();
      const context = createMockExecutionContext(Role.USER);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: autoryzacja powinna się nie powieść
      expect(result).toBe(false);
    });

    it('should return false when user has ADMIN role but USER is required', () => {
      // Arrange: użytkownik z rolą ADMIN, guard wymaga USER
      const UserGuard = RolesGuard(Role.USER);
      const guard = new UserGuard();
      const context = createMockExecutionContext(Role.ADMIN);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: autoryzacja powinna się nie powieść
      expect(result).toBe(false);
    });
  });

  describe('canActivate - autoryzacja z wieloma rolami', () => {
    it('should return true when user has ADMIN role and ADMIN or USER is required', () => {
      // Arrange: użytkownik z rolą ADMIN, guard akceptuje ADMIN lub USER
      const MultiRoleGuard = RolesGuard(Role.ADMIN, Role.USER);
      const guard = new MultiRoleGuard();
      const context = createMockExecutionContext(Role.ADMIN);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: autoryzacja powinna się powieść
      expect(result).toBe(true);
    });

    it('should return true when user has USER role and ADMIN or USER is required', () => {
      // Arrange: użytkownik z rolą USER, guard akceptuje ADMIN lub USER
      const MultiRoleGuard = RolesGuard(Role.ADMIN, Role.USER);
      const guard = new MultiRoleGuard();
      const context = createMockExecutionContext(Role.USER);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: autoryzacja powinna się powieść
      expect(result).toBe(true);
    });
  });

  describe('canActivate - brak wymaganych ról', () => {
    it('should return true when no roles are specified (empty array)', () => {
      // Arrange: guard bez wymaganych ról (dozwolone dla wszystkich)
      const NoRolesGuard = RolesGuard();
      const guard = new NoRolesGuard();
      const context = createMockExecutionContext(Role.USER);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: autoryzacja powinna się powieść (brak ograniczeń)
      expect(result).toBe(true);
    });

    it('should return false when role is missing from request', () => {
      // Arrange: request bez roli (TokenGuard nie został użyty)
      const AdminGuard = RolesGuard(Role.ADMIN);
      const guard = new AdminGuard();
      const context = createMockExecutionContext(undefined);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: autoryzacja powinna się nie powieść
      expect(result).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should use closure to capture roles for each guard instance', () => {
      // Arrange: tworzymy dwa guardy z różnymi rolami
      const AdminGuard = RolesGuard(Role.ADMIN);
      const UserGuard = RolesGuard(Role.USER);

      const adminGuard = new AdminGuard();
      const userGuard = new UserGuard();

      const adminContext = createMockExecutionContext(Role.ADMIN);
      const userContext = createMockExecutionContext(Role.USER);

      // Act: sprawdzamy czy guardy używają swoich własnych ról (przez closure)
      const adminResult = adminGuard.canActivate(adminContext);
      const userResult = userGuard.canActivate(userContext);
      const adminAsUserResult = adminGuard.canActivate(userContext);
      const userAsAdminResult = userGuard.canActivate(adminContext);

      // Assert: każdy guard powinien używać swoich ról zdefiniowanych w closure
      expect(adminResult).toBe(true); // ADMIN guard z ADMIN user
      expect(userResult).toBe(true); // USER guard z USER user
      expect(adminAsUserResult).toBe(false); // ADMIN guard z USER user (brak dostępu)
      expect(userAsAdminResult).toBe(false); // USER guard z ADMIN user (brak dostępu)
    });

    it('should handle duplicate roles in the roles array', () => {
      // Arrange: guard z duplikującymi się rolami
      const DuplicateRolesGuard = RolesGuard(Role.ADMIN, Role.ADMIN, Role.USER);
      const guard = new DuplicateRolesGuard();
      const context = createMockExecutionContext(Role.ADMIN);

      // Act: wywołujemy guard
      const result = guard.canActivate(context);

      // Assert: guard powinien normalnie działać mimo duplikatów
      expect(result).toBe(true);
    });
  });
});
