import React, { useState, useRef } from 'react';
import { FaTimes, FaUpload, FaFileAlt, FaSpinner, FaProjectDiagram, FaBuilding, FaDollarSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './apiConfig';
import './ProjectProfilesModal.css';

const ProjectProfilesModal = ({ isOpen, onClose, userId, sessionId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchingProjects, setMatchingProjects] = useState([]);
  const [description, setDescription] = useState('');
  const [step, setStep] = useState('upload'); // 'upload', 'results'
  const fileInputRef = useRef(null);

  const handleClose = () => {
    // Reset all state when closing
    setIsUploading(false);
    setIsAnalyzing(false);
    setUploadedFile(null);
    setAnalysisResult(null);
    setMatchingProjects([]);
    setDescription('');
    setStep('upload');
    onClose();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, or DOCX file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadedFile(file);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!userId || !sessionId) {
      toast.error('User and session information required');
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('session_id', sessionId);
      formData.append('user_id', userId);
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      formData.append('project_limit', '50');

      const response = await fetch(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.RFP.ANALYZE_AND_MATCH}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze RFP document');
      }

      const data = await response.json();
      
      if (data.rfp_analysis && data.rfp_analysis.success) {
        setAnalysisResult(data.rfp_analysis);
        setMatchingProjects(data.matching_projects.projects || []);
        setStep('results');
        toast.success('RFP analysis completed successfully!');
      } else {
        throw new Error(data.rfp_analysis?.message || 'Analysis failed');
      }

    } catch (error) {
      console.error('Error analyzing RFP:', error);
      toast.error(error.message || 'Failed to analyze RFP document');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    if (amount === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="project-profiles-modal">
        <div className="modal-header">
          <div className="modal-title">
            <FaProjectDiagram className="modal-icon" />
            <h2>Project Profiles</h2>
          </div>
          <button className="close-button" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {step === 'upload' && (
            <>
              <div className="upload-section">
                <h3>Upload RFP Document</h3>
                <p className="section-description">
                  Upload an RFP document to automatically detect the project type and find matching projects.
                </p>

                <div className="file-upload-area">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  {!uploadedFile ? (
                    <div 
                      className="upload-placeholder"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaUpload className="upload-icon" />
                      <p>Click to select an RFP document</p>
                      <span className="file-types">Supports PDF, DOC, DOCX (max 10MB)</span>
                    </div>
                  ) : (
                    <div className="uploaded-file">
                      <FaFileAlt className="file-icon" />
                      <div className="file-info">
                        <span className="file-name">{uploadedFile.name}</span>
                        <span className="file-size">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button 
                        className="change-file-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change File
                      </button>
                    </div>
                  )}
                </div>

                <div className="description-section">
                  <label htmlFor="description">Optional Description:</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any additional context about this RFP..."
                    rows={3}
                    maxLength={500}
                  />
                  <span className="char-count">{description.length}/500</span>
                </div>

                <div className="modal-actions">
                  <button 
                    className="analyze-btn"
                    onClick={handleUploadAndAnalyze}
                    disabled={!uploadedFile || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <FaSpinner className="spinning" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze RFP & Find Projects'
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'results' && analysisResult && (
            <>
              <div className="results-section">
                <div className="analysis-results">
                  <h3>Analysis Results</h3>
                  <div className="analysis-card">
                    <div className="analysis-header">
                      <FaProjectDiagram className="project-icon" />
                      <div>
                        <h4>Detected Project Type</h4>
                        <span className="project-type">{analysisResult.detected_project_type}</span>
                      </div>
                    </div>
                    
                    {analysisResult.brief_description && (
                      <div className="analysis-description">
                        <h5>Project Description</h5>
                        <p>{analysisResult.brief_description}</p>
                      </div>
                    )}

                    <div className="analysis-meta">
                      <span>Confidence: {analysisResult.confidence_score ? `${(analysisResult.confidence_score * 100).toFixed(1)}%` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="matching-projects">
                  {(() => {
                    // Filter out projects where project_number starts with '0000'
                    const filteredProjects = matchingProjects.filter(project => {
                      const projectNumber = project.project_number || '';
                      return !projectNumber.startsWith('0000');
                    });
                    
                    return (
                      <>
                        <h3>Matching Projects ({filteredProjects.length})</h3>
                        
                        {filteredProjects.length > 0 ? (
                          <div className="projects-list">
                            {filteredProjects
                              .sort((a, b) => (b.project_contract_labor || 0) - (a.project_contract_labor || 0))
                              .map((project, index) => (
                                <div key={project.project_id || index} className="project-card">
                                  <div className="project-header">
                                    <h4 className="project-name">{project.project_name || 'Unnamed Project'}</h4>
                                    <span className="project-type-badge">{project.project_type}</span>
                                  </div>
                                  
                                  <div className="project-details">
                                    <div className="detail-item">
                                      <FaProjectDiagram className="detail-icon" />
                                      <span>Market: {project.primary_segment || 'Unspecified'}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                      <FaDollarSign className="detail-icon" />
                                      <span>Value: {formatCurrency(project.project_contract_labor || 0)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="no-projects">
                            <p>No matching projects found for this project type.</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="modal-actions">
                  <button 
                    className="new-analysis-btn"
                    onClick={() => {
                      setStep('upload');
                      setUploadedFile(null);
                      setAnalysisResult(null);
                      setMatchingProjects([]);
                      setDescription('');
                    }}
                  >
                    Analyze Another RFP
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectProfilesModal;
