import React, { useState, useRef } from 'react';
import { FaTimes, FaUpload, FaFileAlt, FaSpinner, FaProjectDiagram, FaBuilding, FaDollarSign, FaEye, FaPercentage, FaInfoCircle, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS, API_CONFIG } from './apiConfig';
import ResourcesModal from './ResourcesModal';
import './ProjectProfilesModal.css';

const ProjectProfilesModal = ({ isOpen, onClose, userId, sessionId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchingProjects, setMatchingProjects] = useState([]);
  const [description, setDescription] = useState('');
  const [step, setStep] = useState('upload'); // 'upload', 'results'
  const [selectedContentArchive, setSelectedContentArchive] = useState(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  
  // State for project profiles data
  const [selectedProjectProfile, setSelectedProjectProfile] = useState(null);
  const [isProjectProfileModalOpen, setIsProjectProfileModalOpen] = useState(false);
  const [projectProfiles, setProjectProfiles] = useState([]);
  const [projectsWithProfiles, setProjectsWithProfiles] = useState([]);
  const [showOnlyWithProfiles, setShowOnlyWithProfiles] = useState(false);
  
  // Resources modal state
  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [selectedProjectForResources, setSelectedProjectForResources] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleClose = () => {
    // Reset all state when closing
    setIsUploading(false);
    setIsAnalyzing(false);
    setUploadedFile(null);
    setAnalysisResult(null);
    setMatchingProjects([]);
    setProjectProfiles([]);
    setProjectsWithProfiles([]);
    setShowOnlyWithProfiles(false);
    setDescription('');
    setStep('upload');
    setSelectedContentArchive(null);
    setIsContentModalOpen(false);
    setSelectedProjectProfile(null);
    setIsProjectProfileModalOpen(false);
    setIsResourcesModalOpen(false);
    setSelectedProjectForResources(null);
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
      formData.append('enable_similarity', 'true');
      formData.append('similarity_threshold', '0.1');
      formData.append('top_similar_count', '10');

      const response = await fetch(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.RFP.ANALYZE_WITH_SIMILARITY}`, {
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
        
        // Get projects from response
        let projects = data.matching_projects.projects || [];
        setMatchingProjects(projects);
        
        // Always fetch project profiles for the detected project type
        if (data.rfp_analysis.detected_project_type) {
          await fetchProjectProfiles(data.rfp_analysis.detected_project_type);
          await fetchProjectsWithProfiles(data.rfp_analysis.detected_project_type);
        }
        
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

  const fetchProjectProfiles = async (projectType) => {
    try {
      // Build the URL with query parameters
      const baseUrl = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECT_PROFILES.BY_TYPE(projectType)}`;
      const params = new URLSearchParams({
        limit: '50',
        enable_similarity: 'false'
      });
      
      const response = await fetch(`${baseUrl}&${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project profiles');
      }

      const data = await response.json();
      
      if (data.success && data.project_profiles) {
        setProjectProfiles(data.project_profiles);
      } else {
        setProjectProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching project profiles:', error);
      setProjectProfiles([]);
    }
  };

  const fetchProjectsWithProfiles = async (projectType) => {
    try {
      // Build the URL for projects with profiles
      const baseUrl = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECTS.WITH_PROFILES_BY_TYPE(projectType)}`;
      const params = new URLSearchParams({
        limit: '50'
      });
      
      const response = await fetch(`${baseUrl}&${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects with profiles');
      }

      const data = await response.json();
      
      if (data.success && data.projects) {
        setProjectsWithProfiles(data.projects);
      } else {
        setProjectsWithProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching projects with profiles:', error);
      setProjectsWithProfiles([]);
    }
  };

  const handleContentArchiveClick = (contentArchive) => {
    setSelectedContentArchive(contentArchive);
    setIsContentModalOpen(true);
  };

  const handleContentModalClose = () => {
    setSelectedContentArchive(null);
    setIsContentModalOpen(false);
  };

  const handleProjectProfileClick = (projectProfile) => {
    setSelectedProjectProfile(projectProfile);
    setIsProjectProfileModalOpen(true);
  };

  const handleProjectProfileModalClose = () => {
    setSelectedProjectProfile(null);
    setIsProjectProfileModalOpen(false);
  };

  const handleViewResourcesClick = (project, event) => {
    event.stopPropagation();
    setSelectedProjectForResources(project);
    setIsResourcesModalOpen(true);
  };

  const handleViewContentArchivesClick = (project, event) => {
    event.stopPropagation();
    
    // If this is a project with profiles, show the project profile directly
    if (project.sourceType === 'withProfiles') {
      setSelectedProjectProfile(project);
      setIsProjectProfileModalOpen(true);
      return;
    }
    
    console.log('=== CONTENT ARCHIVES MATCHING START ===');
    console.log('Clicked project:', project);
    console.log('Available project profiles:', projectProfiles);
    
    // Try different matching strategies for regular projects
    console.log('Trying matching strategies...');
    
    // Strategy 1: Exact project_id match
    const exactIdMatch = projectProfiles.find(profile => {
      const match = profile.project_id === project.project_id;
      console.log(`Strategy 1 - Exact ID: ${profile.project_id} === ${project.project_id} = ${match}`);
      return match;
    });
    
    // Strategy 2: Exact project_name match
    const exactNameMatch = projectProfiles.find(profile => {
      const match = profile.project_name === project.project_name;
      console.log(`Strategy 2 - Exact Name: "${profile.project_name}" === "${project.project_name}" = ${match}`);
      return match;
    });
    
    // Strategy 3: Check if project profiles use a different ID field (like ProjectID from the JSON)
    const projectIdMatch = projectProfiles.find(profile => {
      const match = profile.ProjectID === project.project_id;
      console.log(`Strategy 3 - ProjectID field: ${profile.ProjectID} === ${project.project_id} = ${match}`);
      return match;
    });
    
    // Strategy 4: Fuzzy name matching (contains)
    const fuzzyNameMatch = projectProfiles.find(profile => {
      if (!profile.project_name || !project.project_name) return false;
      const match = profile.project_name.toLowerCase().includes(project.project_name.toLowerCase()) ||
                   project.project_name.toLowerCase().includes(profile.project_name.toLowerCase());
      console.log(`Strategy 4 - Fuzzy Name: "${profile.project_name}" ~~ "${project.project_name}" = ${match}`);
      return match;
    });
    
    // Pick the best match
    const matchingProfile = exactIdMatch || exactNameMatch || projectIdMatch || fuzzyNameMatch;
    
    console.log('Final matching profile:', matchingProfile);
    console.log('=== CONTENT ARCHIVES MATCHING END ===');
    
    if (matchingProfile) {
      setSelectedProjectProfile(matchingProfile);
      setIsProjectProfileModalOpen(true);
    } else {
      toast.warning(`No specific content archives found for "${project.project_name}". Content archives are separate reference documents and may not exist for every project.`);
    }
  };

  const handleResourcesModalClose = () => {
    setIsResourcesModalOpen(false);
    setSelectedProjectForResources(null);
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
                  {/* Projects Section */}
                  {(() => {
                    // Filter out projects where project_number starts with '0000'
                    const filteredProjects = matchingProjects.filter(project => {
                      const projectNumber = project.project_number || '';
                      return !projectNumber.startsWith('0000');
                    });

                    // Filter projects with profiles similarly
                    const filteredProjectsWithProfiles = projectsWithProfiles.filter(project => {
                      const projectNumber = project.project_number || '';
                      return !projectNumber.startsWith('0000');
                    });

                    // Enhanced deduplication function with profile priority
                    const deduplicateWithProfilePriority = (regularProjects, profileProjects) => {
                      const projectMap = new Map();
                      
                      // First, add all regular projects
                      regularProjects.forEach(project => {
                        projectMap.set(project.project_id, { 
                          ...project, 
                          sourceType: 'regular',
                          hasProfile: false 
                        });
                      });
                      
                      // Then, add profile projects (will overwrite duplicates with profile priority)
                      profileProjects.forEach(project => {
                        projectMap.set(project.project_id, { 
                          ...project, 
                          sourceType: 'withProfiles',
                          hasProfile: true 
                        });
                      });
                      
                      return Array.from(projectMap.values());
                    };

                    // Debug logging
                    console.log('🔍 Before deduplication:', {
                      regularProjects_count: filteredProjects.length,
                      profileProjects_count: filteredProjectsWithProfiles.length,
                      total: filteredProjects.length + filteredProjectsWithProfiles.length
                    });

                    // NEW: Enhanced deduplication with profile priority
                    const uniqueProjects = deduplicateWithProfilePriority(
                      filteredProjects, 
                      filteredProjectsWithProfiles
                    );

                    // Debug logging
                    console.log('✅ After deduplication:', {
                      unique_count: uniqueProjects.length,
                      with_profiles_count: uniqueProjects.filter(p => p.sourceType === 'withProfiles').length,
                      regular_only_count: uniqueProjects.filter(p => p.sourceType === 'regular').length,
                      duplicates_removed: (filteredProjects.length + filteredProjectsWithProfiles.length) - uniqueProjects.length
                    });

                    // Apply "with profiles" filter if checkbox is checked
                    const finalFilteredProjects = showOnlyWithProfiles 
                      ? uniqueProjects.filter(project => project.sourceType === 'withProfiles')
                      : uniqueProjects;
                    
                    return (
                      <>
                        <div className="projects-header">
                          <h3>Matching Projects ({finalFilteredProjects.length})</h3>
                          <div className="projects-filter">
                            <label className="filter-checkbox">
                              <input
                                type="checkbox"
                                checked={showOnlyWithProfiles}
                                onChange={(e) => setShowOnlyWithProfiles(e.target.checked)}
                              />
                              <span className="checkmark"></span>
                              Show only projects with profiles
                            </label>
                          </div>
                        </div>
                        
                        {finalFilteredProjects.length > 0 ? (
                          <div className="projects-list">
                            {finalFilteredProjects
                              .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
                              .map((project, index) => (
                                <div key={project.project_id || index} className="project-card">
                                  <div className="project-header">
                                    <h4 className="project-name">{project.project_name || 'Unnamed Project'}</h4>
                                    <div className="project-badges">
                                      <span className="project-type-badge">{project.project_type}</span>
                                      {project.sourceType === 'withProfiles' && (
                                        <span className="profile-badge" title="This project has detailed profile information">
                                          📊 Profile
                                        </span>
                                      )}
                                      {project.similarity_percentage && (
                                        <span className="similarity-badge">
                                          <FaPercentage className="similarity-icon" />
                                          {project.similarity_percentage}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="project-details">
                                    <div className="detail-item">
                                      <FaProjectDiagram className="detail-icon" />
                                      <span>Market: {project.primary_segment || 'Unspecified'}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                      <FaDollarSign className="detail-icon" />
                                      <span>Value: {formatCurrency(project.project_contract_labor || project.contract_value || 0)}</span>
                                    </div>

                                    {project.similarity_score && (
                                      <div className="detail-item similarity-detail">
                                        <FaPercentage className="detail-icon" />
                                        <span>Similarity: {(project.similarity_score * 100).toFixed(1)}%</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="project-actions">
                                    <button
                                      className="view-resources-button"
                                      onClick={(e) => handleViewResourcesClick(project, e)}
                                      title="View project resources and team members"
                                    >
                                      <FaUsers className="button-icon" />
                                      View Resources
                                    </button>
                                    
                                    {project.sourceType === 'withProfiles' && (
                                      <button
                                        className="view-content-archives-button"
                                        onClick={(e) => handleViewContentArchivesClick(project, e)}
                                        title="View project profile and content archives"
                                      >
                                        <FaEye className="button-icon" />
                                        View Project Profile
                                      </button>
                                    )}
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
                      setProjectProfiles([]);
                      setProjectsWithProfiles([]);
                      setShowOnlyWithProfiles(false);
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

      {/* Content Archive Modal - Moved outside main modal for proper layering */}
      {isContentModalOpen && selectedContentArchive && (
        <div 
          className="content-modal-overlay" 
          onClick={handleContentModalClose}
          style={{
            background: 'rgba(35, 21, 32, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div className="content-modal" onClick={(e) => e.stopPropagation()}>
            <div className="content-modal-header">
              <h3>{selectedContentArchive.name || 'Project Content'}</h3>
              <button className="content-modal-close" onClick={handleContentModalClose}>
                <FaTimes />
              </button>
            </div>
            <div className="content-modal-body">
              <div 
                className="content-html"
                dangerouslySetInnerHTML={{ __html: selectedContentArchive.content }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Project Profile Detail Modal - Moved outside main modal for proper layering */}
      {isProjectProfileModalOpen && selectedProjectProfile && (
        <div 
          className="content-modal-overlay" 
          onClick={handleProjectProfileModalClose}
          style={{
            background: 'rgba(35, 21, 32, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div className="project-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="content-modal-header">
              <h3>{selectedProjectProfile.project_name || 'Project Profile Details'}</h3>
              <button className="content-modal-close" onClick={handleProjectProfileModalClose}>
                <FaTimes />
              </button>
            </div>
            <div className="project-profile-body">
              <div className="profile-details-grid">
                {/* Basic Information */}
                <div className="detail-section">
                  <h4 className="section-title">Basic Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Project ID:</span>
                    <span className="detail-value">{selectedProjectProfile.project_id || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Project Name:</span>
                    <span className="detail-value">{selectedProjectProfile.project_name || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Project Type:</span>
                    <span className="detail-value">{selectedProjectProfile.project_type || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Facility Owner:</span>
                    <span className="detail-value">{selectedProjectProfile.facility_owner || 'N/A'}</span>
                  </div>
                </div>

                {/* Location & Dates */}
                <div className="detail-section">
                  <h4 className="section-title">Location & Timeline</h4>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{selectedProjectProfile.location || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location State:</span>
                    <span className="detail-value">{selectedProjectProfile.location_state || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Project Dates:</span>
                    <span className="detail-value">{selectedProjectProfile.project_dates || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(selectedProjectProfile.start_date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">End Date:</span>
                    <span className="detail-value">{formatDate(selectedProjectProfile.end_date)}</span>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="detail-section">
                  <h4 className="section-title">Financial Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Contract Value:</span>
                    <span className="detail-value">{formatCurrency(selectedProjectProfile.contract_value)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Construction Cost:</span>
                    <span className="detail-value">{formatCurrency(selectedProjectProfile.construction_cost)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Project Size:</span>
                    <span className="detail-value">{selectedProjectProfile.project_size || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Delivery Method:</span>
                    <span className="detail-value">{selectedProjectProfile.delivery_method || 'N/A'}</span>
                  </div>
                </div>

                {/* Team & Contact Information */}
                <div className="detail-section">
                  <h4 className="section-title">Team & Contact</h4>
                  <div className="detail-row">
                    <span className="detail-label">Key Staff/Project Team:</span>
                    <span className="detail-value">{selectedProjectProfile.key_staff_project_team || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Client Contact:</span>
                    <span className="detail-value">{selectedProjectProfile.client_contact || 'N/A'}</span>
                  </div>
                </div>

                {/* Description & Solutions */}
                {selectedProjectProfile.our_solutions_description && (
                  <div className="detail-section full-width">
                    <h4 className="section-title">Our Solutions Description</h4>
                    <div className="detail-description">
                      {selectedProjectProfile.our_solutions_description}
                    </div>
                  </div>
                )}

                {/* Awards */}
                {selectedProjectProfile.awards && (
                  <div className="detail-section full-width">
                    <h4 className="section-title">Awards</h4>
                    <div className="detail-description">
                      {selectedProjectProfile.awards}
                    </div>
                  </div>
                )}

                {/* Project Lessons */}
                {selectedProjectProfile.project_lessons && (
                  <div className="detail-section full-width">
                    <h4 className="section-title">Project Lessons</h4>
                    <div className="detail-description">
                      {selectedProjectProfile.project_lessons}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources Modal */}
      <ResourcesModal
        isOpen={isResourcesModalOpen}
        onClose={handleResourcesModalClose}
        projectId={selectedProjectForResources?.project_id}
        projectName={selectedProjectForResources?.project_name || 'Unknown Project'}
      />
    </div>
  );
};

export default ProjectProfilesModal;
