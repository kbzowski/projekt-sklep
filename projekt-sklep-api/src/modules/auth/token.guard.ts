import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { TokenService } from '../token/token.service';

/**
 * Guard implementujący uwierzytelnianie JWT (JSON Web Token).
 *
 * JWT to standard tokenu bezpieczeństwa używany do autoryzacji użytkowników
 * bez konieczności przesyłania hasła przy każdym żądaniu.
 *
 * Mechanizm działania:
 * 1. Token JWT jest przechowywany w httpOnly cookie 'access-token'
 * 2. Guard wyciąga token z cookies i weryfikuje jego podpis
 * 3. Jeśli token jest ważny, wyciąga userId z claim 'sub' (subject)
 * 4. Ustawia request.userId dla dostępu w kontrolerze
 *
 * Format JWT:
 * - Header: { alg: "HS256", typ: "JWT" }
 * - Payload: { sub: userId, iat: timestamp, exp: timestamp }
 * - Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
 *
 * Porównanie z BasicGuard:
 * - BasicGuard: wymaga wysłania email:hasło (Basic Auth) przy każdym żądaniu
 * - TokenGuard: wymaga tylko tokenu JWT (bezpieczniejsze, bez przesyłania hasła)
 *
 * Token dostępu (access token):
 * - Ważność: 15 minut
 * - Przechowywany: httpOnly cookie (chroni przed XSS)
 * - Po wygaśnięciu: wymaga odświeżenia przez /auth/refresh endpoint
 *
 * Użycie: Guard stosowany na chronionych endpointach (np. /cart, /profile)
 * które wymagają zalogowanego użytkownika.
 *
 * @see TokenService.verifyToken - Metoda weryfikująca podpis JWT
 * @see BasicGuard - Guard dla uwierzytelniania Basic Auth (login)
 */
@Injectable()
export class TokenGuard implements CanActivate {
  /**
   * Konstruktor wstrzykuje TokenService do weryfikacji tokenów JWT.
   * @param tokenService - Serwis do tworzenia i weryfikacji tokenów dostępu
   */
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Główna metoda Guard - sprawdza czy żądanie zawiera poprawny token JWT.
   *
   * Implementuje interfejs CanActivate z NestJS. Metoda ta jest automatycznie
   * wywoływana przez framework przed wykonaniem handlera kontrolera.
   *
   * Proces autoryzacji:
   * 1. Wyciąga token JWT z httpOnly cookie 'access-token'
   * 2. Weryfikuje podpis i ważność tokenu przez TokenService.verifyToken()
   * 3. Wyciąga userId z claim 'sub' (subject) w payload JWT
   * 4. Waliduje czy userId istnieje i jest liczbą
   * 5. Ustawia request.userId dla dostępu w kontrolerze
   *
   * @param context - Kontekst wykonania NestJS (ExecutionContext) zawierający request/response
   * @returns boolean - zawsze true jeśli token jest poprawny
   * @throws UnauthorizedException - gdy:
   *   - Brak tokenu w cookies
   *   - Token wygasł (TokenExpiredError)
   *   - Token jest nieprawidłowy (niepoprawny podpis, format)
   *   - Token nie zawiera poprawnego userId w claim 'sub'
   *
   * Uwaga bezpieczeństwa:
   * - Token jest przechowywany w httpOnly cookie, co chroni przed atakami XSS
   * - JwtService.verify() automatycznie sprawdza podpis i expiration
   * - W przypadku wygaśnięcia tokenu, frontend powinien odświeżyć token przez /auth/refresh
   *
   * @see TokenService.verifyToken - Metoda weryfikująca podpis i ważność JWT
   * @see AuthController.refresh - Endpoint do odświeżania wygasłych tokenów
   */
  canActivate(context: ExecutionContext): boolean {
    // Pobieramy obiekt request z kontekstu NestJS (zawiera headers, cookies, body itp.)
    const request = context.switchToHttp().getRequest();

    // Wyciągamy token JWT z httpOnly cookie 'access-token'
    // HttpOnly cookie jest automatycznie wysyłane przez przeglądarkę i nie jest dostępne dla JavaScript
    const token = request.cookies['access-token'];

    // Jeśli token nie istnieje, użytkownik nie jest zalogowany
    if (!token) {
      throw new UnauthorizedException(
        'Brak tokenu dostępu. Wymagane zalogowanie',
      );
    }

    // Weryfikujemy token JWT i wyciągamy payload
    try {
      // TokenService.verifyToken() używa JwtService.verify()
      // Automatycznie sprawdza:
      // - Podpis (signature) tokenu używając SECRET_KEY
      // - Ważność (expiration) - czy token nie wygasł
      // - Format JWT (header.payload.signature)
      const payload = this.tokenService.verifyToken(token);

      // Walidacja defensywna: sprawdzamy czy payload zawiera claim 'sub' (userId)
      // Choć TypeScript deklaruje typ { sub: number, role: Role }, warto sprawdzić runtime
      if (!payload.sub || typeof payload.sub !== 'number') {
        throw new UnauthorizedException(
          'Token nie zawiera poprawnego identyfikatora użytkownika',
        );
      }

      // Walidacja defensywna: sprawdzamy czy payload zawiera claim 'role'
      if (!payload.role) {
        throw new UnauthorizedException(
          'Token nie zawiera roli użytkownika',
        );
      }

      // Zapisujemy userId i role w obiekcie request, aby były dostępne w kontrolerze
      // Kontroler może teraz użyć @UserId() decorator lub request.userId
      // RolesGuard może użyć request.role do autoryzacji
      request.userId = payload.sub;
      request.role = payload.role;

      // Zwracamy true - autoryzacja się powiodła
      return true;
    } catch (error) {
      // JwtService.verify() może rzucić różne typy błędów:

      // 1. TokenExpiredError - token wygasł (exp claim < current time)
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token dostępu wygasł. Odśwież token używając refresh endpoint',
        );
      }

      // 2. JsonWebTokenError - nieprawidłowy format, podpis, lub manipulacja
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(
          'Nieprawidłowy token dostępu. Zaloguj się ponownie',
        );
      }

      // 3. NotBeforeError - token jeszcze nieważny (nbf claim > current time)
      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token dostępu jeszcze nieważny');
      }

      // 4. UnauthorizedException z walidacji payload.sub (nasz własny błąd)
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // 5. Inne nieoczekiwane błędy
      throw new UnauthorizedException(
        'Błąd weryfikacji tokenu dostępu',
      );
    }
  }
}
