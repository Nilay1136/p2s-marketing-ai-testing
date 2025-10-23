/**
 * Project Cache Manager
 * Handles caching and local filtering of all projects data using sessionStorage
 * Designed to handle 11500+ projects efficiently with larger storage quotas
 */

export class ProjectCacheManager {
  static CACHE_KEY = 'all_projects_cache';
  static CACHE_EXPIRY_KEY = 'all_projects_cache_expiry';
  static CACHE_DURATION_HOURS = 24; // Cache for 24 hours

  /**
   * Check if cached data is still valid
   * @returns {boolean} - Whether cache is valid
   */
  static isCacheValid() {
    try {
      // Use sessionStorage instead of localStorage
      const expiryTime = sessionStorage.getItem(this.CACHE_EXPIRY_KEY);
      if (!expiryTime) return false;
      
      const now = new Date().getTime();
      const expiry = parseInt(expiryTime);
      
      return now < expiry;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Get cached projects data from sessionStorage
   * @returns {Array|null} - Cached projects or null if not available/invalid
   */
  static getCachedProjects() {
    try {
      if (!this.isCacheValid()) {
        console.log('Project cache expired or invalid');
        return null;
      }

      // Use sessionStorage instead of localStorage
      const cachedData = sessionStorage.getItem(this.CACHE_KEY);
      if (!cachedData) {
        console.log('No cached project data found in sessionStorage');
        return null;
      }

      const projects = JSON.parse(cachedData);
      console.log(`Retrieved ${projects.length} projects from sessionStorage cache`);
      return projects;
    } catch (error) {
      console.error('Error retrieving cached projects from sessionStorage:', error);
      return null;
    }
  }

  /**
   * Cache projects data in sessionStorage
   * @param {Array} projects - Projects array to cache
   * @returns {boolean} - Success status
   */
  static cacheProjects(projects) {
    try {
      // Set expiry time in sessionStorage
      const expiryTime = new Date().getTime() + (this.CACHE_DURATION_HOURS * 60 * 60 * 1000);
      sessionStorage.setItem(this.CACHE_EXPIRY_KEY, expiryTime.toString());

      // Convert projects to JSON string
      const projectsJson = JSON.stringify(projects);
      const sizeInMB = (new Blob([projectsJson]).size / 1024 / 1024).toFixed(2);
      
      console.log(`Attempting to cache ${projects.length} projects (${sizeInMB} MB) in sessionStorage...`);

      // Try to store in sessionStorage (much larger quota than localStorage)
      sessionStorage.setItem(this.CACHE_KEY, projectsJson);
      
      console.log(`✅ Successfully cached ${projects.length} projects (${sizeInMB} MB) in sessionStorage`);
      return true;
      
    } catch (error) {
      console.error('❌ Error caching projects in sessionStorage:', error);
      
      // If sessionStorage is also full, clear some space and try again
      if (error.name === 'QuotaExceededError') {
        console.log('SessionStorage quota exceeded, attempting cleanup...');
        this.clearCache();
        
        try {
          // Calculate expiry time again for retry
          const retryExpiryTime = new Date().getTime() + (this.CACHE_DURATION_HOURS * 60 * 60 * 1000);
          
          // Try once more after clearing
          const projectsJson = JSON.stringify(projects);
          sessionStorage.setItem(this.CACHE_KEY, projectsJson);
          sessionStorage.setItem(this.CACHE_EXPIRY_KEY, retryExpiryTime.toString());
          
          console.log('✅ Successfully cached after cleanup');
          return true;
        } catch (retryError) {
          console.error('❌ Failed to cache even after cleanup:', retryError);
          return false;
        }
      }
      
      return false;
    }
  }

  /**
   * Clear cached projects data from sessionStorage
   */
  static clearCache() {
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
      sessionStorage.removeItem(this.CACHE_EXPIRY_KEY);
      console.log('Project cache cleared from sessionStorage');
    } catch (error) {
      console.error('Error clearing project cache from sessionStorage:', error);
    }
  }

  /**
   * Filter projects locally based on criteria
   * @param {Array} projects - All projects array
   * @param {Object} filters - Filter criteria
   * @param {string} filters.year - Year filter ('all' or specific year)
   * @param {string} filters.type - Type filter ('all' or specific type)
   * @param {string} filters.search - Search term
   * @returns {Array} - Filtered projects
   */
  static filterProjects(projects, filters = {}) {
    if (!Array.isArray(projects)) {
      console.warn('Invalid projects data for filtering');
      return [];
    }

    const { year = 'all', type = 'all', search = '' } = filters;
    
    console.log('Filtering projects locally:', { year, type, search: search ? 'has search term' : 'no search' });
    
    let filtered = [...projects];

    // Filter out projects where project_number starts with '0000' (exclude them)
    const beforeFilter = filtered.length;
    filtered = filtered.filter(project => {
      const projectNumber = project.project_number || '';
      
      // Check if project_number starts with '0000'
      const shouldExclude = projectNumber.startsWith('0000');
      
      // Debug logging for projects we're filtering
      if (shouldExclude) {
        console.log('Filtering out project with project_number starting with 0000:', {
          project_id: project.project_id,
          project_number: projectNumber,
          project_name: project.project_name
        });
      }
      
      // Exclude if project_number starts with '0000'
      return !shouldExclude;
    });
    
    console.log(`Filtered out ${beforeFilter - filtered.length} projects with project_number starting with '0000'`);
    
    console.log(`Filtered out ${beforeFilter - filtered.length} projects starting with '0000'`);

    // Filter by year
    if (year && year !== 'all') {
      filtered = filtered.filter(project => {
        const projectYear = project.project_year || this.extractYearFromProjectId(project.project_id);
        return projectYear === year || projectYear === parseInt(year);
      });
    }

    // Filter by type
    if (type && type !== 'all') {
      filtered = filtered.filter(project => project.project_type === type);
    }

    // Filter by search term (search in project name, project ID, and project number)
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filtered = filtered.filter(project => {
        const projectName = (project.project_name || '').toLowerCase();
        const projectId = (project.project_id || '').toLowerCase();
        const projectNumber = (project.project_number || '').toLowerCase();
        return projectName.includes(searchTerm) || projectId.includes(searchTerm) || projectNumber.includes(searchTerm);
      });
    }

    console.log(`Filtered from ${projects.length} to ${filtered.length} projects (excluded projects with project_number starting with '0000')`);
    return filtered;
  }

