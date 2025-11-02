/**
 * Enum definiujący role użytkowników w systemie.
 *
 * Role określają uprawnienia użytkowników i są używane przez RolesGuard
 * do kontroli dostępu do zasobów.
 *
 * Rola powinna być zapisywana w bazie danych i uzywana przy wydawaniu tokenów.
 *
 * @see RolesGuard - Guard wykorzystujący role do autoryzacji
 */
export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
