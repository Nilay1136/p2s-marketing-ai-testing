import React, { useState } from 'react';
import { 
  FaFile, 
  FaTimes, 
  FaCheck, 
  FaChevronDown, 
  FaChevronUp,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt
} from 'react-icons/fa';
import './UploadedFiles.css';

const UploadedFiles = ({ files, onRemoveFile, maxVisible = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="file-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="file-icon word" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="file-icon excel" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="file-icon powerpoint" />;
      case 'txt':
        return <FaFileAlt className="file-icon text" />;
      default:
        return <FaFile className="file-icon default" />;
    }
  };

  const formatUploadDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!files || files.length === 0) {
    return null;
  }

  const displayedFiles = isExpanded ? files : files.slice(0, maxVisible);
  const hasMoreFiles = files.length > maxVisible;

  return (
    <div className="uploaded-files-container">
      <div className="uploaded-files-header">
        <h4>Uploaded Files ({files.length})</h4>
        {hasMoreFiles && (
          <button 
            className="expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Show Less <FaChevronUp />
              </>
            ) : (
              <>
                Show All <FaChevronDown />
              </>
            )}
          </button>
        )}
      </div>

      <div className="uploaded-files-list">
        {displayedFiles.map((file) => (
          <div key={file.id} className="uploaded-file-item">
            <div className="file-info-section">
              <div className="file-icon-wrapper">
                {getFileIcon(file.name)}
              </div>
              
              <div className="file-details-section">
                <div className="file-main-info">
                  <span className="file-name" title={file.name}>
                    {file.name}
                  </span>
                  <div className="file-meta-info">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-date">
                      {formatUploadDate(file.uploadDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="file-actions">
              <div className="upload-success">
                <FaCheck className="success-icon" />
                <span className="success-text">Uploaded</span>
              </div>
              
              {onRemoveFile && (
                <button 
                  className="remove-file-button"
                  onClick={() => onRemoveFile(file.id)}
                  title="Remove file"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMoreFiles && !isExpanded && (
        <div className="files-summary">
          <span className="summary-text">
            and {files.length - maxVisible} more file{files.length - maxVisible !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default UploadedFiles;