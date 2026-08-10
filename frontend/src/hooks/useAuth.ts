import { useCallback, useMemo } from "react";
import { useKeycloak } from "@react-keycloak/web";

export type UserInfo = {
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
};

export type UseAuthReturn = {
  initialized: boolean;
  authenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  logout: () => void;
};

export default function useAuth(): UseAuthReturn {
  const { keycloak, initialized } = useKeycloak();
  const authenticated = keycloak.authenticated ?? false;

  const roles = useMemo(
    () => (keycloak.tokenParsed?.realm_access?.roles ?? []) as string[],
    [keycloak.tokenParsed]
  );

  const user: UserInfo | null = authenticated
    ? {
        username: (keycloak.tokenParsed?.preferred_username as string) ?? "Unknown",
        email: (keycloak.tokenParsed?.email as string) ?? null,
        firstName: (keycloak.tokenParsed?.given_name as string) ?? null,
        lastName: (keycloak.tokenParsed?.family_name as string) ?? null,
        roles,
      }
    : null;

  const hasRole = useCallback(
    (role: string) => roles.includes(role),
    [roles]
  );

  const hasAnyRole = useCallback(
    (allowed: string[]) => allowed.some((role) => roles.includes(role)),
    [roles]
  );

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin });
  }, [keycloak]);

  return { initialized, authenticated, user, token: keycloak.token ?? null, hasRole, hasAnyRole, logout };
}
