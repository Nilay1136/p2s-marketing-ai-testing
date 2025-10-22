/**
 * Hybrid Cache Manager for P2S Marketing AI
 * Coordinates between IndexedDB (persistent), Memory Cache (session), and API calls
 * Implements intelligent caching strategies for optimal performance with large datasets
 */

import { indexedDBManager } from './indexedDBManager.js';
import { StorageManager } from './storageUtils.js';

export class HybridCacheManager {
  constructor() {
    // Memory cache for frequently accessed data (session-only)
    this.memoryCache = new Map();
    this.memoryCacheSize = 0;
    this.maxMemoryCacheSizeMB = 50; // 50MB limit for memory cache
    
    // Cache statistics
    this.stats = {
      memoryHits: 0,
      indexedDBHits: 0,
      apiCalls: 0,
      memoryMisses: 0,
      indexedDBMisses: 0
    };
    
    // Cache configuration
    this.config = {
      memoryTTL: 10 * 60 * 1000, // 10 minutes for memory cache
      indexedDBTTL: 60 * 60 * 1000, // 1 hour for IndexedDB cache
      maxMemoryItems: 1000, // Maximum items in memory
      compressionThreshold: 1024 * 1024, // 1MB - compress larger items
      batchSize: 500 // Batch size for API calls
    };

    // Initialize IndexedDB support check
    this.indexedDBSupported = null;
    this.checkIndexedDBSupport();
  }

  /**
   * Check if IndexedDB is supported
   */
  async checkIndexedDBSupport() {
    try {
      this.indexedDBSupported = await indexedDBManager.constructor.isSupported();
      console.log('IndexedDB support:', this.indexedDBSupported);
    } catch (error) {
      console.warn('IndexedDB support check failed:', error);
      this.indexedDBSupported = false;
    }
  }

  /**
   * Get projects with intelligent caching strategy
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options  
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  async getProjects(filters = {}, pagination = {}, options = {}) {
    const cacheKey = this.generateCacheKey(filters, pagination);
    const { forceRefresh = false, apiFunction = null } = options;

    // Normalize filters
    const normalizedFilters = {
      year: filters.year && filters.year !== 'all' ? String(filters.year) : null,
      type: filters.type && filters.type !== 'all' ? filters.type : null,
      search: filters.search && filters.search.trim() ? filters.search.trim() : null
    };

    try {
      console.log('HybridCache: Getting projects with filters:', normalizedFilters, 'pagination:', pagination);

      // Step 1: Check memory cache first (fastest) only for non-filtered or simple pagination
      if (!forceRefresh && !this.hasComplexFilters(normalizedFilters)) {
        const memoryResult = this.getFromMemoryCache(cacheKey);
        if (memoryResult) {
          this.stats.memoryHits++;
          console.log('Cache HIT (Memory):', cacheKey);
          return {
            ...memoryResult,
            source: 'memory_cache',
            cached: true
          };
        }
        this.stats.memoryMisses++;
      }

      // Step 2: Check IndexedDB cache (persistent) - this handles filtering properly
      if (this.indexedDBSupported && !forceRefresh) {
        const indexedDBResult = await this.getFromIndexedDB(normalizedFilters, pagination);
        if (indexedDBResult && indexedDBResult.projects.length > 0) {
          this.stats.indexedDBHits++;
          console.log('Cache HIT (IndexedDB):', normalizedFilters);
          
          // Store in memory cache for faster future access (only for simple queries)
          if (!this.hasComplexFilters(normalizedFilters)) {
            this.setInMemoryCache(cacheKey, indexedDBResult);
          }
          
          return {
            ...indexedDBResult,
            source: 'indexeddb_cache',
            cached: true
          };
        }
        this.stats.indexedDBMisses++;
      }

      // Step 3: Fetch from API if no cache hit
      if (!apiFunction) {
        throw new Error('No API function provided and no cache available');
      }

      this.stats.apiCalls++;
      console.log('Cache MISS - fetching from API:', normalizedFilters);

      const apiResult = await apiFunction(normalizedFilters, pagination);
      
      if (apiResult && apiResult.projects) {
        // Store in both IndexedDB and memory cache
        await this.storeInCache(apiResult, normalizedFilters, pagination, cacheKey);
        
        return {
          ...apiResult,
          source: 'api',
          cached: false
        };
      }

      throw new Error('No data received from API');

    } catch (error) {
      console.error('Error in hybrid cache manager:', error);
      throw error;
    }
  }

  /**
   * Check if filters are complex (require API call vs cache lookup)
   * @param {Object} filters - Normalized filter criteria
   * @returns {boolean}
   */
  hasComplexFilters(filters) {
    return !!(filters.search || (filters.year && filters.type)); // Search or combined filters are complex
  }

