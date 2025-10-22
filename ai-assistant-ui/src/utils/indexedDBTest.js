/**
 * Test file for IndexedDB Manager
 * Run this in browser console to test the IndexedDB functionality
 */

import { indexedDBManager } from './indexedDBManager.js';

export const testIndexedDB = async () => {
  console.log('=== IndexedDB Manager Test ===');
  
  try {
    // Test 1: Check support
    console.log('1. Testing IndexedDB support...');
    const isSupported = await indexedDBManager.constructor.isSupported();
    console.log('IndexedDB supported:', isSupported);
    
    if (!isSupported) {
      console.error('IndexedDB not supported, aborting tests');
      return false;
    }

    // Test 2: Initialize database
    console.log('2. Initializing database...');
    await indexedDBManager.init();
    console.log('Database initialized successfully');

    // Test 3: Generate sample data
    console.log('3. Generating sample project data...');
    const sampleProjects = generateSampleProjects(100); // Test with 100 projects first
    console.log(`Generated ${sampleProjects.length} sample projects`);

    // Test 4: Store projects
    console.log('4. Storing projects...');
    const startTime = performance.now();
    await indexedDBManager.storeProjects(sampleProjects);
    const storeTime = performance.now() - startTime;
    console.log(`Stored ${sampleProjects.length} projects in ${storeTime.toFixed(2)}ms`);

    // Test 5: Retrieve all projects
    console.log('5. Retrieving all projects...');
    const retrieveStartTime = performance.now();
    const allResults = await indexedDBManager.getProjects();
    const retrieveTime = performance.now() - retrieveStartTime;
    console.log(`Retrieved ${allResults.projects.length}/${allResults.total} projects in ${retrieveTime.toFixed(2)}ms`);

    // Test 6: Filter by year
    console.log('6. Testing year filter...');
    const yearFilterResults = await indexedDBManager.getProjects({ year: '2025' });
    console.log(`Year filter (2025): ${yearFilterResults.projects.length} projects`);

    // Test 7: Filter by type
    console.log('7. Testing type filter...');
    const typeFilterResults = await indexedDBManager.getProjects({ type: 'Airport/Transportation' });
    console.log(`Type filter (Airport/Transportation): ${typeFilterResults.projects.length} projects`);

    // Test 8: Combined filters
    console.log('8. Testing combined filters...');
    const combinedResults = await indexedDBManager.getProjects({ 
      year: '2025', 
      type: 'Airport/Transportation' 
    });
    console.log(`Combined filter: ${combinedResults.projects.length} projects`);

    // Test 9: Search functionality
    console.log('9. Testing search functionality...');
    const searchResults = await indexedDBManager.getProjects({ search: 'test' });
    console.log(`Search results: ${searchResults.projects.length} projects`);

    // Test 10: Pagination
    console.log('10. Testing pagination...');
    const page1 = await indexedDBManager.getProjects({}, { limit: 10, offset: 0 });
    const page2 = await indexedDBManager.getProjects({}, { limit: 10, offset: 10 });
    console.log(`Page 1: ${page1.projects.length} projects, Page 2: ${page2.projects.length} projects`);

    // Test 11: Get filter options
    console.log('11. Testing filter options...');
    const filterOptions = await indexedDBManager.getFilterOptions();
    console.log('Available years:', filterOptions.years);
    console.log('Available types:', filterOptions.types);

    // Test 12: Database statistics
    console.log('12. Getting database statistics...');
    const stats = await indexedDBManager.getStats();
    console.log('Database stats:', stats);

    console.log('=== All tests completed successfully! ===');
    return true;

  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
};

// Generate sample project data for testing
const generateSampleProjects = (count = 100) => {
  const projectTypes = [
    'Airport/Transportation',
    'Central Plant',
    'Commercial/Retail',
    'Data Center',
    'Fire Station',
    'Hospital/Healthcare',
    'Office Building',
    'School/Educational'
  ];

  const years = ['2023', '2024', '2025'];
  
  const projects = [];
  
  for (let i = 1; i <= count; i++) {
    const year = years[Math.floor(Math.random() * years.length)];
    const type = projectTypes[Math.floor(Math.random() * projectTypes.length)];
    
    projects.push({
      project_id: `${year}-TEST-${String(i).padStart(4, '0')}`,
      project_name: `Test Project ${i} - ${type}`,
      project_type: type,
      project_year: year,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return projects;
};

// Export for use in browser console
window.testIndexedDB = testIndexedDB;