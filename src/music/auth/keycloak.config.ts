import { KeycloakConnectOptions, PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';

export const keycloakConfig: KeycloakConnectOptions = {
  authServerUrl: process.env.KEYCLOAK_URL,
  realm: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  policyEnforcement: PolicyEnforcementMode.ENFORCING,
  tokenValidation: TokenValidation.ONLINE, 
};