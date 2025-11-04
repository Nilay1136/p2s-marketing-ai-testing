// export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
export const API_BASE_URL = "https://test-p2s-marketing-assistants.azurewebsites.net/"; //test-p2s-marketing-assistants.azurewebsites.net/

// API Endpoints - aligned with backend
export const API_ENDPOINTS = {
  // Base API path
  BASE: `${API_BASE_URL}/api/v1`,
  
  // Session management
  SESSIONS: {
    CREATE: '/sessions',
    LIST: (userId) => `/sessions/${userId}`,
    DELETE: (sessionId) => `/sessions/${sessionId}`,
    FILES: (sessionId) => `/sessions/${sessionId}/files`
  },
  
  // Chat functionality
  CHAT: '/chat',
  
  // File management
  FILES: {
    UPLOAD: '/upload'
  },
  
  // Agent information
  AGENTS: {
    INFO: '/agents/info'
  },
  
  // Health check
  HEALTH: '/health',
  
  // RFP and Project Profiles
  RFP: {
    ANALYZE: '/rfp/analyze',
    ANALYZE_AND_MATCH: '/rfp/analyze-and-match',
    ANALYZE_WITH_SIMILARITY: '/rfp-projects/rfp/analyze-with-similarity'
  },
  
  // Projects - Updated to use correct endpoints
  PROJECTS: {
    BY_TYPE: (projectType) => `/projects/by-type/${projectType}`,
    SEARCH: '/projects/search',
    BY_ID: (projectId) => `/projects/${projectId}`,
    TYPES: '/projects/types/list',
    ALL: '/projects', // Fixed: Correct endpoint for all projects
    UPDATE_TYPE: (projectId) => `/projects/${projectId}/update-type`,
    GET_TYPE: (projectId) => `/projects/${projectId}/type`,
    STATS: '/projects/stats',
    BY_YEAR: (year) => `/projects/by-year/${year}`,
    AVAILABLE_YEARS: '/projects/years/available',
    CONTENT_ARCHIVES: (projectId) => `/projects/${projectId}/content-archives`
  },
  
  // Project Profiles - New endpoints for project profiles table
  PROJECT_PROFILES: {
    BY_TYPE: (projectType) => `/project-profiles/by-type?project_type=${encodeURIComponent(projectType)}`,
    SEARCH: '/project-profiles/search'
  }
};

// Request configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  SUPPORTED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  HEADERS: {
    DEFAULT: {
      'Content-Type': 'application/json'
    },
    MULTIPART: {
    }
  }
};

// Agent types mapping 
export const AGENT_TYPES = {
  FILE_INGESTION: 'file_ingestion',
  SOQ: 'soq', 
  SOCIAL_POSTS: 'social_posts',
  LOI: 'loi',
  PROJECT_APPROACH: 'project_approach'
};

// Map frontend departments to backend agents
export const DEPARTMENT_AGENT_MAP = {
  'Human Resources': AGENT_TYPES.FILE_INGESTION,
  'Marketing': null, // Can be overridden by routing
};

// Project Type Enum - matches backend enum values
export const PROJECT_TYPES = {
  AIRPORT_TRANSPORTATION: "Airport/Transportation",
  CENTRAL_PLANT: "Central Plant",
  CHURCH: "Church",
  CLASSROOM_BUILDING: "Classroom Building",
  COMMERCIAL_RETAIL: "Commercial/Retail",
  COURTHOUSE: "Courthouse",
  DATA_CENTER: "Data Center",
  ELECTRICAL_SUBSTATION: "Electrical Substation",
  FIRE_STATION: "Fire Station",
  POLICE_STATION: "Police Station",
  WATERFRONT_PIER_PORT: "Waterfront/Pier/Port",
  FOOD_SERVICES: "Food Services",
  HOSPITAL_HEALTHCARE: "Hospital/Healthcare",
  OTHER: "Other",
  HOTEL_HOSPITALITY: "Hotel/Hospitality",
  HOUSING: "Housing",
  LABORATORY_CLEAN_ROOM: "Laboratory/Clean Room",
  LIBRARY_LEARNING_RESOURCE: "Library/Learning Resource Center",
  OFFICE_BUILDING: "Office Building",
  PARK_OUTDOOR: "Park/Outdoor",
  PARKING_LOT_STRUCTURE: "Parking Lot/Parking Structure",
  SPORT_RECREATION_AQUATIC: "Sport/Recreation/Aquatic",
  STUDENT_CENTER_UNION: "Student Center/Student Union",
  CAMPUS_EDUCATION: "Campus/Education"
};

// Helper function to get project type options for dropdown
export const getProjectTypeOptions = () => {
  return Object.entries(PROJECT_TYPES).map(([key, value]) => ({
    value: key,
    label: value
  }));
};