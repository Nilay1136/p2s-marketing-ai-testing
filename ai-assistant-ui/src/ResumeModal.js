import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaGraduationCap, FaCertificate, FaTrophy, FaBuilding, FaSpinner, FaFileAlt, FaBriefcase, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './apiConfig';
import './ResumeModal.css';

const ResumeModal = ({ isOpen, onClose, contactId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && contactId) {
      fetchResumeData();
    }
  }, [isOpen, contactId]);

  const fetchResumeData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.RESUMES.BY_TIMECARD_CONTACT_ID(contactId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Resume not found for this contact');
        }
        throw new Error(`Failed to fetch resume: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.resume) {
        setResumeData(data);
      } else {
        throw new Error(data.message || 'Failed to load resume');
      }

    } catch (error) {
      console.error('Error fetching resume:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResumeData(null);
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (sizeKb) => {
    if (!sizeKb) return 'N/A';
    const size = parseFloat(sizeKb);
    if (size < 1024) {
      return `${size.toFixed(1)} KB`;
    }
    return `${(size / 1024).toFixed(1)} MB`;
  };

  const parseJsonField = (jsonString) => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // If it's not valid JSON, treat it as a string and split by common delimiters
      return jsonString.split(/[,;|]/).map(item => item.trim()).filter(item => item.length > 0);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="resume-modal-overlay modal-overlay"
      style={{
        background: 'rgba(35, 21, 32, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="resume-modal">
        <div className="modal-header">
          <div className="modal-title">
            <FaUser className="modal-icon" />
            <div>
              <h2>Resume Details</h2>
              {resumeData?.contact_info && (
                <span className="contact-subtitle">{resumeData.contact_info.full_name}</span>
              )}
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {isLoading && (
            <div className="loading-state">
              <FaSpinner className="loading-spinner" />
              <p>Loading resume...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p className="error-message">Error: {error}</p>
              <button 
                className="retry-button"
                onClick={fetchResumeData}
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && !resumeData && (
            <div className="empty-state">
              <FaFileAlt className="empty-icon" />
              <p>No resume data available.</p>
            </div>
          )}

          {!isLoading && !error && resumeData && (
            <div className="resume-content">
              {/* Contact Information */}
              {resumeData.contact_info && (
                <div className="resume-section">
                  <h3 className="section-title">
                    <FaUser className="section-icon" />
                    Contact Information
                  </h3>
                  <div className="contact-info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{resumeData.contact_info.full_name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Title:</span>
                      <span className="info-value">{resumeData.contact_info.title || resumeData.resume.job_title || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Summary */}
              <div className="resume-section">
                <h3 className="section-title">
                  <FaBriefcase className="section-icon" />
                  Professional Summary
                </h3>
                <div className="summary-grid">
                  <div className="info-item">
                    <span className="info-label">Primary Discipline:</span>
                    <span className="info-value">{resumeData.resume.primary_discipline || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Years of Experience:</span>
                    <span className="info-value">{resumeData.resume.years_of_experience || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Job Title:</span>
                    <span className="info-value">{resumeData.resume.job_title || 'N/A'}</span>
                  </div>
                </div>
                
                {resumeData.resume.description && (
                  <div className="description-section">
                    <h4>Description</h4>
                    <p className="description-text">{resumeData.resume.description}</p>
                  </div>
                )}
              </div>

              {/* Education */}
              {resumeData.resume.education && (
                <div className="resume-section">
                  <h3 className="section-title">
                    <FaGraduationCap className="section-icon" />
                    Education
                  </h3>
                  <div className="text-section">
                    {parseJsonField(resumeData.resume.education).map((item, index) => (
                      <div key={index} className="text-item">
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resumeData.resume.certifications && (
                <div className="resume-section">
                  <h3 className="section-title">
                    <FaCertificate className="section-icon" />
                    Certifications
                  </h3>
                  <div className="text-section">
                    {parseJsonField(resumeData.resume.certifications).map((item, index) => (
                      <div key={index} className="text-item">
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Highlights */}
              {resumeData.resume.key_highlights && (
                <div className="resume-section">
                  <h3 className="section-title">
                    <FaBriefcase className="section-icon" />
                    Key Highlights
                  </h3>
                  <div className="text-section">
                    {parseJsonField(resumeData.resume.key_highlights).map((item, index) => (
                      <div key={index} className="text-item">
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {resumeData.resume.awards && (
                <div className="resume-section">
                  <h3 className="section-title">
                    <FaTrophy className="section-icon" />
                    Awards
                  </h3>
                  <div className="text-section">
                    {parseJsonField(resumeData.resume.awards).map((item, index) => (
                      <div key={index} className="text-item">
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affiliations */}
              {resumeData.resume.affiliations && (
                <div className="resume-section">
                  <h3 className="section-title">
                    <FaUsers className="section-icon" />
                    Professional Affiliations
                  </h3>
                  <div className="affiliations-text">
                    <p>{resumeData.resume.affiliations}</p>
                  </div>
                </div>
              )}

              {/* Publications */}
              {resumeData.resume.publications && (
                <div className="resume-section">
                  <h3 className="section-title">
                    <FaFileAlt className="section-icon" />
                    Publications
                  </h3>
                  <div className="publications-text">
                    <p>{resumeData.resume.publications}</p>
                  </div>
                </div>
              )}

              {/* File Information */}
              <div className="resume-section file-info-section">
                <h3 className="section-title">
                  <FaFileAlt className="section-icon" />
                  File Information
                </h3>
                <div className="file-info-grid">
                  <div className="info-item">
                    <span className="info-label">Original Filename:</span>
                    <span className="info-value">{resumeData.resume.original_filename || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">File Type:</span>
                    <span className="info-value">{resumeData.resume.file_type?.toUpperCase() || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">File Size:</span>
                    <span className="info-value">{formatFileSize(resumeData.resume.file_size_kb)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Modified:</span>
                    <span className="info-value">{formatDate(resumeData.resume.last_modified_date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">LLM Processed:</span>
                    <span className="info-value">{formatDate(resumeData.resume.llm_processed_date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Processing Status:</span>
                    <span className={`status-badge ${resumeData.resume.processing_status}`}>
                      {resumeData.resume.processing_status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;