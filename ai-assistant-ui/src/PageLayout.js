import React, { useState } from 'react';
import './PageLayout.css';
import headerLogo from './P2S_Legence_Logo_White.png';

// Page Layout Component
const PageLayout = ({ children }) => {
  const [showAboutTooltip, setShowAboutTooltip] = useState(false);

  return (
    <div className="page-layout">
      {/* Top Logo */}
      <div className="top-logo">
        <img src={headerLogo} alt="P2S Logo" className="header-logo-small" />
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="center-content">
          <img src={headerLogo} alt="P2S Logo" className="main-logo" />
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <div className="footer-left">
          <div
            className="tooltip-container"
            onMouseEnter={() => setShowAboutTooltip(true)}
            onMouseLeave={() => setShowAboutTooltip(false)}
          >
            <span className="footer-text">About</span>
            {showAboutTooltip && (
              <div className="tooltip">
                Our P2S AI Assistant was developed by Nilay Nagar, Chad Peterson, and Jonathan Herrera.
              </div>
            )}
          </div>
        </div>
        <div className="footer-right">
          <a href="https://www.p2sinc.com" target="_blank" rel="noopener noreferrer">
            www.p2sinc.com
          </a>
          <span> | © {new Date().getFullYear()} P2S All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;