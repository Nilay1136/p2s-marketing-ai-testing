import React, { useState } from 'react';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import headerLogo from './P2S_Legence_Logo_White.png'; 
 

// Main Header Component
const MainHeader = ({ title, imageSrc }) => {
  return (
    <header className="main-header">
      <div className="header-content">
        {imageSrc && <img src={imageSrc} alt="Header Logo" className={headerLogo}/>}
        <h1>{title}</h1>
      </div>
    </header>
  );
};

// File Upload Component
const FileUpload = ({ onFileUpload }) => {
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    setSelectedFiles(files);
    onFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    setSelectedFiles(files);
    onFileUpload(files);
  };

  return (
    <div className="file-upload-section">
      <div
        className={`file-drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <p>Drag & Drop files here or <span className="upload-link">browse</span></p>
        <input
          type="file"
          id="fileInput"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

// Main HR Admin Portal Component
const HRAdminPortal = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [expirationDates, setExpirationDates] = useState({});
  const [announcements, setAnnouncements] = useState(Array(5).fill(''));
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const handleFileUpload = (files) => {
    const fileList = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
    }));
    setUploadedFiles(fileList);
  };

  const handleExpirationDateChange = (fileName, date) => {
    setExpirationDates((prevDates) => ({
      ...prevDates,
      [fileName]: date,
    }));
  };

  const handleUpload = (file) => {
    // Simulate the file upload action
    console.log('Uploading file:', file.name);
  };

  const handleAnnouncementChange = (index, value) => {
    const updatedAnnouncements = [...announcements];
    updatedAnnouncements[index] = value;
    setAnnouncements(updatedAnnouncements);
  };

  const saveAnnouncements = async () => {
    // Simulate a backend call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Saved successfully');
      }, 1000);
    });
  };

  const handleSave = async () => {
    setConfirmationMessage('Saving...');
    await saveAnnouncements();
    setConfirmationMessage('Announcements saved successfully!');
  };

  return (
    <div className="hr-admin-portal">
      <MainHeader title="HR Admin Portal" imageSrc={headerLogo} />

      <div className="content-container">
        {/* Left side: Drag and Drop */}
        <div className="upload-section">
          <FileUpload onFileUpload={handleFileUpload} />
          <div className="uploaded-files">
            {uploadedFiles.map((file) => (
              <div key={file.name} className="file-info modern-card">
                <p>{file.name}</p>
                <div className="expiration-date">
                  <p>Set Expiration Date:</p>
                  <DatePicker
                    selected={expirationDates[file.name]}
                    onChange={(date) => handleExpirationDateChange(file.name, date)}
                  />
                </div>
                <button className="modern-button" onClick={() => handleUpload(file)}>
                  Upload {file.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Banner Announcements */}
        <div className="announcements-section">
          <h2>Banner Announcements</h2>
          <div className="announcement-cards">
            {announcements.map((announcement, index) => (
              <div key={index} className="modern-card announcement-card">
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => handleAnnouncementChange(index, e.target.value)}
                  placeholder={`Announcement ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="confirmation-message">{confirmationMessage}</div>
          <button className="modern-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRAdminPortal;
