/**
 * Background Sync Manager for P2S Marketing AI
 * Handles background data synchronization without blocking the UI
 * Implements intelligent sync strategies and conflict resolution
 */

import { hybridCacheManager } from './hybridCacheManager.js';
import axios from 'axios';
import { API_ENDPOINTS } from '../apiConfig.js';

export class BackgroundSyncManager {
  constructor() {
    this.isActive = false;
    this.syncInterval = null;
    this.lastSyncAttempt = null;
    this.lastSuccessfulSync = null;
    this.failureCount = 0;
    this.maxFailures = 3;
    
    // Sync configuration
    this.config = {
      syncIntervalMinutes: 30, // Sync every 30 minutes
      maxRetryDelay: 5 * 60 * 1000, // Max 5 minutes retry delay
      batchSize: 1000, // Process 1000 projects at a time
      backgroundThreshold: 5000, // Use background sync for datasets > 5000
      idleTimeout: 2000, // Wait for UI idle
      networkTimeout: 30000 // 30 second network timeout
    };

    // Sync state tracking
    this.syncState = {
      isRunning: false,
      progress: 0,
      totalItems: 0,
      currentBatch: 0,
      error: null,
      phase: 'idle' // idle, fetching, processing, complete, error
    };

    // Event listeners for network and visibility changes
    this.setupEventListeners();
    
    // Sync statistics
    this.stats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      dataUpdated: 0,
      lastSyncDuration: 0
    };
  }

  /**
   * Start background synchronization
   * @param {Object} options - Sync options
   */
  start(options = {}) {
    if (this.isActive) {
      console.log('Background sync already active');
      return;
    }

    const { 
      immediate = false, 
      intervalMinutes = this.config.syncIntervalMinutes 
    } = options;

    this.isActive = true;
    this.config.syncIntervalMinutes = intervalMinutes;

    console.log(`Starting background sync (interval: ${intervalMinutes} minutes)`);

    // Perform immediate sync if requested
    if (immediate) {
      this.performSync({ background: true });
    }

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync({ background: true });
    }, intervalMinutes * 60 * 1000);

    console.log('Background sync started successfully');
  }

  /**
   * Stop background synchronization
   */
  stop() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    console.log('Background sync stopped');
  }

  /**
   * Perform data synchronization
   * @param {Object} options - Sync options
   * @returns {Promise<Object>}
   */
  async performSync(options = {}) {
    const { 
      background = false, 
      forceRefresh = false,
      onProgress = null,
      priority = 'normal' // normal, high, low
    } = options;

    // Prevent concurrent syncs
    if (this.syncState.isRunning) {
      console.log('Sync already in progress, skipping');
      return { success: false, reason: 'sync_in_progress' };
    }

    this.lastSyncAttempt = Date.now();
    this.syncState.isRunning = true;
    this.syncState.phase = 'fetching';
    this.syncState.error = null;

    const syncStartTime = performance.now();

    try {
      console.log(`Starting ${background ? 'background' : 'foreground'} sync...`);

      // Step 1: Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No network connection available');
      }

      // Step 2: Check if sync is needed
      if (!forceRefresh && !await this.isSyncNeeded()) {
        console.log('Data is up to date, skipping sync');
        return this.completSync(syncStartTime, true, 'up_to_date');
      }

      // Step 3: Wait for UI idle if background sync
      if (background) {
        await this.waitForIdle();
      }

      // Step 4: Fetch fresh data from API
      this.syncState.phase = 'fetching';
      const freshData = await this.fetchFreshData(onProgress);

      if (!freshData || !freshData.projects || freshData.projects.length === 0) {
        throw new Error('No data received from API');
      }

      // Step 5: Process and store data
      this.syncState.phase = 'processing';
      await this.processAndStoreData(freshData, onProgress);

      // Step 6: Update metadata and statistics
      await this.updateSyncMetadata(freshData);

      return this.completSync(syncStartTime, true, 'success', freshData);

    } catch (error) {
      console.error('Sync failed:', error);
      this.failureCount++;
      this.syncState.error = error.message;
      this.syncState.phase = 'error';

      return this.completSync(syncStartTime, false, error.message);
    }
  }

  /**
   * Check if synchronization is needed
   * @returns {Promise<boolean>}
   */
  async isSyncNeeded() {
    try {
      // Check cache age
      const cacheStats = await hybridCacheManager.getCacheStats();
      const lastUpdate = cacheStats?.indexedDB?.lastUpdate;

      if (!lastUpdate) {
        console.log('No previous cache found, sync needed');
        return true;
      }

      const cacheAge = Date.now() - new Date(lastUpdate).getTime();
      const maxAge = this.config.syncIntervalMinutes * 60 * 1000;

      if (cacheAge > maxAge) {
        console.log(`Cache age (${Math.round(cacheAge / 60000)} min) exceeds threshold (${this.config.syncIntervalMinutes} min)`);
        return true;
      }

      // Check if API has newer data (lightweight check)
      const response = await axios.get(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECTS.STATS}`, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success && response.data.stats) {
        const apiLastModified = new Date(response.data.stats.last_modified);
        const cacheLastModified = new Date(lastUpdate);

        if (apiLastModified > cacheLastModified) {
          console.log('API has newer data, sync needed');
          return true;
        }
      }

      return false;

    } catch (error) {
      console.warn('Could not check if sync is needed:', error);
      // Default to syncing if we can't determine
      return true;
    }
  }

  /**
   * Fetch fresh data from API
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>}
   */
  async fetchFreshData(onProgress = null) {
    try {
      // Get total count first
      const statsResponse = await axios.get(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECTS.STATS}`, {
        timeout: this.config.networkTimeout,
        headers: { 'Content-Type': 'application/json' }
      });

      const totalCount = statsResponse.data?.stats?.total_projects || 11500;
      this.syncState.totalItems = totalCount;

      console.log(`Fetching ${totalCount} projects from API...`);

      const allProjects = [];
      const batchSize = this.config.batchSize;
      let offset = 0;
      let batchNumber = 0;

      while (offset < totalCount) {
        batchNumber++;
        this.syncState.currentBatch = batchNumber;

        console.log(`Fetching batch ${batchNumber}: ${offset}-${offset + batchSize}/${totalCount}`);

        const response = await axios.get(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECTS.ALL}`, {
          params: {
            limit: batchSize,
            offset: offset
          },
          timeout: this.config.networkTimeout,
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.data.success || !response.data.projects) {
          throw new Error(`Batch ${batchNumber} failed: ${response.data.message || 'Unknown error'}`);
        }

        const batchProjects = response.data.projects;
        allProjects.push(...batchProjects);

        // Update progress
        this.syncState.progress = Math.round((allProjects.length / totalCount) * 100);
        
        if (onProgress) {
          onProgress({
            phase: 'fetching',
            progress: this.syncState.progress,
            currentBatch: batchNumber,
            totalBatches: Math.ceil(totalCount / batchSize),
            itemsProcessed: allProjects.length,
            totalItems: totalCount
          });
        }

        offset += batchSize;

        // If we got fewer projects than requested, we've reached the end
        if (batchProjects.length < batchSize) {
          break;
        }

        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Successfully fetched ${allProjects.length} projects`);

      return {
        projects: allProjects,
        total: allProjects.length,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Error fetching fresh data:', error);
      throw error;
    }
  }

  /**
   * Process and store data in cache
   * @param {Object} data - Fresh data from API
   * @param {Function} onProgress - Progress callback
   */
  async processAndStoreData(data, onProgress = null) {
    try {
      console.log('Processing and storing data...');

      // Clear existing cache to ensure fresh data
      await hybridCacheManager.clearCache({ 
        clearIndexedDB: true, 
        clearMemory: true 
      });

      // Store in hybrid cache
      await hybridCacheManager.storeInCache(data, {}, {}, 'full_dataset');

      this.syncState.progress = 100;
      
      if (onProgress) {
        onProgress({
          phase: 'processing',
          progress: 100,
          itemsProcessed: data.projects.length,
          totalItems: data.projects.length
        });
      }

      console.log('Data processing completed');

    } catch (error) {
      console.error('Error processing data:', error);
      throw error;
    }
  }

  /**
   * Update sync metadata
   * @param {Object} data - Synced data
   */
  async updateSyncMetadata(data) {
    try {
      this.lastSuccessfulSync = Date.now();
      this.failureCount = 0;
      
      this.stats.totalSyncs++;
      this.stats.successfulSyncs++;
      this.stats.dataUpdated = data.projects.length;

      console.log('Sync metadata updated');

    } catch (error) {
      console.error('Error updating sync metadata:', error);
    }
  }

  /**
   * Complete sync operation
   * @param {number} startTime - Sync start time
   * @param {boolean} success - Whether sync succeeded
   * @param {string} reason - Success/failure reason
   * @param {Object} data - Synced data (if successful)
   * @returns {Object}
   */
  completSync(startTime, success, reason, data = null) {
    const duration = performance.now() - startTime;
    this.stats.lastSyncDuration = duration;

    if (success) {
      this.stats.averageSyncTime = (this.stats.averageSyncTime * (this.stats.successfulSyncs - 1) + duration) / this.stats.successfulSyncs;
    } else {
      this.stats.failedSyncs++;
    }

    this.syncState.isRunning = false;
    this.syncState.phase = success ? 'complete' : 'error';
    this.syncState.progress = success ? 100 : 0;

    const result = {
      success,
      reason,
      duration: Math.round(duration),
      itemsProcessed: data?.projects?.length || 0,
      timestamp: Date.now()
    };

    console.log(`Sync completed: ${success ? 'SUCCESS' : 'FAILED'} in ${Math.round(duration)}ms - ${reason}`);

    return result;
  }

  /**
   * Wait for UI to be idle
   * @returns {Promise<void>}
   */
  async waitForIdle() {
    return new Promise(resolve => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(resolve, { timeout: this.config.idleTimeout });
      } else {
        setTimeout(resolve, this.config.idleTimeout);
      }
    });
  }

  /**
   * Set up event listeners for network and visibility changes
   */
  setupEventListeners() {
    // Network connectivity changes
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      if (this.isActive && this.failureCount > 0) {
        // Retry sync when connection is restored
        setTimeout(() => {
          this.performSync({ background: true });
        }, 1000);
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isActive) {
        // Check if sync is needed when page becomes visible
        const timeSinceLastSync = this.lastSuccessfulSync ? 
          Date.now() - this.lastSuccessfulSync : 
          Infinity;
        
        // Sync if it's been more than 2x the normal interval
        if (timeSinceLastSync > this.config.syncIntervalMinutes * 2 * 60 * 1000) {
          this.performSync({ background: true });
        }
      }
    });
  }

  /**
   * Get sync status and statistics
   * @returns {Object}
   */
  getSyncStatus() {
    return {
      isActive: this.isActive,
      syncState: { ...this.syncState },
      lastSyncAttempt: this.lastSyncAttempt ? new Date(this.lastSyncAttempt) : null,
      lastSuccessfulSync: this.lastSuccessfulSync ? new Date(this.lastSuccessfulSync) : null,
      failureCount: this.failureCount,
      config: { ...this.config },
      statistics: { ...this.stats },
      networkStatus: navigator.onLine,
      pageVisible: !document.hidden
    };
  }

  /**
   * Force an immediate sync
   * @param {Object} options - Sync options
   * @returns {Promise<Object>}
   */
  async forcSync(options = {}) {
    return this.performSync({
      ...options,
      background: false,
      forceRefresh: true
    });
  }
}

// Create singleton instance
export const backgroundSyncManager = new BackgroundSyncManager();

export default BackgroundSyncManager;