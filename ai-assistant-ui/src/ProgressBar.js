import React from 'react';
import { FaFile, FaTimes } from 'react-icons/fa';
import './ProgressBar.css';

const ProgressBar = ({ file, progress, onCancel, status = 'uploading' }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return <FaFile className="file-type-icon" />;
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'completed':
        return 'Upload completed';
      case 'error':
        return 'Upload failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'rgb(52, 106, 134)';
      case 'completed':
        return '#4caf50';
      case 'error':
        return '#e74144';
      default:
        return 'rgb(52, 106, 134)';
    }
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-file-info">
        <div className="file-icon-wrapper">
          {getFileTypeIcon(file.name)}
        </div>
        <div className="file-details">
          <div className="file-name-row">
            <span className="file-name" title={file.name}>
              {file.name.length > 25 ? `${file.name.substring(0, 25)}...` : file.name}
            </span>
            {status === 'uploading' && onCancel && (
              <button 
                className="cancel-upload-btn"
                onClick={() => onCancel(file.id)}
                title="Cancel upload"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="file-meta">
            <span className="file-size">{formatFileSize(file.size)}</span>
            <span className="file-status" style={{ color: getStatusColor() }}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div 
            className={`progress-bar-fill ${status}`}
            style={{ 
              width: `${progress}%`,
              backgroundColor: getStatusColor()
            }}
          />
        </div>
        <div className="progress-percentage">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;