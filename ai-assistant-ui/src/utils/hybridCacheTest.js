/**
 * Test file for Hybrid Cache Manager
 * Tests the multi-layer caching system
 */

import { hybridCacheManager } from './hybridCacheManager.js';

export const testHybridCache = async () => {
  console.log('=== Hybrid Cache Manager Test ===');
  
  try {
    // Mock API function for testing
    const mockAPIFunction = async (filters, pagination) => {
      console.log('Mock API called with:', { filters, pagination });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock data based on filters
      const mockProjects = generateMockProjects(filters, pagination);
      
      return {
        projects: mockProjects,
        total: 11500, // Simulate large dataset
        hasMore: true,
        source: 'api'
      };
    };

    // Test 1: First API call (should miss all caches)
    console.log('1. Testing first API call...');
    const startTime1 = performance.now();
    const result1 = await hybridCacheManager.getProjects(
      { year: '2025', type: 'Airport/Transportation' },
      { limit: 50, offset: 0 },
      { apiFunction: mockAPIFunction }
    );
    const time1 = performance.now() - startTime1;
    console.log(`First call: ${result1.projects.length} projects in ${time1.toFixed(2)}ms, source: ${result1.source}`);

    // Test 2: Same request (should hit memory cache)
    console.log('2. Testing memory cache hit...');
    const startTime2 = performance.now();
    const result2 = await hybridCacheManager.getProjects(
      { year: '2025', type: 'Airport/Transportation' },
      { limit: 50, offset: 0 }
    );
    const time2 = performance.now() - startTime2;
    console.log(`Second call: ${result2.projects.length} projects in ${time2.toFixed(2)}ms, source: ${result2.source}`);

    // Test 3: Different filters (should miss memory, might hit IndexedDB)
    console.log('3. Testing different filters...');
    const startTime3 = performance.now();
    const result3 = await hybridCacheManager.getProjects(
      { year: '2024', type: 'Commercial/Retail' },
      { limit: 50, offset: 0 },
      { apiFunction: mockAPIFunction }
    );
    const time3 = performance.now() - startTime3;
    console.log(`Third call: ${result3.projects.length} projects in ${time3.toFixed(2)}ms, source: ${result3.source}`);

    // Test 4: Get filter options
    console.log('4. Testing filter options cache...');
    const filterOptions = await hybridCacheManager.getFilterOptions();
    console.log('Filter options:', filterOptions);

    // Test 5: Cache statistics
    console.log('5. Getting cache statistics...');
    const stats = await hybridCacheManager.getCacheStats();
    console.log('Cache stats:', stats);

    // Test 6: Force refresh
    console.log('6. Testing force refresh...');
    const startTime4 = performance.now();
    const result4 = await hybridCacheManager.getProjects(
      { year: '2025', type: 'Airport/Transportation' },
      { limit: 50, offset: 0 },
      { apiFunction: mockAPIFunction, forceRefresh: true }
    );
    const time4 = performance.now() - startTime4;
    console.log(`Force refresh: ${result4.projects.length} projects in ${time4.toFixed(2)}ms, source: ${result4.source}`);

    // Test 7: Test large dataset caching
    console.log('7. Testing large dataset caching...');
    const largeResult = await hybridCacheManager.getProjects(
      {}, // No filters = full dataset
      { limit: 1000, offset: 0 },
      { apiFunction: mockAPIFunction }
    );
    console.log(`Large dataset: ${largeResult.projects.length} projects, source: ${largeResult.source}`);

    // Test 8: Memory cache limits
    console.log('8. Testing memory cache limits...');
    // Generate multiple cache entries to test limits
    for (let i = 0; i < 5; i++) {
      await hybridCacheManager.getProjects(
        { year: '2023', type: `TestType${i}` },
        { limit: 100, offset: i * 100 },
        { apiFunction: mockAPIFunction }
      );
    }

    // Final statistics
    const finalStats = await hybridCacheManager.getCacheStats();
    console.log('Final cache stats:', finalStats);

    console.log('=== Hybrid Cache Tests Completed Successfully! ===');
    return true;

  } catch (error) {
    console.error('Hybrid cache test failed:', error);
    return false;
  }
};

// Generate mock projects for testing
const generateMockProjects = (filters = {}, pagination = {}) => {
  const { year, type } = filters;
  const { limit = 50, offset = 0 } = pagination;
  
  const projects = [];
  
  for (let i = 0; i < limit; i++) {
    const projectIndex = offset + i + 1;
    projects.push({
      project_id: `${year || '2025'}-MOCK-${String(projectIndex).padStart(6, '0')}`,
      project_name: `Mock Project ${projectIndex} - ${type || 'General'}`,
      project_type: type || 'Airport/Transportation',
      project_year: year || '2025',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return projects;
};

// Performance comparison test
export const performanceComparison = async () => {
  console.log('=== Performance Comparison Test ===');
  
  const mockAPIFunction = async (filters, pagination) => {
    // Simulate slower API
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      projects: generateMockProjects(filters, pagination),
      total: 11500,
      hasMore: true
    };
  };

  const testCases = [
    { year: '2025', type: 'Airport/Transportation' },
    { year: '2024', type: 'Commercial/Retail' },
    { year: '2023', type: 'Hospital/Healthcare' }
  ];

  console.log('Running performance tests...');
  
  for (let i = 0; i < testCases.length; i++) {
    const filters = testCases[i];
    
    // First call (API)
    const apiStart = performance.now();
    await hybridCacheManager.getProjects(filters, {}, { 
      apiFunction: mockAPIFunction,
      forceRefresh: true 
    });
    const apiTime = performance.now() - apiStart;
    
    // Second call (Cache)
    const cacheStart = performance.now();
    await hybridCacheManager.getProjects(filters, {});
    const cacheTime = performance.now() - cacheStart;
    
    const speedup = (apiTime / cacheTime).toFixed(2);
    console.log(`Test ${i + 1}: API: ${apiTime.toFixed(2)}ms, Cache: ${cacheTime.toFixed(2)}ms, Speedup: ${speedup}x`);
  }
  
  console.log('Performance comparison completed!');
};

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testHybridCache = testHybridCache;
  window.performanceComparison = performanceComparison;
}