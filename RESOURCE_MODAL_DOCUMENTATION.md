# Resource Modal System Documentation

## Overview

The Resource Modal system is a comprehensive React component system that enables users to analyze RFP documents, discover matching projects, and view detailed project resources and team member information. This document outlines all the logic, backend endpoints, and functionality used throughout the Resource Modal ecosystem.

## System Architecture

The Resource Modal system consists of three main components:

1. **ProjectProfilesModal** - Main modal for RFP analysis and project discovery
2. **ResourcesModal** - Modal for displaying project team resources  
3. **ResumeModal** - Modal for displaying individual team member resumes

## Backend API Base Configuration

```javascript
// Base API URL
API_BASE_URL: "https://test-p2s-marketing-assistants.azurewebsites.net/"
BASE_ENDPOINT: "/api/v1"
```

## Core Functionality & Endpoints

### 1. RFP Document Analysis & Project Discovery

#### Endpoint: RFP Analysis with Similarity
```
POST /api/v1/rfp-projects/rfp/analyze-with-similarity
```

**Purpose:** Analyze uploaded RFP documents to detect project type and find matching projects

**Request Parameters:**
- `file` (FormData): RFP document (PDF, DOC, DOCX - max 10MB)
- `session_id` (string): User session identifier
- `user_id` (string): User identifier
- `description` (string, optional): Additional context about the RFP
- `project_limit` (string): Maximum projects to return (default: "50")
- `enable_similarity` (string): Enable semantic similarity ("true")
- `similarity_threshold` (string): Minimum similarity score ("0.1")
- `top_similar_count` (string): Top similar projects count ("10")

**Response Structure:**
```json
{
  "rfp_analysis": {
    "success": true,
    "detected_project_type": "Hospital/Healthcare",
    "brief_description": "Project description...",
    "confidence_score": 0.95,
    "message": "Analysis completed"
  },
  "matching_projects": {
    "projects": [
      {
        "project_id": "aBA1R0000008aTGWAY",
        "project_name": "Medical Center Expansion",
        "project_type": "Hospital/Healthcare",
        "primary_segment": "Healthcare",
        "project_contract_labor": 2500000,
        "contract_value": 2500000,
        "similarity_score": 0.85,
        "similarity_percentage": "85%"
      }
    ]
  }
}
```

**Logic Flow:**
1. Validate file type and size
2. Build FormData with RFP file and parameters
3. Send POST request to analysis endpoint
4. Extract analysis results and matching projects
5. Automatically fetch project profiles for detected project type
6. Transition to results view

### 2. Project Profiles Management

#### Endpoint: Get Project Profiles by Type
```
GET /api/v1/project-profiles/by-type?project_type={projectType}&limit=50&enable_similarity=false
```

**Purpose:** Fetch detailed project profiles for a specific project type

**Request Parameters:**
- `project_type` (query): URL-encoded project type
- `limit` (query): Maximum profiles to return
- `enable_similarity` (query): Enable similarity analysis

**Response Structure:**
```json
{
  "success": true,
  "project_profiles": [
    {
      "project_id": "aBA1R0000008aTGWAY",
      "project_name": "Medical Center Expansion",
      "project_type": "Hospital/Healthcare",
      "facility_owner": "ABC Health System",
      "location": "Dallas, TX",
      "location_state": "TX",
      "project_dates": "2022-2024",
      "start_date": "2022-01-15",
      "end_date": "2024-06-30",
      "contract_value": 2500000,
      "construction_cost": 15000000,
      "project_size": "150,000 sq ft",
      "delivery_method": "Design-Build",
      "key_staff_project_team": "John Doe, PE; Jane Smith, AIA",
      "client_contact": "Bob Johnson",
      "our_solutions_description": "Comprehensive healthcare facility design...",
      "awards": "AIA Healthcare Design Award 2024",
      "project_lessons": "Key lessons learned..."
    }
  ]
}
```

#### Endpoint: Get Projects with Profiles by Type
```
GET /api/v1/projects/with-profiles/by-type?project_type={projectType}&limit=50
```

**Purpose:** Fetch projects that have associated profile information

**Logic:** Similar to project profiles but focuses on projects with profile data available

### 3. Project Deduplication Logic

The system implements sophisticated deduplication to merge regular projects and projects with profiles:

```javascript
const deduplicateWithProfilePriority = (regularProjects, profileProjects) => {
  const projectMap = new Map();
  
  // Add regular projects first
  regularProjects.forEach(project => {
    projectMap.set(project.project_id, { 
      ...project, 
      sourceType: 'regular',
      hasProfile: false 
    });
  });
  
  // Override with profile projects (higher priority)
  profileProjects.forEach(project => {
    projectMap.set(project.project_id, { 
      ...project, 
      sourceType: 'withProfiles',
      hasProfile: true 
    });
  });
  
  return Array.from(projectMap.values());
};
```

