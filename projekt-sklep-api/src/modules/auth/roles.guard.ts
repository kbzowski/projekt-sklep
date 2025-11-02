import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';

import { Role } from './role.enum';

/**
 * Guard fabrykujący (factory guard) implementujący autoryzację opartą na rolach użytkownika.
 *
 * RolesGuard wykorzystuje wzorzec Mixin do dynamicznego tworzenia klas Guard
 * z różnymi wymaganiami dotyczącymi ról. Każde wywołanie RolesGuard(...roles)
 * tworzy nową klasę dziedziczącą po CanActivate.
 *
 * Czym jest Mixin?
 * Mixin to wzorzec projektowy pozwalający na dynamiczne tworzenie klas
 * przez łączenie (mixowanie) funkcjonalności. W TypeScript/JavaScript
 * mixiny są implementowane jako funkcje zwracające klasy.
 *
 * Przykład użycia:
 * @UseGuards(TokenGuard, RolesGuard(Role.ADMIN))
 * async deleteUser() { ... }
 *
 * Proces autoryzacji z TokenGuard i RolesGuard:
 * 1. TokenGuard weryfikuje JWT i ustawia request.userId oraz request.role
 * 2. RolesGuard sprawdza czy request.role jest w dozwolonych rolach
 * 3. Jeśli rola pasuje, zwraca true i pozwala na wykonanie handlera
 * 4. Jeśli rola nie pasuje, zwraca false i NestJS rzuca ForbiddenException
 *
 * Uwaga: W pełnej implementacji należałoby:
 * - Dodać pole 'role' do modelu User w bazie danych (prisma schema)
 * - Pobierać rolę z bazy podczas logowania
 * - Przekazać rolę do TokenService.createAccessToken() w AuthController
 *
 * @param roles - Role wymagane do dostępu do zasobu (np. Role.ADMIN)
 * @returns Klasa Guard sprawdzająca czy użytkownik ma odpowiednią rolę
 *
 * @see Role - Enum z możliwymi rolami użytkowników
 * @see TokenGuard - Guard który powinien być użyty przed RolesGuard
 */
export const RolesGuard = (...roles: Role[]): Type<CanActivate> => {
  /**
   * Wewnętrzna klasa implementująca logikę sprawdzania ról.
   *
   * Klasa ta ma dostęp do 'roles' przez closure (domknięcie).
   * Każde wywołanie RolesGuard(...roles) tworzy nową klasę z innymi rolami.
   */
  class RoleGuardMixin implements CanActivate {
    /**
     * Sprawdza czy użytkownik ma odpowiednią rolę do dostępu do zasobu.
     *
     * Wymagania:
     * - TokenGuard musi być użyty przed RolesGuard (aby ustawić request.role)
     *
     * @param context - Kontekst wykonania NestJS zawierający request
     * @returns boolean - true jeśli użytkownik ma odpowiednią rolę, false w przeciwnym razie
     */
    canActivate(context: ExecutionContext): boolean {
      // Jeśli nie podano żadnych ról, dozwolony jest dostęp dla wszystkich
      // (użyteczne dla endpointów które wymagają tylko uwierzytelnienia bez autoryzacji)
      if (!roles || roles.length === 0) return true;

      // Pobieramy obiekt request z kontekstu NestJS
      const request = context.switchToHttp().getRequest();

      // Wyciągamy rolę użytkownika z request (ustawioną przez TokenGuard)
      // TokenGuard weryfikuje JWT i zapisuje request.role z payloadu tokenu
      const userRole: Role = request.role;

      // Sprawdzamy czy request.role istnieje (defensive programming)
      // Jeśli nie istnieje, oznacza to że TokenGuard nie został użyty przed RolesGuard
      if (!userRole) {
        return false;
      }

      // Sprawdzamy czy rola użytkownika znajduje się w dozwolonych rolach
      // Zwracamy true jeśli użytkownik ma odpowiednią rolę, false w przeciwnym razie
      return roles.includes(userRole);
    }
  }

  // mixin() tworzy unikalną klasę z metadanymi dla NestJS dependency injection
  // Bez mixin() wszystkie instancje RolesGuard współdzieliłyby te same metadane
  return mixin(RoleGuardMixin);
};
