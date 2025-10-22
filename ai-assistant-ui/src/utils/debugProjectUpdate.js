/**
 * Debug helper for project update issues
 */

export const debugProjectUpdate = async (projectId = 'aBA1R0000008aPdWAI', newType = 'Hospital/Healthcare') => {
  console.log('🔍 === DEBUG PROJECT UPDATE ===');
  
  try {
    const updateRequest = {
      project_id: projectId,
      new_project_type: newType,
      updated_by: 'demo-user'
    };
    
    console.log('📤 Sending request:', updateRequest);
    
    const response = await fetch(`http://localhost:8000/api/v1/rfp-projects/projects/${projectId}/update-type`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateRequest)
    });
    
    console.log('📨 Response status:', response.status);
    console.log('📨 Response ok:', response.ok);
    
    const responseData = await response.json();
    console.log('📋 Response data:', responseData);
    
    if (response.ok && responseData.success) {
      console.log('✅ Update successful via fetch!');
      return { success: true, data: responseData };
    } else {
      console.log('❌ Update failed:', responseData);
      return { success: false, error: responseData };
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    return { success: false, error: error.message };
  }
};

export const debugAxiosUpdate = async (projectId = 'aBA1R0000008aPdWAI', newType = 'Hospital/Healthcare') => {
  console.log('🔍 === DEBUG AXIOS UPDATE ===');
  
  try {
    const axios = (await import('axios')).default;
    
    const updateRequest = {
      project_id: projectId,
      new_project_type: newType,
      updated_by: 'demo-user'
    };
    
    console.log('📤 Sending axios request:', updateRequest);
    
    const response = await axios.put(
      `http://localhost:8000/api/v1/rfp-projects/projects/${projectId}/update-type`,
      updateRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('📨 Axios response status:', response.status);
    console.log('📨 Axios response data:', response.data);
    
    if (response.data && response.data.success) {
      console.log('✅ Axios update successful!');
      return { success: true, data: response.data };
    } else {
      console.log('❌ Axios update failed:', response.data);
      return { success: false, error: response.data };
    }
    
  } catch (error) {
    console.error('❌ Axios debug test failed:', error);
    console.error('📋 Full error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return { success: false, error: error.message };
  }
};

// Test both methods
export const debugBothMethods = async () => {
  console.log('🔍 === TESTING BOTH UPDATE METHODS ===');
  
  const fetchResult = await debugProjectUpdate();
  console.log('📊 Fetch result:', fetchResult);
  
  const axiosResult = await debugAxiosUpdate();
  console.log('📊 Axios result:', axiosResult);
  
  return { fetchResult, axiosResult };
};

// Export for browser console use
if (typeof window !== 'undefined') {
  window.debugProjectUpdate = debugProjectUpdate;
  window.debugAxiosUpdate = debugAxiosUpdate;
  window.debugBothMethods = debugBothMethods;
}