**Filtering Logic:**
- Projects with project numbers starting with '0000' are filtered out
- Profile projects take priority over regular projects during deduplication
- Users can filter to show only projects with profiles

### 4. Project Matching Strategies

The system uses multiple strategies to match projects with their profiles:

```javascript
// Strategy 1: Exact project_id match
const exactIdMatch = projectProfiles.find(profile => 
  profile.project_id === project.project_id
);

// Strategy 2: Exact project_name match
const exactNameMatch = projectProfiles.find(profile => 
  profile.project_name === project.project_name
);

// Strategy 3: ProjectID field match
const projectIdMatch = projectProfiles.find(profile => 
  profile.ProjectID === project.project_id
);

// Strategy 4: Fuzzy name matching
const fuzzyNameMatch = projectProfiles.find(profile => {
  return profile.project_name?.toLowerCase().includes(project.project_name?.toLowerCase()) ||
         project.project_name?.toLowerCase().includes(profile.project_name?.toLowerCase());
});
```

### 5. Project Resources Management

#### Endpoint: Get Project Resources Summary
```
GET /api/v1/timecards/project/{projectId}/resources-summary
```

**Purpose:** Retrieve summarized resource information for a project

**Response Structure:**
```json
{
  "success": true,
  "resources": [
    {
      "contactid": "0031R00002dWhKJQA0",
      "resource": "Smith, John",
      "resourcerole": "Project Manager",
      "discipline": "Architecture",
      "StudioLeader": "Peterson, Kevin",
      "total_hours": 120.50,
      "timecard_count": 15
    }
  ]
}
```

**Resource Filtering Logic:**
- Extract unique disciplines from resources
- Implement real-time filtering by discipline
- Maintain filter state with Set data structure
- Support "Show All" functionality

```javascript
const getFilteredResources = useMemo(() => {
  if (selectedDisciplines.size === 0) {
    return resources; // Show all when no filters
  }
  
  return resources.filter(resource => {
    return resource.discipline && selectedDisciplines.has(resource.discipline);
  });
}, [resources, selectedDisciplines]);
```

### 6. Resume Management

#### Endpoint: Get Resume by Timecard Contact ID
```
GET /api/v1/resumes/contactid/{timecardContactId}
```

**Purpose:** Retrieve detailed resume information for a team member

**Response Structure:**
```json
{
  "success": true,
  "resume": {
    "contactid": "0031R00002dWhKJQA0",
    "name": "Smith, John",
    "title": "Senior Project Manager",
    "education": "[{\"degree\":\"Master of Architecture\",\"school\":\"MIT\"}]",
    "certifications": "[\"LEED AP\",\"PMP\"]",
    "experience": "[{\"position\":\"Project Manager\",\"company\":\"ABC Firm\"}]",
    "awards": "Excellence in Design Award 2023",
    "bio": "Experienced project manager with 15+ years...",
    "file_size_kb": 256.5,
    "file_type": "application/pdf"
  }
}
```

**Data Processing Logic:**
```javascript
const parseJsonField = (jsonString) => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Fallback: split by common delimiters
    return jsonString.split(/[,;|]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
};
```

## User Interface Logic

### 1. Multi-Step Workflow

The modal implements a step-based workflow:

**Step 1: Upload**
- File selection with type validation
- File size validation (10MB limit)
- Optional description input
- Upload progress indication

**Step 2: Results**
- Analysis results display
- Project listing with similarity scores
- Resource viewing capabilities
- Profile viewing capabilities

### 2. State Management

```javascript
// Main modal state
const [step, setStep] = useState('upload'); // 'upload' | 'results'
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [uploadedFile, setUploadedFile] = useState(null);
const [analysisResult, setAnalysisResult] = useState(null);
const [matchingProjects, setMatchingProjects] = useState([]);

// Project profiles state
const [projectProfiles, setProjectProfiles] = useState([]);
const [projectsWithProfiles, setProjectsWithProfiles] = useState([]);
const [showOnlyWithProfiles, setShowOnlyWithProfiles] = useState(false);

// Nested modals state
const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
const [selectedProjectForResources, setSelectedProjectForResources] = useState(null);
const [isProjectProfileModalOpen, setIsProjectProfileModalOpen] = useState(false);
const [selectedProjectProfile, setSelectedProjectProfile] = useState(null);
```

### 3. Event Handling

**Resource View Handler:**
```javascript
const handleViewResourcesClick = (project, event) => {
  event.stopPropagation();
  setSelectedProjectForResources(project);
  setIsResourcesModalOpen(true);
};
```

