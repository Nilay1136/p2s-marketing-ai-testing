/**
 * Test file for Background Sync Manager
 * Tests background synchronization functionality
 */

import { backgroundSyncManager } from './backgroundSyncManager.js';

export const testBackgroundSync = async () => {
  console.log('=== Background Sync Manager Test ===');
  
  try {
    // Test 1: Check initial status
    console.log('1. Checking initial sync status...');
    const initialStatus = backgroundSyncManager.getSyncStatus();
    console.log('Initial status:', initialStatus);

    // Test 2: Start background sync
    console.log('2. Starting background sync...');
    backgroundSyncManager.start({ immediate: false, intervalMinutes: 1 }); // 1 minute for testing
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const activeStatus = backgroundSyncManager.getSyncStatus();
    console.log('Active status:', activeStatus);

    // Test 3: Force immediate sync with progress tracking
    console.log('3. Testing force sync with progress tracking...');
    
    const progressCallback = (progress) => {
      console.log(`Sync progress: ${progress.phase} - ${progress.progress}% (${progress.itemsProcessed}/${progress.totalItems})`);
    };

    const syncResult = await backgroundSyncManager.forcSync({
      onProgress: progressCallback
    });
    
    console.log('Force sync result:', syncResult);

    // Test 4: Check sync status after completion
    console.log('4. Checking status after sync...');
    const postSyncStatus = backgroundSyncManager.getSyncStatus();
    console.log('Post-sync status:', postSyncStatus);

    // Test 5: Test sync needed check
    console.log('5. Testing sync needed check...');
    const syncNeeded = await backgroundSyncManager.isSyncNeeded();
    console.log('Sync needed:', syncNeeded);

    // Test 6: Stop background sync
    console.log('6. Stopping background sync...');
    backgroundSyncManager.stop();
    
    const stoppedStatus = backgroundSyncManager.getSyncStatus();
    console.log('Stopped status:', stoppedStatus);

    console.log('=== Background Sync Tests Completed! ===');
    return true;

  } catch (error) {
    console.error('Background sync test failed:', error);
    return false;
  }
};

