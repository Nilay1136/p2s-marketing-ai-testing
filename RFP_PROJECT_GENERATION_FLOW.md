# RFP Project Generation Flow Documentation

## Overview
This document outlines the complete flow of how projects and projects with profiles are generated and displayed after uploading an RFP document in the Project Profiles Modal.

## Architecture Overview

### Backend Base URL
- **Production**: `https://test-p2s-marketing-assistants.azurewebsites.net/`
- **API Base Path**: `/api/v1`

## Complete Flow Diagram

```
[User Uploads RFP] 
      ↓
[RFP Analysis with Similarity]
      ↓
[Extract Project Type & Description]
      ↓
[Fetch Regular Projects] + [Fetch Projects with Profiles]
      ↓
[Combine & Filter Projects]
      ↓
[Display in UI with Source Tags]
```

## Step-by-Step Process

### 1. RFP Upload and Analysis

#### **Endpoint Used:**
```
POST /api/v1/rfp-projects/rfp/analyze-with-similarity
```

#### **Frontend Logic:**
```javascript
// Location: ProjectProfilesModal.js - analyzeRFP function
const formData = new FormData();
formData.append('file', uploadedFile);
formData.append('user_id', userId || 'default_user');
formData.append('session_id', sessionId || '');
formData.append('enable_similarity', 'true');
formData.append('similarity_threshold', '0.1');
formData.append('top_similar_count', '10');
```

#### **Response Structure:**
```json
{
  "rfp_analysis": {
    "success": true,
    "detected_project_type": "Park/Outdoor",
    "description": "Project description extracted from RFP...",
    "confidence": 95.2
  },
  "matching_projects": {
    "projects": [
      {
        "project_id": "123",
        "project_name": "Sample Project",
        "similarity_score": 0.92,
        "project_type": "Park/Outdoor"
      }
    ]
  }
}
```

#### **Frontend Processing:**
1. Extract `detected_project_type` from response
2. Store initial matching projects from response
3. Trigger additional API calls for comprehensive project data

### 2. Fetch Regular Projects

#### **Endpoint Used:**
```
GET /api/v1/project-profiles/by-type?project_type={projectType}&limit=50&enable_similarity=false
```

#### **Frontend Logic:**
```javascript
// Location: ProjectProfilesModal.js - fetchProjectProfiles function
const fetchProjectProfiles = async (projectType) => {
  const baseUrl = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECT_PROFILES.BY_TYPE(projectType)}`;
  const params = new URLSearchParams({
    limit: '50',
    enable_similarity: 'false'
  });
  
  const response = await fetch(`${baseUrl}&${params}`);
  // Store in projectProfiles state
};
```

#### **Purpose:**
- Fetches comprehensive project profiles for the detected project type
- Used for reference and content archive matching
- Stores in `projectProfiles` state

### 3. Fetch Projects with Profiles

#### **Endpoint Used:**
```
GET /api/v1/projects/with-profiles/by-type?project_type={projectType}&limit=50
```

#### **Frontend Logic:**
```javascript
// Location: ProjectProfilesModal.js - fetchProjectsWithProfiles function
const fetchProjectsWithProfiles = async (projectType) => {
  const baseUrl = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.PROJECTS.WITH_PROFILES_BY_TYPE(projectType)}`;
  const params = new URLSearchParams({
    limit: '50'
  });
  
  const response = await fetch(`${baseUrl}&${params}`);
  // Store in projectsWithProfiles state
};
```

#### **Response Structure:**
```json
{
  "success": true,
  "projects": [
    {
      "project_id": "456",
      "project_name": "Project with Profile",
      "project_type": "Park/Outdoor",
      "content_archives": [...],
      "project_profile": {...}
    }
  ]
}
```

### 4. Project Combination and Filtering Logic

#### **Frontend Logic:**
```javascript
// Location: ProjectProfilesModal.js - JSX render section
// Filter out test projects (starting with '0000')
const filteredProjects = matchingProjects.filter(project => {
  const projectNumber = project.project_number || '';
  return !projectNumber.startsWith('0000');
});

const filteredProjectsWithProfiles = projectsWithProfiles.filter(project => {
  const projectNumber = project.project_number || '';
  return !projectNumber.startsWith('0000');
});

// Combine and tag with source type
const combinedProjects = [
  ...filteredProjects.map(project => ({ ...project, sourceType: 'regular' })),
  ...filteredProjectsWithProfiles.map(project => ({ ...project, sourceType: 'withProfiles' }))
];

// Remove duplicates based on project_id
const uniqueProjects = combinedProjects.filter((project, index, array) => 
  array.findIndex(p => p.project_id === project.project_id) === index
);

// Apply profile filter if checkbox is checked
const finalFilteredProjects = showOnlyWithProfiles 
  ? uniqueProjects.filter(project => project.sourceType === 'withProfiles')
  : uniqueProjects;
```

