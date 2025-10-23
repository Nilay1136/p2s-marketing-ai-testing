import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaTimes, 
  FaFilter, 
  FaEdit, 
  FaSave, 
  FaTimes as FaCancel,
  FaSearch,
  FaSpinner,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSync
} from 'react-icons/fa';
import { API_ENDPOINTS, PROJECT_TYPES, getProjectTypeOptions } from './apiConfig';
import { ProjectCacheManager } from './utils/projectCacheManager';
import './UpdateProjectTypeModal.css';

const UpdateProjectTypeModal = ({ isOpen, onClose, userId }) => {
  // Core data states - simplified for cache-based approach
  const [allProjects, setAllProjects] = useState([]); // All projects from cache/API
  const [filteredProjects, setFilteredProjects] = useState([]); // Filtered projects for display
  const [loading, setLoading] = useState(false); // Loading all projects initially
  const [error, setError] = useState(null);
  
  // Filter states - local filtering only
  const [yearFilter, setYearFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Available filter options - extracted from cached data
  const [availableYears, setAvailableYears] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  
  // Edit mode states - unchanged
  const [editingProjects, setEditingProjects] = useState(new Set());
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sorting - local sorting only
  const [sortField, setSortField] = useState('project_number');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Project type options for dropdown
  const projectTypeOptions = getProjectTypeOptions();

  /**
   * Fetch ALL projects from API (no filters, no pagination)
   * This is called only once and data is cached
   */
  const fetchAllProjectsFromAPI = useCallback(async () => {
    console.log('Fetching ALL projects from API...');
    
    try {
      // Call the correct API endpoint with maximum limit to get all projects
      const response = await axios.get(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECTS.ALL}`, {
        params: { 
          limit: 500, // Maximum allowed per request
          offset: 0 
        },
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('API Response:', response.data);
      
      if (!response.data.success || !response.data.projects) {
        throw new Error(response.data.message || 'Failed to fetch projects');
      }

      let allProjects = [...response.data.projects];
      const totalProjects = response.data.pagination?.total || response.data.total_projects || allProjects.length;
      
      // If there are more projects, fetch them in batches
      if (response.data.pagination?.has_more && allProjects.length < totalProjects) {
        console.log(`Fetching remaining projects... (${allProjects.length}/${totalProjects})`);
        
        let offset = allProjects.length;
        while (offset < totalProjects) {
          console.log(`Fetching batch: offset=${offset}, limit=500`);
          
          const batchResponse = await axios.get(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECTS.ALL}`, {
            params: { 
              limit: 500,
              offset: offset 
            },
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (batchResponse.data.success && batchResponse.data.projects) {
            allProjects = [...allProjects, ...batchResponse.data.projects];
            offset += batchResponse.data.projects.length;
            
            // Break if no more projects returned
            if (batchResponse.data.projects.length === 0) break;
          } else {
            console.warn('Failed to fetch batch, stopping pagination');
            break;
          }
        }
      }

      // Process projects to ensure they have project_year
      const processedProjects = allProjects.map(project => ({
        ...project,
        project_year: project.project_year || ProjectCacheManager.extractYearFromProjectId(project.project_id)
      }));
      
      console.log(`Successfully fetched ${processedProjects.length} total projects from API`);
      return processedProjects;
      
    } catch (error) {
      console.error('Error fetching all projects from API:', error);
      throw error;
    }
  }, []);

  /**
   * Load projects with cache-first approach
   * 1. Check cache first
   * 2. If cache invalid/empty, fetch from API and cache
   * 3. Extract filter options from all data
   * 4. Apply current filters
   */
  const loadAllProjects = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      let projects = [];
      
      // Step 1: Try to get from cache (unless force refresh)
      if (!forceRefresh) {
        projects = ProjectCacheManager.getCachedProjects();
      }
      
      // Step 2: If no cached data or force refresh, fetch from API
      if (!projects || projects.length === 0 || forceRefresh) {
        console.log(forceRefresh ? 'Force refresh requested' : 'No valid cache found');
        
        projects = await fetchAllProjectsFromAPI();
        
        // Cache the fetched data
        const cacheSuccess = ProjectCacheManager.cacheProjects(projects);
        if (cacheSuccess) {
          console.log('Projects successfully cached');
        } else {
          console.warn('Failed to cache projects (storage full?)');
        }
      }
      
      // Step 3: Store all projects and extract filter options
      setAllProjects(projects);
      
      const filterOptions = ProjectCacheManager.extractFilterOptions(projects);
      setAvailableYears(filterOptions.years);
      setAvailableTypes(filterOptions.types);
      
      const loadTime = performance.now() - startTime;
      console.log(`Loaded ${projects.length} projects in ${loadTime.toFixed(2)}ms`);
      
      // Show success toast with sessionStorage info
      const cacheStats = ProjectCacheManager.getCacheStats();
      toast.success(
        `Loaded ${projects.length} projects ${forceRefresh ? '(refreshed)' : '(sessionStorage: ' + cacheStats.size + ' MB)'}`,
        { autoClose: 3000, position: "top-right" }
      );
      
    } catch (error) {
      console.error('Error loading projects:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      setError(`Failed to load projects: ${errorMessage}`);
      toast.error(`Failed to load projects: ${errorMessage}`);
      
      // Clear potentially corrupted cache
      ProjectCacheManager.clearCache();
    } finally {
      setLoading(false);
    }
  }, [fetchAllProjectsFromAPI]);

  /**
   * Apply filters and sorting to all projects locally
   * This is fast since it's all in memory
   */
  const applyFiltersAndSorting = useCallback(() => {
    console.log('Applying local filters and sorting...');
    
    const startTime = performance.now();
    
    // Step 1: Apply filters
    const filtered = ProjectCacheManager.filterProjects(allProjects, {
      year: yearFilter,
      type: typeFilter,
      search: searchTerm
    });
    
    // Step 2: Apply sorting
    const sorted = ProjectCacheManager.sortProjects(filtered, sortField, sortDirection);
    
    setFilteredProjects(sorted);
    
    const filterTime = performance.now() - startTime;
    console.log(`Filtered and sorted ${sorted.length}/${allProjects.length} projects in ${filterTime.toFixed(2)}ms`);
    
  }, [allProjects, yearFilter, typeFilter, searchTerm, sortField, sortDirection]);

  /**
   * Handle search input changes
   * No API calls - just update search term and filter locally
   */
  const handleSearch = useCallback((searchValue) => {
    console.log('Search term changed:', searchValue);
    setSearchTerm(searchValue);
    // Filtering will happen automatically via useEffect
  }, []);

  /**
   * Force refresh data from API and clear sessionStorage cache
   */
  const handleRefreshData = useCallback(async () => {
    console.log('Force refresh requested - clearing sessionStorage cache and fetching fresh data');
    
    // Clear sessionStorage cache first
    ProjectCacheManager.clearCache();
    
    // Show loading toast
    toast.info('🔄 Refreshing all projects...', { autoClose: 2000 });
    
    // Force refresh from API
    await loadAllProjects(true);
  }, [loadAllProjects]);


  // Initialize modal - load all projects once when opened
  useEffect(() => {
    if (isOpen) {
      console.log('=== UPDATE PROJECT TYPE MODAL OPENED ===');
      
      // Load all projects (from cache or API)
      loadAllProjects();
    }
  }, [isOpen, loadAllProjects]);

  // Apply filters and sorting when filter criteria or data changes
  useEffect(() => {
    if (allProjects.length > 0) {
      applyFiltersAndSorting();
    }
  }, [allProjects, yearFilter, typeFilter, searchTerm, sortField, sortDirection, applyFiltersAndSorting]);

  /**
   * Handle column sorting - all local, no API calls
   */
  const handleSort = (field) => {
    console.log('Sorting by field:', field);
    
    if (sortField === field) {
      // Same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
    
    // Filtering and sorting will happen automatically via useEffect
  };

  /**
   * Get sort icon for column headers
   */
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  /**
   * Start editing a project type
   */
  const startEditing = (projectId) => {
    setEditingProjects(prev => new Set([...prev, projectId]));
    
    // Initialize pending update with current project type
    const project = allProjects.find(p => p.project_id === projectId);
    if (project) {
      setPendingUpdates(prev => ({
        ...prev,
        [projectId]: project.project_type || ''
      }));
    }
  };

  /**
   * Cancel editing a project type
   */
  const cancelEditing = (projectId) => {
    setEditingProjects(prev => {
      const newSet = new Set(prev);
      newSet.delete(projectId);
      return newSet;
    });
    setPendingUpdates(prev => {
      const newUpdates = { ...prev };
      delete newUpdates[projectId];
      return newUpdates;
    });
  };

  /**
   * Handle project type change in dropdown
   */
  const handleProjectTypeChange = (projectId, newType) => {
    setPendingUpdates(prev => ({
      ...prev,
      [projectId]: newType
    }));
  };

  /**
   * Save project type change to backend and update cache
   */
  const saveProjectType = async (projectId) => {
    const newTypeKey = pendingUpdates[projectId];
    const project = allProjects.find(p => p.project_id === projectId);
    
    if (!newTypeKey || !project) {
      toast.error('Invalid project type or project not found');
      return;
    }

    // Convert the enum key to the actual project type value
    const newType = PROJECT_TYPES[newTypeKey] || newTypeKey;

    if (newType === project.project_type) {
      // No change, just cancel editing
      cancelEditing(projectId);
      return;
    }

    setIsSubmitting(true);

    try {
      // Fix: Send the actual project type value, not the enum key
      const updateRequest = {
        project_id: projectId,
        new_project_type: newType,
        updated_by: userId || 'demo-user'
      };

      console.log('🔄 Updating project type:', updateRequest);

      const response = await axios.put(
        `${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECTS.UPDATE_TYPE(projectId)}`,
        updateRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Backend response:', response.data);
      console.log('📊 Response status:', response.status);

      if (response.data && response.data.success) {
        console.log('✅ Update successful, updating local state and cache...');
        
        try {
          // Update allProjects state (which will trigger filtering automatically)
          console.log('🔄 Step 1: Updating allProjects state...');
          setAllProjects(prev => {
            const updated = prev.map(p => 
              p.project_id === projectId 
                ? { ...p, project_type: newType }
                : p
            );
            
            // Also update the cache with new data
            ProjectCacheManager.cacheProjects(updated);
            console.log('✅ Cache updated with modified project data');
            
            return updated;
          });
          console.log('✅ Step 1 completed: allProjects state updated');
          
          console.log('🔄 Step 2: Canceling editing and showing toast...');
          cancelEditing(projectId);
          toast.success(`✅ Project type updated to ${newType} for ${projectId}`);
          console.log('✅ Step 2 completed: UI updated');
          
          setIsSubmitting(false);
          console.log('🎉 Project update completed successfully');
          
        } catch (successBlockError) {
          console.error('🚨 Error in success block:', successBlockError);
          throw successBlockError; // Re-throw to be caught by outer catch
        }
        
      } else {
        console.error('❌ Backend returned success:false:', response.data);
        throw new Error(response.data.message || 'Backend returned success: false');
      }
    } catch (error) {
      console.error('❌ Error updating project type:', error);
      console.error('📋 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.response) {
        // Server responded with error status
        const responseData = error.response.data;
        if (typeof responseData === 'object') {
          errorMessage = responseData?.detail || 
                        responseData?.message || 
                        responseData?.error ||
                        JSON.stringify(responseData) ||
                        `Server error: ${error.response.status} ${error.response.statusText}`;
        } else {
          errorMessage = responseData || `Server error: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'Request setup error';
      }
      
      toast.error(`❌ Failed to update project type: ${errorMessage}`);
      setIsSubmitting(false);
    }
    
    console.log('🏁 saveProjectType function completed');
  };

  // Reset modal state when closing
  const handleClose = () => {
    console.log('Closing modal and resetting state');
    
    // Reset filter states
    setSearchTerm('');
    setYearFilter('all');
    setTypeFilter('all');
    
    // Reset data states (keep cache intact)
    setAllProjects([]);
    setFilteredProjects([]);
    setAvailableYears([]);
    setAvailableTypes([]);
    
    // Reset other states
    setError(null);
    setEditingProjects(new Set());
    setPendingUpdates({});
    
    onClose();
  };

  // Extract year from project (now comes from backend)
  const extractYear = (project) => {
    return project?.project_year || 'Unknown';
  };

  // Get project type display name
  const getProjectTypeLabel = (typeKey) => {
    return PROJECT_TYPES[typeKey] || typeKey || 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="update-project-type-modal">
        <div className="modal-header">
          <h2>Update Project Types</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {/* Filters Section */}
          <div className="filters-section">
            <div className="filter-row">
              <div className="filter-group">
                <label>
                  <FaFilter /> Year:
                  <select 
                    value={yearFilter} 
                    onChange={(e) => {
                      const newYear = e.target.value;
                      console.log('📅 Year filter changed:', {
                        from: yearFilter,
                        to: newYear
                      });
                      setYearFilter(newYear);
                    }}
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </label>
              </div>
              
              <div className="filter-group">
                <label>
                  <FaFilter /> Type:
                  <select 
                    value={typeFilter} 
                    onChange={(e) => {
                      console.log('🏗️ Type filter changed to:', e.target.value);
                      setTypeFilter(e.target.value);
                    }}
                  >
                    <option value="all">All Types</option>
                    {availableTypes.map(type => (
                      <option key={type} value={type}>
                        {getProjectTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              
              <div className="filter-group search-group">
                <label>
                  <FaSearch /> Search:
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>
            
            {/* Data status and controls - Updated for sessionStorage */}
            <div className="filter-info">
              <div className="info-left">
                <div className="data-status">
                  Showing {filteredProjects.length} of {allProjects.length} projects
                  {loading && <span className="loading-indicator"> <FaSpinner className="spinning" /> Loading all projects...</span>}
                  {!loading && allProjects.length > 0 && (
                    <span className="cache-info"> 
                      (SessionStorage: {ProjectCacheManager.getCacheStats().size} MB - Data persists during browser session)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="info-right">
                <div className="action-buttons">
                  <button
                    className="refresh-button"
                    onClick={handleRefreshData}
                    disabled={loading}
                    title="Clear session cache and fetch fresh data from server"
                  >
                    <FaSync className={loading ? 'spinning' : ''} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="projects-table-container">
            {loading ? (
              <div className="loading-state">
                <FaSpinner className="spinner" />
                <p>Loading projects...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error: {error}</p>
                <button onClick={handleRefreshData}>Retry</button>
              </div>
            ) : (
              <>
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('project_number')}>
                        Project Number {getSortIcon('project_number')}
                      </th>
                      <th onClick={() => handleSort('project_name')}>
                        Project Name {getSortIcon('project_name')}
                      </th>
                      <th onClick={() => handleSort('project_year')}>
                        Year {getSortIcon('project_year')}
                      </th>
                      <th onClick={() => handleSort('project_type')}>
                        Current Project Type {getSortIcon('project_type')}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.project_id}>
                        <td className="project-id">{project.project_number || project.project_id}</td>
                        <td className="project-name" title={project.project_name}>
                          {project.project_name}
                        </td>
                        <td className="project-year">
                          {extractYear(project)}
                        </td>
                        <td className="project-type">
                          {editingProjects.has(project.project_id) ? (
                            <select
                              value={pendingUpdates[project.project_id] || ''}
                              onChange={(e) => handleProjectTypeChange(project.project_id, e.target.value)}
                              className="project-type-select"
                            >
                              <option value="">Select Type...</option>
                              {projectTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="project-type-display">
                              {getProjectTypeLabel(project.project_type)}
                            </span>
                          )}
                        </td>
                        <td className="actions">
                          {editingProjects.has(project.project_id) ? (
                            <div className="edit-actions">
                              <button
                                onClick={() => saveProjectType(project.project_id)}
                                className="save-button"
                                title="Save changes"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={() => cancelEditing(project.project_id)}
                                className="cancel-button"
                                title="Cancel editing"
                              >
                                <FaCancel />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(project.project_id)}
                              className="edit-button"
                              title="Edit project type"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* No more pagination - all data loaded and filtered locally */}
                {filteredProjects.length === 0 && !loading && (
                  <div className="no-results">
                    <p>No projects found matching your filters.</p>
                    <p>Try adjusting your search criteria or refresh to reload data.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleClose} className="close-modal-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProjectTypeModal;