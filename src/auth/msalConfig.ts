import { Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "b44e2084-7a89-4e87-aa5f-c4490a47caaf", // Application (client) ID
    authority: "https://gainitauth.ciamlogin.com/gainitauth.onmicrosoft.com/GainitauthUF1",
    knownAuthorities: ["gainitauth.ciamlogin.com"],
    authorityMetadata: `
    {
      "token_endpoint": "https://gainitauth.ciamlogin.com/559c1923-19d9-428c-a51a-36c92e884239/oauth2/v2.0/token",
      "token_endpoint_auth_methods_supported": [
        "client_secret_post",
        "private_key_jwt",
        "client_secret_basic"
      ],
      "jwks_uri": "https://gainitauth.ciamlogin.com/559c1923-19d9-428c-a51a-36c92e884239/discovery/v2.0/keys",
      "response_modes_supported": [
        "query",
        "fragment",
        "form_post"
      ],
      "subject_types_supported": [
        "pairwise"
      ],
      "id_token_signing_alg_values_supported": [
        "RS256"
      ],
      "response_types_supported": [
        "code",
        "id_token",
        "code id_token",
        "id_token token"
      ],
      "scopes_supported": [
        "openid",
        "profile",
        "email",
        "offline_access"
      ],
      "issuer": "https://559c1923-19d9-428c-a51a-36c92e884239.ciamlogin.com/559c1923-19d9-428c-a51a-36c92e884239/v2.0",
      "request_uri_parameter_supported": false,
      "userinfo_endpoint": "https://graph.microsoft.com/oidc/userinfo",
      "authorization_endpoint": "https://gainitauth.ciamlogin.com/559c1923-19d9-428c-a51a-36c92e884239/oauth2/v2.0/authorize",
      "device_authorization_endpoint": "https://gainitauth.ciamlogin.com/559c1923-19d9-428c-a51a-36c92e884239/oauth2/v2.0/devicecode",
      "http_logout_supported": true,
      "frontchannel_logout_supported": true,
      "end_session_endpoint": "https://gainitauth.ciamlogin.com/559c1923-19d9-428c-a51a-36c92e884239/oauth2/v2.0/logout",
      "claims_supported": [
        "sub",
        "iss",
        "cloud_instance_name",
        "cloud_instance_host_name",
        "cloud_graph_host_name",
        "msgraph_host",
        "aud",
        "exp",
        "iat",
        "auth_time",
        "acr",
        "nonce",
        "preferred_username",
        "name",
        "tid",
        "ver",
        "at_hash",
        "c_hash",
        "email"
      ],
      "kerberos_endpoint": "https://gainitauth.ciamlogin.com/559c1923-19d9-428c-a51a-36c92e884239/kerberos",
      "tenant_region_scope": "EU",
      "cloud_instance_name": "microsoftonline.com",
      "cloud_graph_host_name": "graph.windows.net",
      "msgraph_host": "graph.microsoft.com",
      "rbac_url": "https://pas.windows.net"
    }
    `,

    redirectUri: "http://localhost:5173/auth-callback",
    postLogoutRedirectUri: "http://localhost:5173/"
  },
  cache: { 
    cacheLocation: "localStorage", 
    storeAuthStateInCookie: false 
  },
  system: { 
    loggerOptions: { 
      logLevel: LogLevel.Verbose, 
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            console.log(message);
            return;
        }
      }
    } 
  }
};

export const apiScopes = [
  "api://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/access_as_user"
];

export const API_BASE =
  "https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/";