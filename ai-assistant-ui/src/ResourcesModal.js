import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaClock, FaCalendarAlt, FaSpinner, FaBuilding, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './apiConfig';
import ResumeModal from './ResumeModal';
import './ResourcesModal.css';

const ResourcesModal = ({ isOpen, onClose, projectId, projectName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchResourcesSummary();
    }
  }, [isOpen, projectId]);

  const fetchResourcesSummary = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.TIMECARDS.RESOURCES_SUMMARY(projectId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.resources) {
        setResources(data.resources);
      } else {
        throw new Error(data.message || 'Failed to load resources');
      }

    } catch (error) {
      console.error('Error fetching resources:', error);
      setError(error.message);
      toast.error(error.message || 'Failed to load project resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceClick = (contactId) => {
    setSelectedContactId(contactId);
    setIsResumeModalOpen(true);
  };

  const handleResumeModalClose = () => {
    setIsResumeModalOpen(false);
    setSelectedContactId(null);
  };

  const handleClose = () => {
    setResources([]);
    setError(null);
    setIsLoading(false);
    setSelectedContactId(null);
    setIsResumeModalOpen(false);
    onClose();
  };

  const formatHours = (hours) => {
    const numHours = parseFloat(hours);
    return isNaN(numHours) ? '0.00' : numHours.toFixed(2);
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
    <>
      <div 
        className="resources-modal-overlay modal-overlay"
        style={{
          background: 'rgba(35, 21, 32, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        <div className="resources-modal">
          <div className="modal-header">
            <div className="modal-title">
              <FaUsers className="modal-icon" />
              <div>
                <h2>Project Resources</h2>
                <span className="project-subtitle">{projectName}</span>
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
                <p>Loading project resources...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p className="error-message">Error: {error}</p>
                <button 
                  className="retry-button"
                  onClick={fetchResourcesSummary}
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !error && resources.length === 0 && (
              <div className="empty-state">
                <FaUsers className="empty-icon" />
                <p>No resources found for this project.</p>
              </div>
            )}

            {!isLoading && !error && resources.length > 0 && (
              <>
                <div className="resources-summary">
                  <h3>Resource Summary ({resources.length} resources)</h3>
                  <p className="summary-description">
                    Click on any resource to view their resume and detailed information.
                  </p>
                </div>

                <div className="resources-list">
                  {resources.map((resource, index) => (
                    <div 
                      key={resource.contactid || index} 
                      className="resource-card clickable"
                      onClick={() => handleResourceClick(resource.contactid)}
                    >
                      <div className="resource-header">
                        <div className="resource-name-section">
                          <FaUser className="resource-icon" />
                          <div>
                            <h4 className="resource-name">{resource.resource || 'Unknown Resource'}</h4>
                            <span className="resource-role">{resource.resourcerole || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="resource-hours">
                          <FaClock className="hours-icon" />
                          <span className="hours-value">{formatHours(resource.total_hours)} hrs</span>
                        </div>
                      </div>

                      <div className="resource-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <FaBuilding className="detail-icon" />
                            <span>Discipline: {resource.discipline || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <FaUser className="detail-icon" />
                            <span>Studio Leader: {resource.StudioLeader || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="detail-row">
                          <div className="detail-item">
                            <FaCalendarAlt className="detail-icon" />
                            <span>Start: {formatDate(resource.earliest_date)}</span>
                          </div>
                          <div className="detail-item">
                            <FaCalendarAlt className="detail-icon" />
                            <span>End: {formatDate(resource.latest_date)}</span>
                          </div>
                        </div>

                        <div className="detail-row">
                          <div className="detail-item">
                            <FaClock className="detail-icon" />
                            <span>Timecard Entries: {resource.timecard_count || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="click-hint">
                        <span>Click to view resume →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resume Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={handleResumeModalClose}
        contactId={selectedContactId}
      />
    </>
  );
};

export default ResourcesModal;