# Marketing AI Assistant API Documentation

## Overview
The Marketing AI Assistant is a FastAPI-based application that provides AI-powered marketing content generation and project management capabilities. This document outlines all available API endpoints organized by functionality.

**Base URL**: `http://localhost:8000`  
**API Version**: v1  
**Framework**: FastAPI  

---

## Table of Contents
1. [Root Endpoints](#root-endpoints)
2. [Chat & Session Management](#chat--session-management)
3. [Project Profile Management](#project-profile-management)
4. [RFP & Projects](#rfp--projects)
5. [Timecards](#timecards)
6. [Resumes](#resumes)

---

## Root Endpoints

### Health Check
- **GET** `/`
  - **Description**: Basic API status check
  - **Response**: API version and status
  
- **GET** `/health`
  - **Description**: Comprehensive health check for all services
  - **Response**: Health status of Azure OpenAI and storage services

---

## Chat & Session Management

All chat endpoints are under `/api/v1` prefix.

### Session Management

#### Create Session
- **POST** `/api/v1/sessions`
  - **Description**: Create a new chat session
  - **Request Body**: 
    ```json
    {
      "user_id": "string",
      "title": "string"
    }
    ```
  - **Response**: Session ID and title
  - **Model**: `CreateSessionResponse`

#### List Sessions
- **GET** `/api/v1/sessions/{user_id}`
  - **Description**: Get all sessions for a specific user
  - **Parameters**: 
    - `user_id` (path): User identifier
  - **Response**: List of user sessions with metadata

#### Delete Session
- **DELETE** `/api/v1/sessions/{session_id}`
  - **Description**: Delete a specific chat session
  - **Parameters**: 
    - `session_id` (path): Session identifier
  - **Response**: Success/failure status

### Chat Operations

#### Send Message
- **POST** `/api/v1/chat`
  - **Description**: Send a message and receive AI response
  - **Request Body**: 
    ```json
    {
      "session_id": "string",
      "user_id": "string", 
      "message": "string",
      "files": [{"filename": "string", "content": "base64", "content_type": "string"}],
      "agent_preference": "optional_agent_type"
    }
    ```
  - **Response**: AI response with agent type and content
  - **Model**: `ChatResponse`

#### File Upload
- **POST** `/api/v1/upload`
  - **Description**: Upload files to a chat session
  - **Content-Type**: `multipart/form-data`
  - **Parameters**:
    - `session_id` (form): Session identifier
    - `file` (file): File to upload
  - **Response**: File processing status

#### List Session Files
- **GET** `/api/v1/sessions/{session_id}/files`
  - **Description**: Get all files uploaded to a session
  - **Parameters**: 
    - `session_id` (path): Session identifier
  - **Response**: List of uploaded files with metadata

#### Get Agent Information
- **GET** `/api/v1/agents/info`
  - **Description**: Get information about available AI agents
  - **Response**: List of agents with capabilities and descriptions

---

## Project Profile Management

All project profile endpoints are under `/api/v1/project-profile` prefix.

#### Detect Project Type
- **POST** `/api/v1/project-profile/detect-type`
  - **Description**: Analyze uploaded RFP to detect project type
  - **Content-Type**: `multipart/form-data`
  - **Parameters**:
    - `session_id` (form): Session identifier
    - `user_id` (form): User identifier  
    - `file` (file): RFP document file
  - **Response**: Detected project type with confidence
  - **Model**: `ProjectProfileResponse`

#### List Project Types
- **GET** `/api/v1/project-profile/types`
  - **Description**: Get all available project types
  - **Response**: List of project types with descriptions

#### Get Project Type Info
- **GET** `/api/v1/project-profile/types/{project_type_name}`
  - **Description**: Get detailed information about a specific project type
  - **Parameters**: 
    - `project_type_name` (path): Name of the project type
  - **Response**: Project type details including keywords and description

---

## RFP & Projects

All RFP and project endpoints are under `/api/v1` or `/api/v1/rfp-projects` prefix.

### RFP Analysis

#### Analyze RFP
- **POST** `/api/v1/rfp/analyze`
  - **Description**: Upload and analyze RFP document for project type prediction
  - **Content-Type**: `multipart/form-data`
  - **Parameters**:
    - `session_id` (form): Session identifier
    - `user_id` (form): User identifier
    - `file` (file): RFP document
    - `description` (form, optional): Additional description
  - **Response**: RFP analysis results with project type prediction
  - **Model**: `RFPAnalysisResponse`

#### Analyze RFP and Match Projects
- **POST** `/api/v1/rfp/analyze-and-match`
  - **Description**: Analyze RFP and find matching historical projects
  - **Content-Type**: `multipart/form-data`
  - **Parameters**: Same as analyze RFP
  - **Response**: Analysis results with matched projects
  - **Model**: `RFPProjectMatchResponse`

#### Analyze with Similarity
- **POST** `/api/v1/rfp/analyze-with-similarity`
  - **Description**: Analyze RFP with semantic similarity matching
  - **Content-Type**: `multipart/form-data`
  - **Parameters**: Same as analyze RFP
  - **Response**: Analysis with similarity scores
  - **Model**: `RFPProjectMatchWithSimilarityResponse`

### Project Operations

#### Get Projects by Type
- **GET** `/api/v1/projects/by-type/{project_type}`
  - **Description**: Get all projects of a specific type
  - **Parameters**: 
    - `project_type` (path): Type of projects to retrieve
  - **Response**: List of projects matching the type
  - **Model**: `ProjectsListResponse`

#### Get Projects by Type (with query)
- **GET** `/api/v1/projects/by-type`
  - **Description**: Get projects by type using query parameter
  - **Parameters**: 
    - `project_type` (query): Type of projects to retrieve
  - **Response**: List of projects matching the type
  - **Model**: `ProjectsListResponse`

#### Get Projects with Profiles by Type
- **GET** `/api/v1/projects/with-profiles/by-type/{project_type}`
  - **Description**: Get projects that have project profile entries, filtered by project type (Path Parameter)
  - **Parameters**: 
    - `project_type` (path): Type of projects to retrieve (URL encoded if contains special characters)
    - `limit` (query, optional): Maximum number of projects to return
    - `offset` (query, optional): Number of projects to skip for pagination
    - `search` (query, optional): Search term to filter projects
  - **Response**: List of projects with comprehensive profile data including facility details, financials, team info
  - **Model**: `ProjectsWithProfilesListResponse`
  - **Notes**: 
    - Returns combined data from both Projects and Project_Profiles tables
    - ⚠️ Limitation: May have issues with project types containing forward slashes

#### Get Projects with Profiles by Type (Query Parameter)
- **GET** `/api/v1/projects/with-profiles/by-type`
  - **Description**: Get projects that have project profile entries, filtered by project type (Query Parameter - RECOMMENDED)
  - **Parameters**: 
    - `project_type` (query): Type of projects to retrieve (no URL encoding needed)
    - `limit` (query, optional): Maximum number of projects to return
    - `offset` (query, optional): Number of projects to skip for pagination
    - `search` (query, optional): Search term to filter projects
  - **Response**: List of projects with comprehensive profile data including facility details, financials, team info
  - **Model**: `ProjectsWithProfilesListResponse`
  - **Notes**: 
    - **✅ RECOMMENDED** for project types with special characters (e.g., "Hospital/Healthcare")
    - Returns combined data from both Projects and Project_Profiles tables
    - No URL encoding required
    - Works with all project types

#### Get Project Profiles by Type
- **GET** `/api/v1/project-profiles/by-type/{project_type}`
  - **Description**: Get project profiles for a specific type
  - **Parameters**: 
    - `project_type` (path): Project type name

#### Get Project Profiles by Type (with query)
- **GET** `/api/v1/project-profiles/by-type`
  - **Description**: Get project profiles using query parameter
  - **Parameters**: 
    - `project_type` (query): Project type name

#### Search Projects
- **GET** `/api/v1/projects/search`
  - **Description**: Search projects with filters
  - **Parameters**: 
    - `q` (query, optional): Search query
    - `project_type` (query, optional): Filter by project type
    - `year` (query, optional): Filter by year
    - `limit` (query, optional): Maximum results to return
  - **Response**: Filtered list of projects
  - **Model**: `ProjectsListResponse`

#### Get Project by ID
- **GET** `/api/v1/projects/{project_id}`
  - **Description**: Get detailed information for a specific project
  - **Parameters**: 
    - `project_id` (path): Project identifier
  - **Response**: Complete project data
  - **Model**: `ProjectData`

#### Get All Projects
- **GET** `/api/v1/projects`
  - **Description**: Get all projects with optional filtering
  - **Parameters**: 
    - `limit` (query, optional): Maximum results to return
    - `project_type` (query, optional): Filter by project type
  - **Response**: List of all projects
  - **Model**: `ProjectsListResponse`

#### Get Projects by Year
- **GET** `/api/v1/projects/by-year/{year}`
  - **Description**: Get all projects from a specific year
  - **Parameters**: 
    - `year` (path): Year to filter projects by
  - **Response**: List of projects from the specified year
  - **Model**: `ProjectsListResponse`

### Project Metadata

#### Get Project Types List
- **GET** `/api/v1/projects/types/list`
  - **Description**: Get list of all available project types
  - **Response**: Array of project type strings
  - **Model**: `List[str]`

#### Validate Project Update Request
- **POST** `/api/v1/projects/{project_id}/validate-update-request`
  - **Description**: Validate if project type update is possible
  - **Parameters**: 
    - `project_id` (path): Project identifier

#### Get Project Type
- **GET** `/api/v1/projects/{project_id}/type`
  - **Description**: Get current project type for a specific project
  - **Parameters**: 
    - `project_id` (path): Project identifier

#### Update Project Type
- **PUT** `/api/v1/projects/{project_id}/update-type`
  - **Description**: Update the type of a specific project
  - **Parameters**: 
    - `project_id` (path): Project identifier
  - **Request Body**: Project type update data
  - **Response**: Update operation result
  - **Model**: `ProjectTypeUpdateResponse`

#### Get Available Years
- **GET** `/api/v1/projects/years/available`
  - **Description**: Get list of years with available projects
  - **Response**: List of years with project data

#### Get Project Statistics
- **GET** `/api/v1/projects/stats`
  - **Description**: Get statistical information about projects
  - **Response**: Project statistics and metrics

### Semantic Similarity

#### Semantic Similarity Search
- **POST** `/api/v1/projects/semantic-similarity`
  - **Description**: Find projects similar to provided text using semantic search
  - **Request Body**: Text for similarity matching
  - **Response**: Projects ranked by similarity score
  - **Model**: `SemanticSimilarityResponse`

### Content Archives

#### Get Project Content Archives
- **GET** `/api/v1/projects/{project_id}/content-archives`
  - **Description**: Get archived content for a specific project
  - **Parameters**: 
    - `project_id` (path): Project identifier
  - **Response**: Project archive content
  - **Model**: `ContentArchivesResponse`

### System & Debug

#### System Health
- **GET** `/api/v1/system/health`
  - **Description**: Check system health status
  - **Response**: System health information
  - **Model**: `BaseResponse`

#### Debug Endpoints
- **GET** `/api/v1/debug/test-project-type-filter`
  - **Description**: Debug endpoint for testing project type filtering

- **GET** `/api/v1/debug/project-years`
  - **Description**: Debug endpoint for testing project year extraction

#### API Documentation
- **GET** `/api/v1/endpoints/documentation`
  - **Description**: Get comprehensive API endpoint documentation
  - **Response**: Detailed endpoint information and usage

---

## Timecards

All timecard endpoints are under `/api/v1/timecards` prefix.

#### Get Timecards by Project
- **GET** `/api/v1/timecards/project/{project_id}`
  - **Description**: Get all timecards for a specific project
  - **Parameters**: 
    - `project_id` (path): Project identifier
  - **Response**: List of timecards for the project
  - **Model**: `TimecardListResponse`

#### Get Project Resources Summary
- **GET** `/api/v1/timecards/project/{project_id}/resources-summary`
  - **Description**: Get aggregated resource summary for a project
  - **Parameters**: 
    - `project_id` (path): Project identifier
  - **Response**: Resource utilization summary with hours, count, and date ranges
  - **Model**: `ResourceSummaryResponse`

---

## Resumes

All resume endpoints are under `/api/v1/resumes` prefix.

#### Get Resume by Timecard Contact ID
- **GET** `/api/v1/resumes/contactid/{timecard_contactid}`
  - **Description**: Get resume using contact ID from timecards
  - **Parameters**: 
    - `timecard_contactid` (path): Contact ID from timecard records
  - **Response**: Resume information
  - **Model**: `ResumeResponse`

#### Get Resume by Contact ID
- **GET** `/api/v1/resumes/contact/{contact_id}`
  - **Description**: Get resume using Contact ID from Contacts table
  - **Parameters**: 
    - `contact_id` (path): Contact ID (integer)
  - **Response**: Resume information
  - **Model**: `ResumeResponse`

---

## Response Models

### Common Response Structure
Most endpoints return responses following this pattern:
```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "errors": ["string"]
}
```

### Error Handling
- **400**: Bad Request - Invalid input parameters
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server-side error
- **503**: Service Unavailable - Health check failure

### File Upload Support
Supported file formats for RFP and document uploads:
- PDF (`.pdf`)
- Word Documents (`.docx`, `.doc`)
- Text Files (`.txt`)

### Authentication
Currently, the API does not require authentication. User identification is handled through the `user_id` parameter in requests.

---

## Agent Types

The chat system supports multiple specialized AI agents:
- **SOQ_AGENT**: Statement of Qualifications generation
- **LOI_AGENT**: Letter of Intent creation
- **SOCIAL_POSTS_AGENT**: Social media content generation  
- **PROJECT_APPROACH_AGENT**: Project approach documentation
- **PROJECT_PROFILE_AGENT**: Project profile analysis
- **GENERAL_AGENT**: General-purpose assistant

---

## Usage Examples

### Creating a Chat Session
```bash
curl -X POST "http://localhost:8000/api/v1/sessions" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123", "title": "My Chat Session"}'
```

### Uploading an RFP for Analysis
```bash
curl -X POST "http://localhost:8000/api/v1/rfp/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "session_id=session123" \
  -F "user_id=user123" \
  -F "file=@rfp_document.pdf"
```

### Searching Projects
```bash
curl -X GET "http://localhost:8000/api/v1/projects/search?q=infrastructure&project_type=Transportation&year=2023"
```

---

## Notes

- All file uploads should be in multipart/form-data format
- Base64 encoded content is supported for programmatic file uploads through chat
- Session management is currently in-memory (consider database storage for production)
- CORS is configured for local development and Azure static apps
- The API supports real-time file processing and AI-powered content generation

For additional information or support, please refer to the individual endpoint implementations in the codebase.