  /**
   * Sort projects locally
   * @param {Array} projects - Projects to sort
   * @param {string} field - Field to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} - Sorted projects
   */
  static sortProjects(projects, field = 'project_number', direction = 'asc') {
    if (!Array.isArray(projects)) return [];

    const sorted = [...projects].sort((a, b) => {
      let aVal = a[field] || '';
      let bVal = b[field] || '';

      // Handle different data types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return sorted;
  }

  /**
   * Extract unique filter options from all projects
   * @param {Array} projects - All projects array
   * @returns {Object} - Filter options { years: [], types: [] }
   */
  static extractFilterOptions(projects) {
    if (!Array.isArray(projects)) {
      return { years: [], types: [] };
    }

    // Extract unique years
    const years = [...new Set(
      projects.map(project => {
        return project.project_year || this.extractYearFromProjectId(project.project_id);
      }).filter(Boolean)
    )].sort((a, b) => b - a); // Sort descending (newest first)

    // Extract unique project types
    const types = [...new Set(
      projects.map(project => project.project_type).filter(Boolean)
    )].sort();

    console.log(`Extracted filter options: ${years.length} years, ${types.length} types`);
    
    return { years, types };
  }

  /**
   * Extract year from project ID as fallback
   * @param {string} projectId - Project ID
   * @returns {string|null} - Extracted year or null
   */
  static extractYearFromProjectId(projectId) {
    if (!projectId) return null;
    const match = projectId.match(/^(\d{4})-/);
    return match ? match[1] : null;
  }

  /**
   * Get cache statistics from sessionStorage
   * @returns {Object} - Cache statistics
   */
  static getCacheStats() {
    try {
      const isValid = this.isCacheValid();
      const cachedData = sessionStorage.getItem(this.CACHE_KEY); // Use sessionStorage
      const expiryTime = sessionStorage.getItem(this.CACHE_EXPIRY_KEY); // Use sessionStorage
      
      let stats = {
        isValid,
        hasData: !!cachedData,
        expiryTime: expiryTime ? new Date(parseInt(expiryTime)) : null,
        size: 0,
        count: 0,
        storageType: 'sessionStorage' // Indicate storage type
      };

      if (cachedData) {
        stats.size = (new Blob([cachedData]).size / 1024 / 1024).toFixed(2); // Size in MB
        try {
          const projects = JSON.parse(cachedData);
          stats.count = projects.length;
        } catch (e) {
          console.warn('Invalid JSON in cache');
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { 
        isValid: false, 
        hasData: false, 
        expiryTime: null, 
        size: 0, 
        count: 0,
        storageType: 'sessionStorage'
      };
    }
  }
}