#### **Filtering Rules:**
1. **Test Project Exclusion**: Remove projects with project numbers starting with '0000'
2. **Source Type Tagging**: 
   - Regular projects → `sourceType: 'regular'`
   - Projects with profiles → `sourceType: 'withProfiles'`
3. **Deduplication**: Remove duplicates based on `project_id`
4. **Profile Filter**: Optional filter to show only projects with profiles

### 5. UI Display Logic

#### **Project Card Rendering:**
```javascript
// Sort by similarity score (highest first)
finalFilteredProjects
  .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
  .map((project, index) => (
    // Render project card
  ))
```

#### **Button Display Logic:**
```javascript
// Only show "View Project Profile" button for projects with profiles
{project.sourceType === 'withProfiles' && (
  <button
    className="view-content-archives-button"
    onClick={(e) => handleViewContentArchivesClick(project, e)}
    title="View project profile and content archives"
  >
    <FaEye className="button-icon" />
    View Project Profile
  </button>
)}
```

#### **Profile Badge Logic:**
```javascript
// Show green "Profile" badge for projects with profiles
{project.sourceType === 'withProfiles' && (
  <span className="profile-badge">Profile</span>
)}
```

## State Management

### **Key State Variables:**

| State Variable | Purpose | Data Source |
|---|---|---|
| `matchingProjects` | Regular projects from initial RFP analysis | RFP analysis response |
| `projectProfiles` | Project profiles for reference | Project Profiles API |
| `projectsWithProfiles` | Projects that have detailed profiles | Projects with Profiles API |
| `showOnlyWithProfiles` | Filter toggle state | User interaction |
| `analysisResult` | RFP analysis results | RFP analysis response |

## API Endpoint Summary

### **Primary Endpoints:**

1. **RFP Analysis**
   - `POST /api/v1/rfp-projects/rfp/analyze-with-similarity`
   - Returns: Project type, description, initial matching projects

2. **Project Profiles**
   - `GET /api/v1/project-profiles/by-type?project_type={type}`
   - Returns: Comprehensive project profiles for reference

3. **Projects with Profiles**
   - `GET /api/v1/projects/with-profiles/by-type?project_type={type}`
   - Returns: Projects with detailed profiles and content archives

### **Parameters:**

| Parameter | Endpoint | Purpose |
|---|---|---|
| `project_type` | All project endpoints | Filter projects by detected type |
| `limit` | Project endpoints | Limit number of results (default: 50) |
| `enable_similarity` | Project profiles | Enable/disable similarity scoring |
| `similarity_threshold` | RFP analysis | Minimum similarity score (0.1) |
| `top_similar_count` | RFP analysis | Maximum similar projects (10) |

## Error Handling

### **Frontend Error Handling:**
```javascript
try {
  // API calls
} catch (error) {
  console.error('Error message:', error);
  toast.error(error.message || 'Default error message');
  // Reset states to prevent UI issues
}
```

### **Common Error Scenarios:**
1. **RFP Analysis Failure**: File upload or processing issues
2. **Project Fetch Failure**: Network issues or invalid project types
3. **Empty Results**: No projects found for detected type

## Performance Considerations

### **Optimization Strategies:**
1. **Parallel API Calls**: `fetchProjectProfiles` and `fetchProjectsWithProfiles` called simultaneously
2. **Deduplication**: Client-side deduplication to prevent duplicate displays
3. **Filtering**: Client-side filtering for better user experience
4. **Lazy Loading**: Only fetch additional data when needed

## Recent Changes

### **Button Logic Fix:**
- **Issue**: Projects from regular API were incorrectly showing profile buttons
- **Solution**: Changed from `(hasContentArchives(project) || project.sourceType === 'withProfiles')` to `project.sourceType === 'withProfiles'`
- **Result**: Only projects with actual profiles now show the "View Project Profile" button

### **Available Content Removal:**
- Removed "Available Content" section from project cards
- Simplified UI by removing content archive listings
- Maintained action buttons for resources and profiles

## Testing Recommendations

### **Test Scenarios:**
1. Upload RFP with known project type
2. Verify both regular and profiled projects are fetched
3. Test filtering with "Show only projects with profiles" checkbox
4. Verify duplicate removal works correctly
5. Test error handling with invalid files or network issues

## Future Enhancements

### **Potential Improvements:**
1. **Caching**: Cache project data to reduce API calls
2. **Pagination**: Implement pagination for large result sets
3. **Advanced Filtering**: Add more filter options (date, value, etc.)
4. **Real-time Updates**: WebSocket integration for live project updates