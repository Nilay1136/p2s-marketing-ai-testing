/**
 * IndexedDB Manager for P2S Marketing AI
 * Handles large datasets efficiently with robust error handling and performance optimization
 */

export class IndexedDBManager {
  static DB_NAME = 'P2S_MarketingAI_Cache';
  static DB_VERSION = 1;
  static STORES = {
    PROJECTS: 'projects',
    METADATA: 'metadata',
    FILTERS: 'filters'
  };

  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Extract year from project ID (fallback method)
   * @param {string} projectId - Project ID
   * @returns {string|null}
   */
  extractYearFromProjectId(projectId) {
    if (!projectId) return null;
    const match = projectId.match(/^(\d{4})-/);
    return match ? String(match[1]) : null;
  }

  /**
   * Initialize the IndexedDB database
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported by this browser'));
        return;
      }

      const request = indexedDB.open(IndexedDBManager.DB_NAME, IndexedDBManager.DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('IndexedDB upgrade needed, creating object stores...');

        // Create projects store with indexes for efficient querying
        if (!db.objectStoreNames.contains(IndexedDBManager.STORES.PROJECTS)) {
          const projectsStore = db.createObjectStore(IndexedDBManager.STORES.PROJECTS, {
            keyPath: 'project_id'
          });

          // Create indexes for fast filtering and searching
          projectsStore.createIndex('project_type', 'project_type', { unique: false });
          projectsStore.createIndex('project_year', 'project_year', { unique: false });
          projectsStore.createIndex('project_name', 'project_name', { unique: false });
          projectsStore.createIndex('year_type', ['project_year', 'project_type'], { unique: false });
          
          console.log('Projects store created with indexes');
        }

        // Create metadata store for cache management
        if (!db.objectStoreNames.contains(IndexedDBManager.STORES.METADATA)) {
          const metadataStore = db.createObjectStore(IndexedDBManager.STORES.METADATA, {
            keyPath: 'key'
          });
          console.log('Metadata store created');
        }

        // Create filters store for cached filter results
        if (!db.objectStoreNames.contains(IndexedDBManager.STORES.FILTERS)) {
          const filtersStore = db.createObjectStore(IndexedDBManager.STORES.FILTERS, {
            keyPath: 'filter_key'
          });
          filtersStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('Filters store created');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Store projects in bulk with transaction batching for performance
   * @param {Array} projects - Array of project objects
   * @param {Object} options - Storage options
   * @returns {Promise<boolean>}
   */
  async storeProjects(projects, options = {}) {
    try {
      await this.init();
      
      if (!Array.isArray(projects) || projects.length === 0) {
        throw new Error('Invalid projects data');
      }

      const { batchSize = 1000, updateMetadata = true } = options;
      const transaction = this.db.transaction([IndexedDBManager.STORES.PROJECTS], 'readwrite');
      const store = transaction.objectStore(IndexedDBManager.STORES.PROJECTS);

      let processed = 0;
      const total = projects.length;

      // Process in batches to avoid blocking the main thread
      for (let i = 0; i < projects.length; i += batchSize) {
        const batch = projects.slice(i, i + batchSize);
        
        for (const project of batch) {
          // Ensure project has required fields
          const normalizedProject = {
            ...project,
            project_year: String(project.project_year || this.extractYearFromProjectId(project.project_id) || ''),
            cached_at: Date.now()
          };
          
          store.put(normalizedProject);
          processed++;
        }

        // Log progress for large datasets
        if (total > 1000) {
          console.log(`Stored ${processed}/${total} projects (${Math.round(processed/total*100)}%)`);
        }
      }

      // Wait for transaction to complete
      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });

      // Update metadata
      if (updateMetadata) {
        await this.updateMetadata('projects_count', total);
        await this.updateMetadata('last_projects_update', Date.now());
      }

