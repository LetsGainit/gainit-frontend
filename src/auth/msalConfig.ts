import { Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "b44e2084-7a89-4e87-aa5f-c4490a47caaf",
    authority: "https://gainitauth.ciamlogin.com/gainitauth.onmicrosoft.com/GainitauthUF1",
    knownAuthorities: ["gainitauth.ciamlogin.com"],
    redirectUri: "http://localhost:5173/",
    postLogoutRedirectUri: "http://localhost:5173/",
    navigateToLoginRequestUrl: true
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