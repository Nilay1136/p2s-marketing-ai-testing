/**
 * Storage Utility Test File
 * Run this in browser console to test localStorage management
 */

import StorageManager from './utils/storageUtils';

export const testStorageManager = () => {
  console.log('Testing StorageManager...');
  
  // Test 1: Basic storage operations
  console.log('\n1. Testing basic operations...');
  const testData = { test: 'data', timestamp: Date.now() };
  const success = StorageManager.safeSetItem('test_key', testData);
  console.log('Set item success:', success);
  
  const retrieved = StorageManager.safeGetItem('test_key');
  console.log('Retrieved:', retrieved);
  console.log('Data matches:', JSON.stringify(testData) === JSON.stringify(retrieved));
  
  // Test 2: Storage statistics
  console.log('\n2. Testing storage stats...');
  const stats = StorageManager.getStorageStats();
  console.log('Storage stats:', stats);
  
  // Test 3: Cache expiration
  console.log('\n3. Testing cache expiration...');
  const expiredData = StorageManager.safeGetItem('test_key', { maxAge: 1 }); // 1ms
  setTimeout(() => {
    const shouldBeNull = StorageManager.safeGetItem('test_key', { maxAge: 1 });
    console.log('Expired data (should be null):', shouldBeNull);
  }, 10);
  
  // Test 4: Large data handling
  console.log('\n4. Testing large data...');
  const largeData = 'x'.repeat(1024 * 1024); // 1MB of data
  const largeSuccess = StorageManager.safeSetItem('large_test', largeData);
  console.log('Large data storage success:', largeSuccess);
  
  // Test 5: Cleanup
  console.log('\n5. Testing cleanup...');
  const cleanedCount = StorageManager.cleanupOldData();
  console.log('Cleaned items:', cleanedCount);
  
  // Cleanup test data
  StorageManager.removeItem('test_key');
  StorageManager.removeItem('large_test');
  
  console.log('\nStorageManager tests completed!');
};

// Export for use in browser console
window.testStorageManager = testStorageManager;