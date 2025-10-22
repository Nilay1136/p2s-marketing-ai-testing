/**
 * Storage Utility Functions
 * Provides robust localStorage management with quota handling
 */

export class StorageManager {
  static CACHE_VERSION = '2.0';
  static MAX_CACHE_SIZE_MB = 8;
  static CACHE_DISABLED_FLAG = 'cache_disabled';

  /**
   * Safely set item in localStorage with quota handling
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   * @param {Object} options - Storage options
   * @returns {boolean} - Success status
   */
  static safeSetItem(key, value, options = {}) {
    try {
      // Check if caching is disabled
      if (sessionStorage.getItem(this.CACHE_DISABLED_FLAG) === 'true') {
        console.log('Caching disabled for this session');
        return false;
      }

      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const sizeInMB = (new Blob([stringValue]).size / 1024 / 1024).toFixed(2);

      // Check size limit
      if (parseFloat(sizeInMB) > this.MAX_CACHE_SIZE_MB) {
        console.warn(`Data too large (${sizeInMB} MB), exceeds limit (${this.MAX_CACHE_SIZE_MB} MB)`);
        return false;
      }

      // Check available storage
      const availableStorage = this.getAvailableStorage();
      const requiredSize = new Blob([stringValue]).size;

      if (requiredSize > availableStorage * 0.8) {
        console.warn('Insufficient storage space, attempting cleanup...');
        this.cleanupOldData();
        
        // Check again after cleanup
        const newAvailableStorage = this.getAvailableStorage();
        if (requiredSize > newAvailableStorage * 0.8) {
          console.warn('Still insufficient storage after cleanup');
          return false;
        }
      }

      localStorage.setItem(key, stringValue);
      
      // Store metadata
      if (options.withTimestamp !== false) {
        localStorage.setItem(`${key}_timestamp`, Date.now().toString());
      }
      if (options.withVersion !== false) {
        localStorage.setItem(`${key}_version`, this.CACHE_VERSION);
      }

      console.log(`Successfully cached: ${key} (${sizeInMB} MB)`);
      return true;

    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      } else {
        console.error('Storage error:', error);
      }
      return false;
    }
  }

  /**
   * Safely get item from localStorage with validation
   * @param {string} key - Storage key
   * @param {Object} options - Retrieval options
   * @returns {any|null} - Retrieved value or null
   */
  static safeGetItem(key, options = {}) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;

      // Check timestamp if required
      if (options.maxAge) {
        const timestamp = localStorage.getItem(`${key}_timestamp`);
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          if (age > options.maxAge) {
            console.log(`Cache expired for ${key}, age: ${Math.floor(age / 1000 / 60)} minutes`);
            this.removeItem(key);
            return null;
          }
        }
      }

      // Check version compatibility
      if (options.checkVersion !== false) {
        const version = localStorage.getItem(`${key}_version`);
        if (version && version !== this.CACHE_VERSION) {
          console.log(`Cache version mismatch for ${key}, clearing...`);
          this.removeItem(key);
          return null;
        }
      }

      // Try to parse JSON, return string if parsing fails
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }

    } catch (error) {
      console.error('Error retrieving from storage:', error);
      return null;
    }
  }

  /**
   * Remove item and its metadata from localStorage
   * @param {string} key - Storage key
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
      localStorage.removeItem(`${key}_version`);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }

  /**
   * Get current storage usage statistics
   * @returns {Object} - Storage statistics
   */
  static getStorageStats() {
    let totalSize = 0;
    let itemCount = 0;
    const items = {};

    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage[key];
          const size = (value.length + key.length) * 2; // UTF-16 encoding
          totalSize += size;
          itemCount++;
          items[key] = {
            size: size,
            sizeKB: (size / 1024).toFixed(2)
          };
        }
      }

      return {
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        itemCount,
        items,
        available: this.getAvailableStorage()
      };
    } catch (error) {
      console.error('Error calculating storage stats:', error);
      return null;
    }
  }

  /**
   * Get available localStorage space
   * @returns {number} - Available bytes
   */
  static getAvailableStorage() {
    try {
      let testSize = 1024; // Start with 1KB
      let maxStorage = 0;

      while (testSize <= 10 * 1024 * 1024) { // Test up to 10MB
        try {
          const testData = 'x'.repeat(testSize);
          localStorage.setItem('__storage_test__', testData);
          localStorage.removeItem('__storage_test__');
          maxStorage = testSize;
          testSize *= 2;
        } catch (e) {
          break;
        }
      }

      // Calculate current usage
      let currentUsage = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          currentUsage += (localStorage[key].length + key.length) * 2;
        }
      }

      return Math.max(0, maxStorage - currentUsage);
    } catch (error) {
      console.warn('Could not determine available storage:', error);
      return 1024 * 1024; // Default to 1MB
    }
  }

  /**
   * Clean up old or unnecessary data
   * @returns {number} - Number of items removed
   */
  static cleanupOldData() {
    try {
      const keysToRemove = [];
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // Remove old timestamps and versions
        if (key.endsWith('_timestamp') || key.endsWith('_version')) {
          const baseKey = key.replace(/_timestamp$|_version$/, '');
          if (!localStorage.getItem(baseKey)) {
            keysToRemove.push(key);
          }
        }

        // Remove old cache data
        if (key.startsWith('p2s_') && key !== 'p2s_all_projects' && key !== 'p2s_projects_cache_time') {
          const timestamp = localStorage.getItem(`${key}_timestamp`);
          if (timestamp && (now - parseInt(timestamp)) > maxAge) {
            keysToRemove.push(key);
          }
        }

        // Remove debug/temp data
        if (key.includes('debug') || key.includes('temp') || key.includes('test')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        this.removeItem(key);
      });

      console.log(`Cleanup completed: removed ${keysToRemove.length} old items`);
      return keysToRemove.length;

    } catch (error) {
      console.error('Error during cleanup:', error);
      return 0;
    }
  }

  /**
   * Handle quota exceeded error
   */
  static handleQuotaExceeded() {
    console.warn('Storage quota exceeded - implementing emergency cleanup');
    
    try {
      // Emergency cleanup
      const removedCount = this.cleanupOldData();
      
      // Clear largest non-essential items
      const stats = this.getStorageStats();
      if (stats && stats.items) {
        const sortedItems = Object.entries(stats.items)
          .sort((a, b) => b[1].size - a[1].size)
          .slice(0, 5); // Top 5 largest items
        
        sortedItems.forEach(([key]) => {
          if (!key.includes('demo_user') && !key.includes('auth')) {
            this.removeItem(key);
          }
        });
      }
      
      // Disable caching for this session
      sessionStorage.setItem(this.CACHE_DISABLED_FLAG, 'true');
      
      return {
        success: true,
        removedCount,
        message: `Storage full. Cleared ${removedCount} items. Cache disabled for this session.`
      };

    } catch (error) {
      console.error('Emergency cleanup failed:', error);
      sessionStorage.setItem(this.CACHE_DISABLED_FLAG, 'true');
      return {
        success: false,
        error: error.message,
        message: 'Storage quota exceeded. Please clear browser data manually.'
      };
    }
  }

  /**
   * Check if caching is disabled for current session
   * @returns {boolean}
   */
  static isCacheDisabled() {
    return sessionStorage.getItem(this.CACHE_DISABLED_FLAG) === 'true';
  }

  /**
   * Re-enable caching for current session
   */
  static enableCache() {
    sessionStorage.removeItem(this.CACHE_DISABLED_FLAG);
  }

  /**
   * Get cache status for a specific key
   * @param {string} key - Storage key
   * @returns {Object} - Cache status information
   */
  static getCacheStatus(key) {
    try {
      const value = localStorage.getItem(key);
      const timestamp = localStorage.getItem(`${key}_timestamp`);
      const version = localStorage.getItem(`${key}_version`);

      if (!value) {
        return { exists: false };
      }

      const sizeInMB = (new Blob([value]).size / 1024 / 1024).toFixed(2);
      const age = timestamp ? Date.now() - parseInt(timestamp) : null;

      return {
        exists: true,
        sizeInMB: parseFloat(sizeInMB),
        ageInMinutes: age ? Math.floor(age / 1000 / 60) : null,
        version,
        timestamp: timestamp ? new Date(parseInt(timestamp)) : null
      };

    } catch (error) {
      console.error('Error checking cache status:', error);
      return { exists: false, error: true };
    }
  }
}

// Export individual functions for convenience
export const {
  safeSetItem,
  safeGetItem,
  removeItem,
  getStorageStats,
  getAvailableStorage,
  cleanupOldData,
  handleQuotaExceeded,
  isCacheDisabled,
  enableCache,
  getCacheStatus
} = StorageManager;

export default StorageManager;