// // src/index.js
// import React from "react";
// import ReactDOM from "react-dom";
// import App from "./App";
// import { PublicClientApplication } from "@azure/msal-browser";
// import { MsalProvider } from "@azure/msal-react";
// import { msalConfig } from "./authConfig";

// const msalInstance = new PublicClientApplication(msalConfig);

// ReactDOM.render(
//   <MsalProvider instance={msalInstance}>
//     {/* <App /> */}
//     <App />
//   </MsalProvider>,
//   document.getElementById("root")
// );

// src/index.js - DEVELOPMENT VERSION
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// MSAL IMPORTS COMMENTED FOR DEV
// import { PublicClientApplication } from "@azure/msal-browser";
// import { MsalProvider } from "@azure/msal-react";
// import { msalConfig } from "./authConfig";

// const msalInstance = new PublicClientApplication(msalConfig);

// DEV MODE: Render App directly without MsalProvider
ReactDOM.render(
  <App />,
  document.getElementById("root")
);

/* PRODUCTION VERSION (UNCOMMENT FOR PROD):
ReactDOM.render(
  <MsalProvider instance={msalInstance}>
    <App />
  </MsalProvider>,
  document.getElementById("root")
);
*/