**Profile View Handler:**
```javascript
const handleViewContentArchivesClick = (project, event) => {
  event.stopPropagation();
  
  if (project.sourceType === 'withProfiles') {
    setSelectedProjectProfile(project);
    setIsProjectProfileModalOpen(true);
    return;
  }
  
  // Complex matching logic for regular projects
  const matchingProfile = exactIdMatch || exactNameMatch || 
                         projectIdMatch || fuzzyNameMatch;
  
  if (matchingProfile) {
    setSelectedProjectProfile(matchingProfile);
    setIsProjectProfileModalOpen(true);
  } else {
    toast.warning('No content archives found for this project');
  }
};
```

## Utility Functions

### 1. Data Formatting

```javascript
// Currency formatting
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  if (amount === 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date formatting
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Hours formatting
const formatHours = (hours) => {
  const numHours = parseFloat(hours);
  return isNaN(numHours) ? '0.00' : numHours.toFixed(2);
};

// File size formatting
const formatFileSize = (sizeKb) => {
  if (!sizeKb) return 'N/A';
  const size = parseFloat(sizeKb);
  if (size < 1024) {
    return `${size.toFixed(1)} KB`;
  }
  return `${(size / 1024).toFixed(1)} MB`;
};
```

### 2. File Validation

```javascript
// Allowed file types
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// File validation logic
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setUploadedFile(file);
  }
};
```

## Error Handling

### 1. API Error Handling

```javascript
try {
  const response = await fetch(endpoint, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Request failed');
  }
  
  const data = await response.json();
  
  if (data.success) {
    // Handle success
  } else {
    throw new Error(data.message || 'Operation failed');
  }
  
} catch (error) {
  console.error('Error:', error);
  toast.error(error.message || 'An error occurred');
}
```

### 2. Loading States

The system implements comprehensive loading states:
- File upload progress
- Analysis progress with spinner
- Resource loading indicators
- Resume loading indicators

### 3. User Feedback

- Success notifications via toast
- Error notifications via toast
- Warning messages for missing data
- Empty state handling

## Performance Considerations

### 1. Memoization

```javascript
// Memoized resource filtering
const getFilteredResources = useMemo(() => {
  // Filtering logic
}, [resources, selectedDisciplines]);
```

### 2. Event Optimization

```javascript
// Prevent event bubbling
const handleButtonClick = (event) => {
  event.stopPropagation();
  // Handle click
};
```

### 3. State Cleanup

```javascript
const handleClose = () => {
  // Reset all state when closing
  setIsUploading(false);
  setIsAnalyzing(false);
  setUploadedFile(null);
  setAnalysisResult(null);
  setMatchingProjects([]);
  // ... reset all state
  onClose();
};
```

## Modal Architecture

### 1. Layered Modal System

The system uses multiple modal layers:
- Base ProjectProfilesModal
- Overlay ResourcesModal
- Overlay ResumeModal
- Overlay ProjectProfileModal

### 2. Modal Styling

```css
.modal-overlay {
  background: rgba(35, 21, 32, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

### 3. Z-Index Management

Proper z-index management ensures modal layering works correctly across the application.

## Integration Points

### 1. Parent Component Integration

```javascript
<ProjectProfilesModal
  isOpen={isModalOpen}
  onClose={handleModalClose}
  userId={currentUserId}
  sessionId={currentSessionId}
/>
```

### 2. Toast Integration

```javascript
import { toast } from 'react-toastify';

// Success notifications
toast.success('RFP analysis completed successfully!');

// Error notifications  
toast.error('Failed to analyze RFP document');

// Warning notifications
toast.warning('No content archives found for this project');
```

### 3. Icon Integration

```javascript
import { 
  FaTimes, FaUpload, FaFileAlt, FaSpinner, 
  FaProjectDiagram, FaBuilding, FaDollarSign, 
  FaEye, FaPercentage, FaInfoCircle, FaUsers,
  FaClock, FaFilter, FaUser, FaGraduationCap,
  FaCertificate, FaTrophy, FaBriefcase, FaCalendarAlt
} from 'react-icons/fa';
```

## Security Considerations

### 1. File Upload Security

- File type validation
- File size limits
- Server-side validation required

### 2. Data Sanitization

- HTML content sanitization for project profiles
- Input validation for all user inputs

### 3. Session Management

- User and session ID validation
- Proper authentication handling

## Conclusion

The Resource Modal system provides a comprehensive solution for RFP analysis, project discovery, and team resource management. It integrates multiple backend APIs, implements sophisticated data processing logic, and provides a seamless user experience through a well-architected modal system.

The system's modular design allows for easy maintenance and extension, while its robust error handling and performance optimizations ensure reliable operation in production environments.