// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <MsalProvider instance={msalInstance}>
    {/* <App /> */}
    <App />
  </MsalProvider>,
  document.getElementById("root")
);