      console.log(`Successfully stored ${total} projects in IndexedDB`);
      return true;

    } catch (error) {
      console.error('Error storing projects:', error);
      throw error;
    }
  }

  /**
   * Retrieve projects with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getProjects(filters = {}, pagination = {}) {
    try {
      await this.init();
      
      const { 
        year = null, 
        type = null, 
        search = null 
      } = filters;
      
      const { 
        limit = 50, 
        offset = 0 
      } = pagination;

      console.log('IndexedDB: Filtering with', { year, type, search });

      const transaction = this.db.transaction([IndexedDBManager.STORES.PROJECTS], 'readonly');
      const store = transaction.objectStore(IndexedDBManager.STORES.PROJECTS);

      let projects = [];
      let totalCount = 0;

      // Use indexes for efficient filtering when possible
      if (year && type) {
        // Use compound index for year + type filtering
        const index = store.index('year_type');
        const keyRange = IDBKeyRange.only([String(year), type]); // Ensure year is string
        
        const request = index.openCursor(keyRange);
        projects = await this.cursorToArray(request);
        
      } else if (year && year !== 'all') {
        // Use year index
        const index = store.index('project_year');
        const keyRange = IDBKeyRange.only(String(year)); // Ensure year is string
        
        const request = index.openCursor(keyRange);
        projects = await this.cursorToArray(request);
        
      } else if (type && type !== 'all') {
        // Use type index
        const index = store.index('project_type');
        const keyRange = IDBKeyRange.only(type);
        
        const request = index.openCursor(keyRange);
        projects = await this.cursorToArray(request);
        
      } else {
        // Get all projects
        const request = store.openCursor();
        projects = await this.cursorToArray(request);
      }

      // Apply text search if specified
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        projects = projects.filter(project => 
          project.project_name?.toLowerCase().includes(searchLower) ||
          project.project_id?.toLowerCase().includes(searchLower)
        );
      }

      totalCount = projects.length;

      // Apply pagination
      const paginatedProjects = projects.slice(offset, offset + limit);

      console.log(`IndexedDB: Retrieved ${paginatedProjects.length}/${totalCount} projects`);

      return {
        projects: paginatedProjects,
        total: totalCount,
        hasMore: (offset + limit) < totalCount,
        fromCache: true
      };

    } catch (error) {
      console.error('Error retrieving projects:', error);
      throw error;
    }
  }

  /**
   * Get unique values for filters (years, types)
   * @returns {Promise<Object>}
   */
  async getFilterOptions() {
    try {
      await this.init();
      
      const transaction = this.db.transaction([IndexedDBManager.STORES.PROJECTS], 'readonly');
      const store = transaction.objectStore(IndexedDBManager.STORES.PROJECTS);

      // Get unique years
      const yearIndex = store.index('project_year');
      const years = new Set();
      
      await new Promise((resolve, reject) => {
        const request = yearIndex.openKeyCursor(null, 'nextunique');
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.key && cursor.key !== null) {
              years.add(cursor.key);
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      // Get unique types
      const typeIndex = store.index('project_type');
      const types = new Set();
      
      await new Promise((resolve, reject) => {
        const request = typeIndex.openKeyCursor(null, 'nextunique');
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.key && cursor.key !== null) {
              types.add(cursor.key);
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      const result = {
        years: Array.from(years).sort((a, b) => b - a), // Newest first
        types: Array.from(types).sort()
      };

      console.log('Filter options extracted:', result);
      return result;

    } catch (error) {
      console.error('Error getting filter options:', error);
      throw error;
    }
  }

  /**
   * Update or create metadata
   * @param {string} key - Metadata key
   * @param {any} value - Metadata value
   * @returns {Promise<boolean>}
   */
  async updateMetadata(key, value) {
    try {
      await this.init();
      
      const transaction = this.db.transaction([IndexedDBManager.STORES.METADATA], 'readwrite');
      const store = transaction.objectStore(IndexedDBManager.STORES.METADATA);

      const metadata = {
        key,
        value,
        updated_at: Date.now()
      };

      store.put(metadata);

      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });

      return true;

    } catch (error) {
      console.error('Error updating metadata:', error);
      throw error;
    }
  }

  /**
   * Get metadata by key
   * @param {string} key - Metadata key
   * @returns {Promise<any>}
   */
  async getMetadata(key) {
    try {
      await this.init();
      
      const transaction = this.db.transaction([IndexedDBManager.STORES.METADATA], 'readonly');
      const store = transaction.objectStore(IndexedDBManager.STORES.METADATA);

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : null);
        };
        
        request.onerror = () => reject(request.error);
      });

    } catch (error) {
      console.error('Error getting metadata:', error);
      return null;
    }
  }

  /**
   * Clear all projects data
   * @returns {Promise<boolean>}
   */
  async clearProjects() {
    try {
      await this.init();
      
      const transaction = this.db.transaction([IndexedDBManager.STORES.PROJECTS], 'readwrite');
      const store = transaction.objectStore(IndexedDBManager.STORES.PROJECTS);

      store.clear();

      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });

      await this.updateMetadata('projects_count', 0);
      await this.updateMetadata('last_projects_clear', Date.now());

      console.log('Projects cleared from IndexedDB');
      return true;

    } catch (error) {
      console.error('Error clearing projects:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      await this.init();
      
      const [projectsCount, lastUpdate] = await Promise.all([
        this.getMetadata('projects_count'),
        this.getMetadata('last_projects_update')
      ]);

      return {
        projectsCount: projectsCount || 0,
        lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
        isSupported: !!window.indexedDB,
        isInitialized: this.isInitialized
      };

    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        projectsCount: 0,
        lastUpdate: null,
        isSupported: !!window.indexedDB,
        isInitialized: false,
        error: error.message
      };
    }
  }

  /**
   * Helper: Convert cursor to array
   * @param {IDBRequest} cursorRequest - Cursor request
   * @returns {Promise<Array>}
   */
  async cursorToArray(cursorRequest) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }

  /**
   * Helper: Extract year from project ID
   * @param {string} projectId - Project ID
   * @returns {string|null}
   */
  extractYearFromProjectId(projectId) {
    if (!projectId) return null;
    const match = projectId.match(/^(\d{4})-/);
    return match ? match[1] : null;
  }

  /**
   * Check if IndexedDB is supported and working
   * @returns {Promise<boolean>}
   */
  static async isSupported() {
    try {
      if (!window.indexedDB) {
        return false;
      }

      // Test if we can actually use IndexedDB
      const testDB = indexedDB.open('__test__', 1);
      
      return new Promise((resolve) => {
        testDB.onsuccess = () => {
          testDB.result.close();
          indexedDB.deleteDatabase('__test__');
          resolve(true);
        };
        
        testDB.onerror = () => resolve(false);
        testDB.onblocked = () => resolve(false);
      });

    } catch (error) {
      console.warn('IndexedDB support test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const indexedDBManager = new IndexedDBManager();

export default IndexedDBManager;