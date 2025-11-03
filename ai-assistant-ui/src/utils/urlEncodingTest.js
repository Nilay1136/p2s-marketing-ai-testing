/**
 * Test for URL encoding fix for project profiles API
 * This tests the fix for handling project types with forward slashes
 */

import { API_ENDPOINTS } from '../apiConfig.js';

export const testUrlEncodingFix = () => {
  console.log('=== URL Encoding Fix Test ===');
  
  const testProjectTypes = [
    'Courthouse', // Simple type without slashes
    'Hospital/Healthcare', // Type with forward slash
    'Airport/Transportation', // Type with forward slash
    'Commercial/Retail', // Type with forward slash
    'Parking Lot/Parking Structure', // Type with multiple slashes and spaces
    'Library/Learning Resource Center', // Complex type with slashes and spaces
  ];

  testProjectTypes.forEach(projectType => {
    const url = API_ENDPOINTS.PROJECT_PROFILES.BY_TYPE(projectType);
    console.log(`Project Type: "${projectType}"`);
    console.log(`Generated URL: ${url}`);
    
    // Verify that the URL uses query parameters
    const hasQueryParam = url.includes('project_type=');
    const isProperlyEncoded = url.includes(encodeURIComponent(projectType));
    
    console.log(`✅ Uses query parameter: ${hasQueryParam}`);
    console.log(`✅ Properly encoded: ${isProperlyEncoded}`);
    console.log('---');
  });

  console.log('=== Test Complete ===');
};

// Test the fetch URL construction similar to ProjectProfilesModal
export const testFetchUrlConstruction = (projectType) => {
  console.log(`\n=== Testing Fetch URL Construction for "${projectType}" ===`);
  
  const baseUrl = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECT_PROFILES.BY_TYPE(projectType)}`;
  const params = new URLSearchParams({
    limit: '50',
    enable_similarity: 'false'
  });
  
  const finalUrl = `${baseUrl}&${params}`;
  
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Additional params: ${params.toString()}`);
  console.log(`Final URL: ${finalUrl}`);
  
  return finalUrl;
};

// Verify that the old problematic URLs are no longer generated
export const verifyNoPathParameters = () => {
  console.log('\n=== Verifying No Path Parameters Used ===');
  
  const problematicTypes = ['Hospital/Healthcare', 'Airport/Transportation'];
  
  problematicTypes.forEach(projectType => {
    const url = API_ENDPOINTS.PROJECT_PROFILES.BY_TYPE(projectType);
    const hasPathSlash = url.includes(`/by-type/${projectType}`) || url.includes(`/by-type/${encodeURIComponent(projectType)}`);
    
    console.log(`Project Type: "${projectType}"`);
    console.log(`URL: ${url}`);
    console.log(`❌ Uses problematic path parameter: ${hasPathSlash}`);
    console.log(`✅ Uses safe query parameter: ${!hasPathSlash && url.includes('project_type=')}`);
    console.log('---');
  });
};

// Run all tests
if (typeof window !== 'undefined') {
  // Browser environment
  window.runUrlEncodingTests = () => {
    testUrlEncodingFix();
    testFetchUrlConstruction('Hospital/Healthcare');
    testFetchUrlConstruction('Courthouse');
    verifyNoPathParameters();
  };
}