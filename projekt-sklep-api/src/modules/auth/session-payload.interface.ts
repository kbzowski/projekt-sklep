import { Role } from './role.enum';

/**
 * Interfejs reprezentujący payload (zawartość) sesji użytkownika.
 *
 * SessionPayload zawiera dane użytkownika przechowywane w tokenie JWT
 * lub sesji HTTP. Używany przez guardy do autoryzacji.
 *
 * Pola:
 * - sub: Identyfikator użytkownika (subject w terminologii JWT)
 * - role: Rola użytkownika określająca uprawnienia
 *
 * Uwaga: W rzeczywistej implementacji należałoby rozszerzyć TokenService
 * aby dodawać pole 'role' do tokenu JWT podczas jego tworzenia.
 *
 * @see Role - Enum z możliwymi rolami użytkowników
 * @see RolesGuard - Guard wykorzystujący SessionPayload
 */
export interface SessionPayload {
  sub: number;
  role: Role;
}
