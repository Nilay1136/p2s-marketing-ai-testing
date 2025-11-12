# Projects with Profiles by Type Endpoint

## Overview
This endpoint retrieves projects that have associated project profile entries, filtered by project type. It performs an INNER JOIN between the `Projects` and `Project_Profiles` tables to ensure only projects with profiles are returned. **The response includes both project data AND project profile data** for comprehensive information.

⚠️ **URL Encoding Issue Fix**: Due to server-level restrictions with forward slashes in URL paths, we provide **two versions** of this endpoint.

🆕 **Semantic Similarity Enhancement**: A new POST endpoint adds intelligent similarity matching to find the most relevant projects for RFP responses.

## Endpoint Variants

### 🎯 **RECOMMENDED: Query Parameter Version**
**URL**: `GET /api/v1/projects/with-profiles/by-type`  
**Method**: GET  
**Best For**: All project types, especially those with special characters  
**URL Encoding**: ❌ Not required  

### 🔍 **NEW: Semantic Similarity Version**
**URL**: `POST /api/v1/projects/with-profiles/semantic-similarity`  
**Method**: POST  
**Best For**: Finding relevant projects for RFP responses with AI-powered matching  
**Features**: ✨ Similarity scores, ranked results, comprehensive analytics  

### ⚠️ **Alternative: Path Parameter Version**
**URL**: `GET /api/v1/projects/with-profiles/by-type/{project_type}`  
**Method**: GET  
**Best For**: Simple project types without special characters  
**URL Encoding**: ⚠️ Required for special characters (may still have issues)  

**Authentication**: None required for all versions  

## Parameters

### Query Parameter Version (RECOMMENDED)

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `project_type` | string | Yes | None | The exact project type to filter by (no URL encoding needed) |
| `limit` | integer | No | 100000 | Maximum number of projects to return (1-10000) |
| `offset` | integer | No | 0 | Number of projects to skip for pagination |
| `search` | string | No | None | Optional search term to filter projects |

### Path Parameter Version (ALTERNATIVE)

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_type` | string | Yes | The exact project type to filter by (URL encoded if contains special characters) |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 100000 | Maximum number of projects to return (1-10000) |
| `offset` | integer | No | 0 | Number of projects to skip for pagination |
| `search` | string | No | None | Optional search term to filter projects |

## Response Model

### Success Response
```json
{
  "success": true,
  "message": "Successfully retrieved X projects with profiles for type 'ProjectType'",
  "project_type": "string",
  "total_projects": 0,
  "projects": [
    {
      // PROJECT DATA
      "project_id": "string",
      "project_name": "string",
      "project_number": "string",
      "project_manager": "string",
      "project_contract_labor": 0.0,
      "status": "string",
      "group_no": "string",
      "primary_segment": "string",
      "legence_market_segment": "string",
      "description": "string",
      "project_type": "string",
      "created_date": "2025-01-01T00:00:00",
      "modified_date": "2025-01-01T00:00:00",
      "project_year": "2025",
      
      // PROJECT PROFILE DATA
      "profile_id": 0,
      "content_archive_id": 0,
      "facility_owner": "string",
      "location": "string", 
      "location_state": "string",
      "our_solutions_description": "string",
      "project_dates": "string",
      "start_date": "2025-01-01",
      "end_date": "2025-01-01", 
      "key_staff_project_team": "string",
      "client_contact": "string",
      "contract_value": 0.0,
      "construction_cost": 0.0,
      "project_size": "string",
      "delivery_method": "string",
      "awards": "string",
      "project_lessons": "string",
      "processed_by": "string",
      "extraction_status": "string",
      "extraction_notes": "string",
      
      // METADATA
      "similarity_score": null,
      "similarity_percentage": null,
      "content_archives": [],
      "source_table": "projects_with_profiles"
    }
  ],
  "pagination": null,
  "timestamp": "2025-11-12T09:52:49.977962"
}
```

### Error Response
```json
{
  "detail": "Internal server error: Error message"
}
```

## Database Query
The endpoint performs the following SQL query:
```sql
SELECT DISTINCT 
    -- Project fields
    p.ProjectID, p.ProjectName, p.ProjectNumber, p.ProjectManager, 
    p.ProjectContractLabor, p.Status, p.GroupNo, p.PrimarySegment, 
    p.LegenceMarketSegment, p.Description, p.ProjectType, 
    p.CreatedDate, p.ModifiedDate,
    
    -- Project Profile fields  
    pp.ProfileID, pp.ContentArchiveID, pp.FacilityOwner, pp.Location,
    pp.LocationState, pp.OurSolutionsDescription, pp.ProjectDates,
    pp.StartDate, pp.EndDate, pp.KeyStaffProjectTeam, pp.ClientContact,
    pp.ContractValue, pp.ConstructionCost, pp.ProjectSize, 
    pp.DeliveryMethod, pp.Awards, pp.ProjectLessons, pp.ProcessedBy,
    pp.ExtractionStatus, pp.ExtractionNotes