// Mock sync test (doesn't require API)
export const testMockSync = async () => {
  console.log('=== Mock Background Sync Test ===');
  
  // Override the fetchFreshData method for testing
  const originalFetchFreshData = backgroundSyncManager.fetchFreshData;
  
  backgroundSyncManager.fetchFreshData = async (onProgress) => {
    console.log('Mock API: Generating test data...');
    
    const totalItems = 1000;
    const batchSize = 100;
    const allProjects = [];
    
    for (let i = 0; i < totalItems; i += batchSize) {
      const batch = [];
      for (let j = 0; j < Math.min(batchSize, totalItems - i); j++) {
        batch.push({
          project_id: `MOCK-${String(i + j + 1).padStart(6, '0')}`,
          project_name: `Mock Project ${i + j + 1}`,
          project_type: 'Test Type',
          project_year: '2025',
          created_at: new Date().toISOString()
        });
      }
      
      allProjects.push(...batch);
      
      // Simulate progress
      if (onProgress) {
        onProgress({
          phase: 'fetching',
          progress: Math.round((allProjects.length / totalItems) * 100),
          currentBatch: Math.floor(i / batchSize) + 1,
          totalBatches: Math.ceil(totalItems / batchSize),
          itemsProcessed: allProjects.length,
          totalItems: totalItems
        });
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return {
      projects: allProjects,
      total: allProjects.length,
      timestamp: Date.now()
    };
  };

  try {
    console.log('Starting mock sync test...');
    
    const progressCallback = (progress) => {
      console.log(`Mock Sync: ${progress.phase} - ${progress.progress}% (Batch ${progress.currentBatch}/${progress.totalBatches})`);
    };

    const syncResult = await backgroundSyncManager.forcSync({
      onProgress: progressCallback
    });
    
    console.log('Mock sync result:', syncResult);
    
    // Restore original method
    backgroundSyncManager.fetchFreshData = originalFetchFreshData;
    
    console.log('=== Mock Sync Test Completed! ===');
    return true;

  } catch (error) {
    console.error('Mock sync test failed:', error);
    
    // Restore original method
    backgroundSyncManager.fetchFreshData = originalFetchFreshData;
    return false;
  }
};

// Stress test for sync manager
export const stressTestSync = async () => {
  console.log('=== Background Sync Stress Test ===');
  
  try {
    console.log('Running multiple concurrent sync operations...');
    
    // Start background sync
    backgroundSyncManager.start({ intervalMinutes: 0.1 }); // Very frequent for testing
    
    // Try multiple force syncs (should be queued/rejected)
    const syncPromises = [];
    for (let i = 0; i < 5; i++) {
      syncPromises.push(
        backgroundSyncManager.forcSync()
          .then(result => ({ index: i, result }))
          .catch(error => ({ index: i, error: error.message }))
      );
    }
    
    const results = await Promise.all(syncPromises);
    console.log('Concurrent sync results:', results);
    
    // Test rapid start/stop cycles
    for (let i = 0; i < 3; i++) {
      backgroundSyncManager.stop();
      backgroundSyncManager.start({ intervalMinutes: 0.1 });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final cleanup
    backgroundSyncManager.stop();
    
    console.log('=== Stress Test Completed! ===');
    return true;

  } catch (error) {
    console.error('Stress test failed:', error);
    backgroundSyncManager.stop();
    return false;
  }
};

// Performance monitoring test
export const monitorSyncPerformance = async (durationMinutes = 5) => {
  console.log(`=== Sync Performance Monitor (${durationMinutes} minutes) ===`);
  
  const stats = [];
  let isMonitoring = true;
  
  // Start background sync with short interval
  backgroundSyncManager.start({ intervalMinutes: 0.5 });
  
  // Monitor sync operations
  const monitorInterval = setInterval(() => {
    const status = backgroundSyncManager.getSyncStatus();
    stats.push({
      timestamp: Date.now(),
      isRunning: status.syncState.isRunning,
      phase: status.syncState.phase,
      progress: status.syncState.progress,
      lastSyncDuration: status.statistics.lastSyncDuration,
      successfulSyncs: status.statistics.successfulSyncs,
      failedSyncs: status.statistics.failedSyncs,
      memoryUsage: performance.memory ? {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      } : null
    });
    
    if (!isMonitoring) {
      clearInterval(monitorInterval);
    }
  }, 1000);
  
  // Stop monitoring after specified duration
  setTimeout(() => {
    isMonitoring = false;
    backgroundSyncManager.stop();
    
    console.log('Performance monitoring completed');
    console.log('Statistics collected:', stats.length, 'data points');
    
    // Analyze performance
    const syncTimes = stats.filter(s => s.lastSyncDuration > 0).map(s => s.lastSyncDuration);
    if (syncTimes.length > 0) {
      const avgSyncTime = syncTimes.reduce((a, b) => a + b, 0) / syncTimes.length;
      const minSyncTime = Math.min(...syncTimes);
      const maxSyncTime = Math.max(...syncTimes);
      
      console.log('Sync Performance Analysis:');
      console.log(`  Average sync time: ${avgSyncTime.toFixed(2)}ms`);
      console.log(`  Min sync time: ${minSyncTime.toFixed(2)}ms`);
      console.log(`  Max sync time: ${maxSyncTime.toFixed(2)}ms`);
      console.log(`  Total syncs: ${syncTimes.length}`);
    }
    
    // Memory usage analysis
    const memoryStats = stats.filter(s => s.memoryUsage).map(s => s.memoryUsage.usedJSHeapSize);
    if (memoryStats.length > 0) {
      const avgMemory = memoryStats.reduce((a, b) => a + b, 0) / memoryStats.length;
      const maxMemory = Math.max(...memoryStats);
      
      console.log('Memory Usage Analysis:');
      console.log(`  Average memory: ${avgMemory.toFixed(2)}MB`);
      console.log(`  Peak memory: ${maxMemory.toFixed(2)}MB`);
    }
    
  }, durationMinutes * 60 * 1000);
  
  console.log(`Performance monitoring started for ${durationMinutes} minutes...`);
  return stats;
};

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testBackgroundSync = testBackgroundSync;
  window.testMockSync = testMockSync;
  window.stressTestSync = stressTestSync;
  window.monitorSyncPerformance = monitorSyncPerformance;
}