import React, { useState } from 'react';
import './App.css';
import headerLogo from './P2S_Legence_Logo_White.png';

// Header Component
const Header = () => {
  return (
    <header className="header">
      <img src={headerLogo} alt="Logo" className="header-logo" />
      <h1 className="header-title">Admin Portal: Human Resources</h1>
    </header>
  );
};

// Main Content Component
const MainContent = () => {
  return (
    <main className="main-content">
      <div className="content-wrapper">
        <DragAndDrop />
        <AnnouncementsForm />
      </div>
    </main>
  );
};

// Drag and Drop Component
const DragAndDrop = () => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      alert('No files to upload.');
      return;
    }

    // Implement upload logic here on what to do with the files
    console.log('Uploading files:', files);

    setFiles([]);
    alert('Files have been uploaded successfully.');
  };

  return (
    <div className="drag-drop-container">
      <div
        className={`drag-drop-area ${dragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <p>Drag & Drop files here</p>
        {files.length > 0 && (
          <div className="file-list">
            <h4>Files:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  {file.name}
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemoveFile(index)}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {files.length > 0 && (
        <button type="button" className="upload-button" onClick={handleUpload}>
          Upload
        </button>
      )}
    </div>
  );
};

// Announcements Form Component
const AnnouncementsForm = () => {
  const [formData, setFormData] = useState({
    announcement1: '',
    announcement2: '',
    announcement3: '',
    announcement4: '',
    announcement5: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store announcements in a variable (e.g., submittedData)
    const submittedData = { ...formData };
    console.log('Form submitted:', submittedData);

    // Display confirmation message using alert
    alert('Announcements have been successfully submitted.');

    // Optionally, reset form fields
    setFormData({
      announcement1: '',
      announcement2: '',
      announcement3: '',
      announcement4: '',
      announcement5: '',
    });
  };

  return (
    <form className="announcements-form" onSubmit={handleSubmit}>
      <h3>Announcements</h3>
      {Object.keys(formData).map((key, index) => (
        <div key={index} className="form-group">
          <label htmlFor={key}>Message {index + 1}:</label>
          <input
            type="text"
            id={key}
            name={key}
            value={formData[key]}
            onChange={handleChange}
          />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

// Footer Component
const Footer = () => {
  const [showAboutTooltip, setShowAboutTooltip] = useState(false);

  return (
    <footer className="footer">
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
  );
};

// Page Layout Component
const PageLayout = () => {
  return (
    <div className="page-layout">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
};

export default PageLayout;