FROM Projects p
INNER JOIN Project_Profiles pp ON p.ProjectID = pp.ProjectID
WHERE p.ProjectType = ?
[AND search conditions if search term provided]
ORDER BY p.ProjectName, p.ProjectNumber
OFFSET ? ROWS
FETCH NEXT ? ROWS ONLY
```

## Search Functionality
When the `search` parameter is provided, the endpoint searches across:
- Project Name
- Project Description  
- Project Number
- Project Manager

Search is case-insensitive and uses SQL `LIKE` with wildcards.

## Usage Examples

### 🎯 **RECOMMENDED: Query Parameter Version**

#### Basic Usage
```bash
curl -X GET "http://localhost:8000/api/v1/projects/with-profiles/by-type?project_type=Hospital/Healthcare" \
  -H "accept: application/json"
```

#### With Special Characters (No Encoding Needed!)
```bash
curl -X GET "http://localhost:8000/api/v1/projects/with-profiles/by-type?project_type=Airport/Transportation" \
  -H "accept: application/json"

curl -X GET "http://localhost:8000/api/v1/projects/with-profiles/by-type?project_type=Sport/Recreation/Aquatic" \
  -H "accept: application/json"
```

#### With Pagination
```bash
curl -X GET "http://localhost:8000/api/v1/projects/with-profiles/by-type?project_type=Central Plant&limit=10&offset=20" \
  -H "accept: application/json"
```

#### With Search Filter
```bash
curl -X GET "http://localhost:8000/api/v1/projects/with-profiles/by-type?project_type=Central Plant&search=chiller" \
  -H "accept: application/json"
```

#### Combined Parameters
```bash
curl -X GET "http://localhost:8000/api/v1/projects/with-profiles/by-type?project_type=Hospital/Healthcare&limit=5&search=emergency&offset=0" \
  -H "accept: application/json"
```

### ⚠️ **Alternative: Path Parameter Version (Use with caution)**

#### Basic Usage (Simple Types Only)
```bash
curl -X GET "http://localhost:8000/api/v1/projects/with-profiles/by-type/Other" \
  -H "accept: application/json"
```

#### With URL Encoding (May Still Have Issues)
```bash
# ⚠️ May not work reliably due to server restrictions
curl -X GET "http://localhost:8000/api/v1/projects/with-profiles/by-type/Hospital%2FHealthcare" \
  -H "accept: application/json"
