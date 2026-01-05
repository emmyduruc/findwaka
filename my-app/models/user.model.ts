import { UserRole } from '@waka/shared';

export { UserRole };

export type AuthStatus = 'guest' | 'loggedOut' | 'loggedIn';

// Re-export for convenience, but use the shared enum
export type UserRoleType = UserRole;

