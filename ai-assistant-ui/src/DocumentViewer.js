import React, { useState } from 'react';
import Modal from 'react-modal';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { FaTimes, FaFile, FaFilePdf, FaFileWord, FaFileAlt, FaArrowLeft } from 'react-icons/fa';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './DocumentViewer.css';

const DocumentViewer = ({ isOpen, onClose, documents, sessionTitle }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="doc-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="doc-icon word" />;
      case 'txt':
        return <FaFileAlt className="doc-icon text" />;
      default:
        return <FaFile className="doc-icon default" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderDocumentContent = (doc) => {
    const extension = doc.filename?.split('.').pop().toLowerCase();
    
    // For PDFs - use the PDF viewer
    if (extension === 'pdf' && doc.blob_path) {
      return (
        <div className="pdf-viewer-container">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={doc.blob_path}
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
        </div>
      );
    }
    
    // For text content
    if (doc.text_content) {
      return (
        <div className="text-content-viewer">
          <div className="text-content-scroll">
            {doc.text_content}
          </div>
        </div>
      );
    }
    
    // Fallback
    return (
      <div className="no-preview">
        <FaFile className="no-preview-icon" />
        <p>This feature is coming soon!!</p>
        <p className="file-info">{doc.filename} ({formatFileSize(doc.size)})</p>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        setSelectedDoc(null);
        onClose();
      }}
      className={selectedDoc ? "document-viewer-modal-large" : "document-viewer-modal"}
      overlayClassName="document-viewer-overlay"
      contentLabel="Session Documents"
    >
      <div className="modal-header">
        <h2>{selectedDoc ? selectedDoc.filename : `Documents - ${sessionTitle}`}</h2>
        <button className="close-modal-btn" onClick={() => {
          setSelectedDoc(null);
          onClose();
        }}>
          <FaTimes />
        </button>
      </div>

      <div className="modal-content">
        {selectedDoc ? (
          // Full document view
          <div className="document-full-view">
            <button 
              className="back-to-list-btn"
              onClick={() => setSelectedDoc(null)}
            >
              <FaArrowLeft /> Back to Documents
            </button>
            {renderDocumentContent(selectedDoc)}
          </div>
        ) : (
          // Document list view
          !documents || documents.length === 0 ? (
            <div className="no-documents">
              <FaFile className="empty-icon" />
              <p>No documents in this session</p>
            </div>
          ) : (
            <div className="documents-list">
              {documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <div className="doc-info">
                    {getFileIcon(doc.filename)}
                    <div className="doc-details">
                      <h4>{doc.filename}</h4>
                      <div className="doc-meta">
                        <span className="doc-size">{formatFileSize(doc.size)}</span>
                        <span className="doc-type">{doc.file_type || 'Document'}</span>
                        {doc.status && (
                          <span className={`doc-status ${doc.status}`}>
                            {doc.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {doc.text_content && (
                    <div className="doc-preview">
                      <p className="preview-label">Preview:</p>
                      <div className="preview-content">
                        {doc.text_content.substring(0, 200)}
                        {doc.text_content.length > 200 && '...'}
                      </div>
                    </div>
                  )}
                  <button 
                    className="view-doc-btn"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    View Document
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <div className="modal-footer">
        <button className="btn-secondary" onClick={() => {
          setSelectedDoc(null);
          onClose();
        }}>
          Close
        </button>
      </div>
    </Modal>
  );
};

export default DocumentViewer;