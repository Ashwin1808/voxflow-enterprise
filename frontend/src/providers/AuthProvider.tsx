import type { ReactNode } from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "../auth/keycloak";

type Props = {
  children: ReactNode;
};

export default function AuthProvider({ children }: Props) {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: "login-required",
        checkLoginIframe: false,
        pkceMethod: "S256",
      }}
    >
      {children}
    </ReactKeycloakProvider>
  );
}