  /**
   * Store fresh data in all cache layers
   * @param {Object} data - Data to cache
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @param {string} cacheKey - Cache key
   */
  async storeInCache(data, filters = {}, pagination = {}, cacheKey = null) {
    try {
      if (!cacheKey) {
        cacheKey = this.generateCacheKey(filters, pagination);
      }

      const timestampedData = {
        ...data,
        cached_at: Date.now(),
        cache_key: cacheKey
      };

      // Store in memory cache
      this.setInMemoryCache(cacheKey, timestampedData);

      // Store full dataset in IndexedDB if supported and this is a full fetch
      if (this.indexedDBSupported && this.isFullDataset(filters, pagination)) {
        await this.storeInIndexedDB(data.projects);
      }

      console.log(`Data cached successfully: ${cacheKey}`);

    } catch (error) {
      console.error('Error storing in cache:', error);
    }
  }

  /**
   * Get data from memory cache
   * @param {string} cacheKey - Cache key
   * @returns {Object|null}
   */
  getFromMemoryCache(cacheKey) {
    const cached = this.memoryCache.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    // Check TTL
    const age = Date.now() - cached.cached_at;
    if (age > this.config.memoryTTL) {
      this.memoryCache.delete(cacheKey);
      this.updateMemoryCacheSize();
      return null;
    }

    return cached;
  }

  /**
   * Set data in memory cache with size management
   * @param {string} cacheKey - Cache key
   * @param {Object} data - Data to cache
   */
  setInMemoryCache(cacheKey, data) {
    try {
      // Calculate approximate size
      const dataSize = this.calculateDataSize(data);
      
      // Check if data is too large for memory cache
      if (dataSize > this.maxMemoryCacheSizeMB * 1024 * 1024) {
        console.warn('Data too large for memory cache, skipping');
        return;
      }

      // Ensure memory cache doesn't exceed limits
      this.enforceMemoryCacheLimits();

      // Store with timestamp
      this.memoryCache.set(cacheKey, {
        ...data,
        cached_at: Date.now(),
        size: dataSize
      });

      this.updateMemoryCacheSize();
      
      console.log(`Memory cache: ${this.memoryCache.size} items, ${(this.memoryCacheSize / 1024 / 1024).toFixed(2)}MB`);

    } catch (error) {
      console.error('Error setting memory cache:', error);
    }
  }

