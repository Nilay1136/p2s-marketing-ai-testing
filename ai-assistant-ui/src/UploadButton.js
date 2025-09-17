import React, { useRef, useState } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './UploadButton.css';

const UploadButton = ({ onFileUpload, onUploadProgress, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Supported file types
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!supportedTypes.includes(file.type)) {
      toast.error(`File type ${file.type} is not supported. Please upload PDF, Word, Excel, PowerPoint, or text files.`);
      return false;
    }
    
    if (file.size > maxFileSize) {
      toast.error(`File size exceeds 10MB limit. Please choose a smaller file.`);
      return false;
    }
    
    return true;
  };

  const simulateUploadProgress = (file, onProgress, onComplete) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25; // Random progress increment
      if (progress > 100) progress = 100;
      
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete('completed');
        }, 500); // Small delay to show 100% before completion
      }
    }, 300);
    
    return interval;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of files) {
        if (validateFile(file)) {
          const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString()
          };
          
          // Start progress tracking
          if (onUploadProgress) {
            onUploadProgress(fileData, 0, 'uploading');
          }
          
          // Simulate upload progress
          const uploadInterval = simulateUploadProgress(
            file,
            (progress) => {
              if (onUploadProgress) {
                onUploadProgress(fileData, progress, 'uploading');
              }
            },
            (status) => {
              if (onUploadProgress) {
                onUploadProgress(fileData, 100, status);
              }
              
              // Call the callback function for completed upload
              if (onFileUpload && status === 'completed') {
                onFileUpload(file, fileData);
              }
              
              if (status === 'completed') {
                toast.success(`${file.name} uploaded successfully!`);
              }
            }
          );
        }
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="upload-button-container">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />
      
      <button
        className={`upload-button ${disabled || uploading ? 'disabled' : ''}`}
        onClick={handleButtonClick}
        disabled={disabled || uploading}
        title="Upload files (PDF, Word, Excel, PowerPoint, Text)"
      >
        {uploading ? (
          <FaSpinner className="upload-icon spinning" />
        ) : (
          <FaPlus className="upload-icon" />
        )}
      </button>
    </div>
  );
};

export default UploadButton;