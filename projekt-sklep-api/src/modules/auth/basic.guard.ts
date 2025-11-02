import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Role } from './role.enum';

/**
 * Guard implementujący uwierzytelnianie HTTP Basic Authentication.
 *
 * HTTP Basic Auth to prosty mechanizm autentykacji, gdzie dane logowania (email:hasło)
 * są kodowane w Base64 i wysyłane w nagłówku Authorization: Basic <base64>.
 *
 * Format nagłówka:
 * Authorization: Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==
 *
 * Po dekodowaniu Base64 otrzymujemy: test@example.com:password123
 *
 * Porównanie z TokenGuard (JWT):
 * - BasicGuard: wymaga wysłania hasła przy każdym żądaniu (mniej bezpieczne)
 * - TokenGuard: używa tokenów JWT (bezpieczniejsze, nie przesyła hasła)
 *
 * Użycie: Guard stosowany na endpoincie /auth/login
 * do walidacji danych logowania przed wygenerowaniem tokenów JWT.
 *
 * @see TokenGuard - Guard dla uwierzytelniania JWT
 * @see AuthService.verifyUser - Metoda weryfikująca hasło użytkownika
 */
@Injectable()
export class BasicGuard implements CanActivate {
  /**
   * Konstruktor wstrzykuje AuthService do weryfikacji danych logowania.
   * @param authService - Serwis do walidacji emaila i hasła użytkownika
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Dekoduje nagłówek Authorization i wyciąga dane logowania (email i hasło).
   *
   * Proces dekodowania:
   * 1. Waliduje że nagłówek zaczyna się od "Basic "
   * 2. Wyciąga część Base64 z nagłówka
   * 3. Dekoduje Base64 do postaci tekstowej
   * 4. Dzieli wynik po pierwszym dwukropku ":" na email i hasło
   *
   * Obsługuje hasła zawierające dwukropek (np. "pass:word123") poprzez użycie
   * indexOf() i substring() zamiast split(':').
   *
   * @param header - Pełny nagłówek Authorization (np. "Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==")
   * @returns Obiekt {username, password} zawsze gdy format jest poprawny
   * @throws BadRequestException - gdy format nagłówka jest nieprawidłowy
   *
   * @example
   * Input: "Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw=="
   * Output: { username: "test@example.com", password: "password123" }
   *
   * @example
   * Input: "Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzOndvcmQxMjM="
   * Output: { username: "test@example.com", password: "pass:word123" }
   */
  private decodeAuthHeader(header: string): {
    username: string;
    password: string;
  } {
    // Przykład nagłówka: "Basic dGVzdDFAZXhhbXBsZS5jb206cGFzc3dvcmQxMjM="

    // Walidacja: sprawdzamy czy nagłówek zaczyna się od "Basic " (z spacją)
    // Używamy toLowerCase() dla case-insensitive porównania (niektóre klienty mogą wysłać "basic")
    if (!header.toLowerCase().startsWith('basic ')) {
      throw new BadRequestException(
        'Nieprawidłowy format nagłówka Authorization. Oczekiwano "Basic <credentials>"',
      );
    }

    // Wyciągamy część Base64 z nagłówka (wszystko po "Basic ")
    // Używamy substring(6) zamiast split(' ')[1] dla lepszej wydajności
    const b64auth = header.substring(6);

    // Sprawdzamy czy część Base64 nie jest pusta
    if (!b64auth) {
      throw new BadRequestException(
        'Brak danych uwierzytelniających w nagłówku Authorization',
      );
    }

    // Dekodujemy Base64 do postaci tekstowej
    let decodedString: string;
    try {
      decodedString = Buffer.from(b64auth, 'base64').toString('utf-8');
    } catch {
      throw new BadRequestException(
        'Nieprawidłowe kodowanie Base64 w nagłówku Authorization',
      );
    }

    // Szukamy pierwszego dwukropka ":" który rozdziela email i hasło
    // Używamy indexOf() + substring() zamiast split(':') aby obsłużyć hasła z dwukropkiem
    const colonIndex = decodedString.indexOf(':');

    // Sprawdzamy czy dwukropek istnieje (colonIndex !== -1)
    if (colonIndex === -1) {
      throw new BadRequestException(
        'Nieprawidłowy format danych uwierzytelniających. Oczekiwano "email:hasło"',
      );
    }

    // Wyciągamy email (wszystko przed pierwszym dwukropkiem)
    const username = decodedString.substring(0, colonIndex);

    // Wyciągamy hasło (wszystko po pierwszym dwukropku, może zawierać kolejne dwukropki)
    const password = decodedString.substring(colonIndex + 1);

    // Walidacja: sprawdzamy czy email i hasło nie są puste
    if (!username || !password) {
      throw new BadRequestException(
        'Email lub hasło nie mogą być puste',
      );
    }

    // Zwracamy obiekt z danymi logowania
    return {
      username, // email użytkownika
      password, // hasło użytkownika (w formie jawnej, może zawierać dwukropki)
    };
  }

