// authConfig.js
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID || '626a137e-177a-4d36-8ce5-314947973d80',
    authority: 'https://login.microsoftonline.com/7bb63ee7-a3e1-4d75-b5a5-6f9549f171a3',
    redirectUri: process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  }
};

  
  // Scopes for login
  export const loginRequest = {
    scopes: [
      "openid",
      "profile",
      "User.Read",
      "api://abe95412-126f-4b05-8aa4-0f96427a69b9/access_as_user" // Backend client ID
    ]
  };
  
  // Scopes for API calls
  export const apiRequest = {
    scopes: ["api://abe95412-126f-4b05-8aa4-0f96427a69b9/access_as_user"] // Backend client ID
  };