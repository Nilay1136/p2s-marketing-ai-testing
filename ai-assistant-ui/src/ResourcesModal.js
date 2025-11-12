import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaUser, FaClock, FaCalendarAlt, FaSpinner, FaBuilding, FaUsers, FaFilter } from 'react-icons/fa';
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
  const [selectedDisciplines, setSelectedDisciplines] = useState(new Set());
  const [availableDisciplines, setAvailableDisciplines] = useState([]);

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
        
        // Extract unique disciplines for filtering
        const disciplines = [...new Set(data.resources
          .map(resource => resource.discipline)
          .filter(discipline => discipline && discipline !== 'N/A')
          .sort()
        )];
        setAvailableDisciplines(disciplines);
        
        // Reset selected disciplines when new data loads
        setSelectedDisciplines(new Set());
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
    if (contactId) {
      setSelectedContactId(contactId);
      setIsResumeModalOpen(true);
    } else {
      toast.warn('Contact ID not available for this resource');
    }
  };

  const handleResumeModalClose = () => {
    setIsResumeModalOpen(false);
    setSelectedContactId(null);
  };

  const handleDisciplineToggle = (discipline) => {
    console.log('=== DISCIPLINE TOGGLE START ===');
    console.log('Toggling discipline:', discipline);
    console.log('Current selectedDisciplines:', selectedDisciplines);
    console.log('selectedDisciplines.size:', selectedDisciplines.size);
    console.log('selectedDisciplines type:', typeof selectedDisciplines);
    
    const newSelected = new Set(selectedDisciplines);
    console.log('Created new Set:', newSelected);
    
    if (newSelected.has(discipline)) {
      newSelected.delete(discipline);
      console.log('Discipline was selected, removing it');
    } else {
      newSelected.add(discipline);
      console.log('Discipline was not selected, adding it');
    }
    
    console.log('New selected disciplines:', newSelected);
    console.log('New selected disciplines size:', newSelected.size);
    setSelectedDisciplines(newSelected);
    console.log('=== DISCIPLINE TOGGLE END ===');
  };

  const handleShowAll = () => {
    console.log('=== SHOW ALL START ===');
    console.log('Clearing all filters');
    setSelectedDisciplines(new Set());
    console.log('=== SHOW ALL END ===');
  };

  const getFilteredResources = useMemo(() => {
    console.log('=== MEMO RECALCULATION START ===');
    console.log('Getting filtered resources...');
    console.log('Selected disciplines:', selectedDisciplines);
    console.log('Selected disciplines size:', selectedDisciplines.size);
    console.log('Total resources:', resources.length);
    
    if (selectedDisciplines.size === 0) {
      console.log('No filters applied, returning all resources');
      console.log('=== MEMO RECALCULATION END (ALL) ===');
      return resources;
    }
    
    const filtered = resources.filter(resource => {
      const hasMatchingDiscipline = resource.discipline && selectedDisciplines.has(resource.discipline);
      console.log(`Resource ${resource.resource} (${resource.discipline}) matches filter:`, hasMatchingDiscipline);
      return hasMatchingDiscipline;
    });
    
    console.log('Filtered resources count:', filtered.length);
    console.log('=== MEMO RECALCULATION END (FILTERED) ===');
    return filtered;
  }, [resources, selectedDisciplines]);

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
                  <h3>Resource Summary ({getFilteredResources.length} of {resources.length} resources)</h3>
                  <p className="summary-description">
                    Click on any resource to view their resume and detailed information.
                  </p>
                </div>

                {/* Discipline Filter Toggles */}
                {availableDisciplines.length > 1 && (
                  <div className="discipline-filters">
                    <div className="filter-header">
                      <FaFilter className="filter-icon" />
                      <span>Filter by Discipline:</span>
                    </div>
                    <div className="filter-buttons">
                      <button 
                        className={`filter-button ${selectedDisciplines.size === 0 ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('All button clicked');
                          handleShowAll();
                        }}
                      >
                        All ({resources.length})
                      </button>
                      {availableDisciplines.map(discipline => (
                        <button
                          key={discipline}
                          className={`filter-button ${selectedDisciplines.has(discipline) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Button clicked for discipline:', discipline);
                            handleDisciplineToggle(discipline);
                          }}
                        >
                          {discipline} ({resources.filter(r => r.discipline === discipline).length})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="resources-list">
                  {getFilteredResources.map((resource, index) => (
                    <div 
                      key={`${resource.contactid || 'no-id'}-${index}-${resource.resource || 'unknown'}`}
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