  /**
   * Główna metoda Guard - sprawdza czy żądanie zawiera poprawne dane logowania.
   *
   * Implementuje interfejs CanActivate z NestJS. Metoda ta jest automatycznie
   * wywoływana przez framework przed wykonaniem handlera kontrolera.
   *
   * Proces autoryzacji:
   * 1. Wyciąga nagłówek Authorization z żądania HTTP
   * 2. Dekoduje dane logowania (email i hasło) za pomocą decodeAuthHeader()
   * 3. Weryfikuje dane w bazie danych przez AuthService.verifyUser()
   * 4. Jeśli dane są poprawne, zapisuje userId w obiekcie request i zwraca true
   *
   * @param context - Kontekst wykonania NestJS (ExecutionContext) zawierający request/response
   * @returns Promise<boolean> - zawsze true jeśli autentykacja się powiodła
   * @throws UnauthorizedException - gdy brak nagłówka Authorization lub nieprawidłowe dane logowania
   * @throws BadRequestException - gdy format nagłówka Authorization jest nieprawidłowy (rzuca decodeAuthHeader)
   *
   * @see AuthService.verifyUser - Metoda weryfikująca hasło użytkownika
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Pobieramy obiekt request z kontekstu NestJS (zawiera headers, body, params itp.)
    const request = context.switchToHttp().getRequest();

    // Wyciągamy nagłówek Authorization z żądania HTTP
    // Przykład: "Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw=="
    const auth = request.headers['authorization'];

    // Jeśli nagłówek Authorization nie istnieje, rzucamy UnauthorizedException (401)
    // Użytkownik nie próbował się zalogować
    if (!auth) {
      throw new UnauthorizedException(
        'Brak nagłówka Authorization. Wymagane uwierzytelnienie Basic Auth',
      );
    }

    // Dekodujemy nagłówek Authorization i wyciągamy email + hasło
    // Jeśli format jest nieprawidłowy, decodeAuthHeader rzuci BadRequestException (400)
    const { username, password } = this.decodeAuthHeader(auth);

    // Weryfikujemy dane logowania w bazie danych
    // AuthService.verifyUser():
    // 1. Szuka użytkownika po emailu (username)
    // 2. Porównuje hasło używając argon2.verify() (bezpieczne porównanie hashy)
    // 3. Zwraca obiekt User jeśli dane są poprawne, null jeśli niepoprawne
    const user = await this.authService.verifyUser(username, password);

    // Jeśli użytkownik nie został znaleziony lub hasło jest nieprawidłowe, rzucamy UnauthorizedException (401)
    if (!user) {
      throw new UnauthorizedException(
        'Nieprawidłowy email lub hasło',
      );
    }

    // Zapisujemy ID użytkownika oraz role w obiekcie request, aby był dostępny w kontrolerze
    request.userId = user.id;
    request.role = Role.USER;    // rola powinna być pobierana z bazy danych


    // Zwracamy true - autentykacja się powiodła, NestJS pozwoli na wykonanie handlera kontrolera
    return true;
  }
}
