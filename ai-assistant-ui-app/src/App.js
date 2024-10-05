// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
// export default App; 

import React from 'react';
import HeaderPanel from './components/Header';
import PrimaryContent from './components/PrimaryContent';
import Navigation from './components/Navigation';
import Branding from './components/Branding';
import './App.css';  // Custom styles

function App() {
  return (
    <div className="app-container">
      <div className="chat-panel-wrapper">
        <HeaderPanel />
        <PrimaryContent />
      </div>
      <div className="navigation-wrapper">
        <Branding />
        {/* <Navigation /> */}
      </div>
    </div>
  );
}

export default App;
