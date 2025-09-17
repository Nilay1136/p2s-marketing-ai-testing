// export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
// apiConfig.js - Updated for backend integration
export const API_BASE_URL = "http://localhost:8000";

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
  HEALTH: '/health'
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