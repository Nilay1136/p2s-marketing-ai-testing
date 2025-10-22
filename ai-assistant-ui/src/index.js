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

// Development: Add IndexedDB test to window for easy testing
if (process.env.NODE_ENV === 'development') {
  import('./utils/indexedDBTest').then(module => {
    window.testIndexedDB = module.testIndexedDB;
    console.log('IndexedDB test available as window.testIndexedDB()');
  });
  
  import('./utils/hybridCacheTest').then(module => {
    window.testHybridCache = module.testHybridCache;
    window.performanceComparison = module.performanceComparison;
    console.log('Hybrid cache tests available as window.testHybridCache() and window.performanceComparison()');
  });
  
  import('./utils/backgroundSyncTest').then(module => {
    window.testBackgroundSync = module.testBackgroundSync;
    window.testMockSync = module.testMockSync;
    window.stressTestSync = module.stressTestSync;
    window.monitorSyncPerformance = module.monitorSyncPerformance;
    console.log('Background sync tests available: testBackgroundSync(), testMockSync(), stressTestSync(), monitorSyncPerformance()');
  });
  
  import('./utils/performanceImpactTest').then(module => {
    window.performanceImpactTest = module.performanceImpactTest;
    window.backgroundSyncPerformanceTest = module.backgroundSyncPerformanceTest;
    window.realWorldUsageTest = module.realWorldUsageTest;
    window.cacheAnalysisTest = module.cacheAnalysisTest;
    window.runCompletePerformanceTest = module.runCompletePerformanceTest;
    console.log('🚀 PERFORMANCE TESTS: runCompletePerformanceTest(), performanceImpactTest(), realWorldUsageTest()');
  });
  
  import('./utils/quickFixTest').then(module => {
    window.testFilteringAndUpdates = module.testFilteringAndUpdates;
    console.log('🔧 QUICK FIX TEST: testFilteringAndUpdates()');
  });
  
  import('./utils/debugProjectUpdate').then(module => {
    window.debugProjectUpdate = module.debugProjectUpdate;
    window.debugAxiosUpdate = module.debugAxiosUpdate;
    window.debugBothMethods = module.debugBothMethods;
    console.log('🐞 DEBUG TOOLS: debugProjectUpdate(), debugAxiosUpdate(), debugBothMethods()');
  });
}