```

## Response Status Codes
- **200 OK**: Successfully retrieved projects
- **500 Internal Server Error**: Database error or other server-side issue

## Project Types
Common project types that can be used:
- `Central Plant`
- `Hospital/Healthcare` (URL encode as `Hospital%2FHealthcare`)
- `Airport/Transportation` (URL encode as `Airport%2FTransportation`) 
- `Office Building`
- `Courthouse`
- `Data Center`
- `Fire Station`
- `Police Station`
- `Other`
- And many more...

## Key Features

### 1. **Inner Join Logic**
- Returns projects that exist in **both** `Projects` and `Project_Profiles` tables
- Eliminates projects that don't have associated profile data

### 2. **Combined Data Response**
- **Project Information**: Basic project details (name, number, manager, status, etc.)
- **Profile Information**: Rich profile data (facility owner, location, team, financials, etc.)
- **Single Response**: All data in one comprehensive response

### 3. **Exact Type Matching**
- Performs exact string matching on the `ProjectType` field
- Case-sensitive matching

### 4. **URL Encoding Support**
- Handles project types with special characters like forward slashes
- Example: "Hospital/Healthcare" should be encoded as "Hospital%2FHealthcare"

### 5. **Comprehensive Search**
- Searches across multiple project fields simultaneously
- Uses partial matching with SQL LIKE operator

### 6. **Optimized Pagination**
- Uses SQL `OFFSET` and `FETCH` for efficient pagination
- Default high limit to return all matching results if no limit specified

### 7. **Rich Profile Data**
- **Project Details**: Contract values, construction costs, project size
- **Location Info**: Facility owner, location, state
- **Team Information**: Key staff, client contacts
- **Project Metadata**: Delivery method, awards, lessons learned
- **Processing Status**: Extraction status and notes

## Implementation Notes

- **Service Method**: `get_projects_with_profiles_by_type()` in `ProjectsService`
- **Router**: Added to `rfp_projects.py` router
- **Response Model**: Returns `ProjectsWithProfilesListResponse` with combined project and profile data
- **Database**: Uses pyodbc with proper connection management
- **Logging**: Comprehensive logging for debugging and monitoring
- **Data Types**: Handles all project profile field types (strings, decimals, dates, integers)

## Performance Considerations

- **Indexing**: Ensure indexes exist on:
  - `Projects.ProjectType` 
  - `Projects.ProjectID`
  - `Project_Profiles.ProjectID`
- **Limit Results**: Use `limit` parameter for large result sets
- **Search Optimization**: Consider full-text search for better performance on large datasets
- **Join Performance**: INNER JOIN on ProjectID is optimized with proper indexing
- **Data Volume**: Response includes more fields, so consider pagination for large datasets

## Related Endpoints

- `GET /api/v1/projects/by-type/{project_type}` - All projects by type (no profile requirement)
- `GET /api/v1/project-profiles/by-type/{project_type}` - Only project profiles by type
- `GET /api/v1/projects/search` - General project search functionality

## Changelog

- **2025-11-12**: Initial endpoint creation
  - Added INNER JOIN between Projects and Project_Profiles tables
  - Implemented project type filtering, search, and pagination
  - Added comprehensive error handling and logging
- **2025-11-12**: URL encoding fix
  - Added query parameter version to handle special characters
  - Fixed 404 errors for project types with forward slashes
  - Updated documentation with both endpoint versions
- **2025-11-12**: Enhanced response with project profile data
  - Updated SQL query to include all Project_Profiles fields
  - Created new `ProjectWithProfileData` and `ProjectsWithProfilesListResponse` models
  - Enhanced response to include comprehensive project profile information
  - Added facility details, financial data, team information, and project metadata

## URL Encoding Issue Resolution

### Problem
The original path parameter endpoint (`/projects/with-profiles/by-type/{project_type}`) was returning 404 errors for project types containing forward slashes like:
- `Hospital/Healthcare`
- `Airport/Transportation`
- `Sport/Recreation/Aquatic`

### Solution
Added a query parameter version that completely avoids URL encoding issues:
- ✅ **Query Parameter**: `/projects/with-profiles/by-type?project_type=Hospital/Healthcare`
- ⚠️ **Path Parameter**: `/projects/with-profiles/by-type/Hospital%2FHealthcare` (may still have issues)

### Test Results
✅ **Query Parameter Endpoint** - All working:
| Project Type | Projects Found | Status |
|-------------|----------------|---------|
| `Hospital/Healthcare` | 3+ | ✅ Success |
| `Airport/Transportation` | 2+ | ✅ Success |
| `Central Plant` | 25+ | ✅ Success |
| `Other` | 5+ | ✅ Success |

### Recommendation
**Always use the query parameter version** (`/projects/with-profiles/by-type`) for reliable results, especially with project types containing special characters.