  /**
   * Get data from IndexedDB with filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object|null>}
   */
  async getFromIndexedDB(filters, pagination) {
    try {
      if (!this.indexedDBSupported) {
        return null;
      }

      // Check if IndexedDB has fresh data
      const lastUpdate = await indexedDBManager.getMetadata('last_projects_update');
      if (!lastUpdate) {
        return null;
      }

      const age = Date.now() - lastUpdate;
      if (age > this.config.indexedDBTTL) {
        console.log('IndexedDB cache expired');
        return null;
      }

      // Get filtered data from IndexedDB
      const result = await indexedDBManager.getProjects(filters, pagination);
      
      if (result && result.projects.length > 0) {
        return result;
      }

      return null;

    } catch (error) {
      console.error('Error getting from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Store projects in IndexedDB
   * @param {Array} projects - Projects to store
   */
  async storeInIndexedDB(projects) {
    try {
      if (!this.indexedDBSupported || !Array.isArray(projects)) {
        return;
      }

      // Store projects in chunks to avoid blocking
      const chunkSize = this.config.batchSize;
      for (let i = 0; i < projects.length; i += chunkSize) {
        const chunk = projects.slice(i, i + chunkSize);
        await indexedDBManager.storeProjects(chunk, { 
          batchSize: chunkSize,
          updateMetadata: i === 0 // Only update metadata on first chunk
        });
        
        // Add small delay to prevent blocking
        if (projects.length > 1000) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      console.log(`Stored ${projects.length} projects in IndexedDB`);

    } catch (error) {
      console.error('Error storing in IndexedDB:', error);
    }
  }

  /**
   * Get filter options (years, types) with caching
   * @param {Object} options - Options
   * @returns {Promise<Object>}
   */
  async getFilterOptions(options = {}) {
    const cacheKey = 'filter_options';
    const { forceRefresh = false } = options;

    try {
      // Check memory cache first
      if (!forceRefresh) {
        const memoryResult = this.getFromMemoryCache(cacheKey);
        if (memoryResult) {
          return memoryResult;
        }
      }

      // Check IndexedDB
      if (this.indexedDBSupported) {
        const indexedDBResult = await indexedDBManager.getFilterOptions();
        if (indexedDBResult && (indexedDBResult.years.length > 0 || indexedDBResult.types.length > 0)) {
          this.setInMemoryCache(cacheKey, indexedDBResult);
          return indexedDBResult;
        }
      }

      // Fallback to empty options
      return {
        years: [],
        types: []
      };

    } catch (error) {
      console.error('Error getting filter options:', error);
      return { years: [], types: [] };
    }
  }

  /**
   * Clear all caches
   * @param {Object} options - Clear options
   */
  async clearCache(options = {}) {
    const { 
      clearMemory = true, 
      clearIndexedDB = true, 
      clearLocalStorage = false 
    } = options;

    try {
      if (clearMemory) {
        this.memoryCache.clear();
        this.memoryCacheSize = 0;
        console.log('Memory cache cleared');
      }

      if (clearIndexedDB && this.indexedDBSupported) {
        await indexedDBManager.clearProjects();
        console.log('IndexedDB cache cleared');
      }

      if (clearLocalStorage) {
        StorageManager.cleanupOldData();
        console.log('LocalStorage cache cleared');
      }

      // Reset statistics
      this.stats = {
        memoryHits: 0,
        indexedDBHits: 0,
        apiCalls: 0,
        memoryMisses: 0,
        indexedDBMisses: 0
      };

    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics and health info
   * @returns {Promise<Object>}
   */
  async getCacheStats() {
    try {
      const indexedDBStats = this.indexedDBSupported ? 
        await indexedDBManager.getStats() : 
        { projectsCount: 0, lastUpdate: null };

      const memoryStats = {
        itemCount: this.memoryCache.size,
        sizeMB: (this.memoryCacheSize / 1024 / 1024).toFixed(2),
        maxSizeMB: this.maxMemoryCacheSizeMB
      };

      const hitRate = {
        memory: this.stats.memoryHits / (this.stats.memoryHits + this.stats.memoryMisses) || 0,
        indexedDB: this.stats.indexedDBHits / (this.stats.indexedDBHits + this.stats.indexedDBMisses) || 0,
        overall: (this.stats.memoryHits + this.stats.indexedDBHits) / 
                (this.stats.memoryHits + this.stats.indexedDBHits + this.stats.apiCalls) || 0
      };

      return {
        indexedDBSupported: this.indexedDBSupported,
        indexedDB: indexedDBStats,
        memory: memoryStats,
        statistics: this.stats,
        hitRate,
        config: this.config
      };

    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Generate cache key from filters and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {string}
   */
  generateCacheKey(filters = {}, pagination = {}) {
    const filterParts = [
      filters.year || 'all',
      filters.type || 'all',
      filters.search || 'none',
      pagination.limit || 50,
      pagination.offset || 0
    ];
    
    return `projects_${filterParts.join('_')}`;
  }

  /**
   * Check if this represents a full dataset fetch
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {boolean}
   */
  isFullDataset(filters, pagination) {
    return (!filters.year || filters.year === 'all') &&
           (!filters.type || filters.type === 'all') &&
           (!filters.search || filters.search.trim() === '') &&
           (!pagination.offset || pagination.offset === 0) &&
           (!pagination.limit || pagination.limit >= 1000);
  }

  /**
   * Calculate approximate data size in bytes
   * @param {Object} data - Data object
   * @returns {number}
   */
  calculateDataSize(data) {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (error) {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // UTF-16 encoding
    }
  }

  /**
   * Update memory cache size tracking
   */
  updateMemoryCacheSize() {
    this.memoryCacheSize = 0;
    for (const [key, value] of this.memoryCache) {
      this.memoryCacheSize += value.size || this.calculateDataSize(value);
    }
  }

  /**
   * Enforce memory cache limits (size and count)
   */
  enforceMemoryCacheLimits() {
    const maxSizeBytes = this.maxMemoryCacheSizeMB * 1024 * 1024;
    
    // Remove oldest items if we exceed limits
    while ((this.memoryCacheSize > maxSizeBytes || this.memoryCache.size > this.config.maxMemoryItems) 
           && this.memoryCache.size > 0) {
      
      // Find oldest item
      let oldestKey = null;
      let oldestTime = Date.now();
      
      for (const [key, value] of this.memoryCache) {
        if (value.cached_at < oldestTime) {
          oldestTime = value.cached_at;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
        this.updateMemoryCacheSize();
      } else {
        break; // Safety break
      }
    }
  }
}

// Create singleton instance
export const hybridCacheManager = new HybridCacheManager();

export default HybridCacheManager;