# Project Profiles By Type Endpoint Documentation

## Endpoint

**GET** `/api/v1/project-profiles/by-type/{project_type}`

## Description

Retrieves project profiles from the `Project_Profiles` table filtered by exact project type match. This endpoint searches only the Project_Profiles table, which contains projects that have associated content archives and additional metadata. Can optionally perform semantic similarity analysis against an RFP description.

## Base URL

```
http://localhost:8000/api/v1
```

## Request Parameters

### Path Parameters

- **project_type** (string, required): The exact project type to filter by. Must be URL encoded if contains special characters (e.g., "/" should be "%2F")

### Query Parameters

- **limit** (integer, optional): Maximum number of project profiles to return (1-10000). If not specified, returns all matching profiles
- **offset** (integer, optional): Number of project profiles to skip for pagination (default: 0)
- **search** (string, optional): Search term to filter by name, location, facility owner, or description
- **rfp_description** (string, optional): RFP description for semantic similarity analysis (required if enable_similarity=true)
- **enable_similarity** (boolean, optional): Enable semantic similarity analysis (default: false)
- **similarity_threshold** (float, optional): Minimum similarity threshold (0.0 to 1.0, default: 0.1)
- **top_similar_count** (integer, optional): Number of top similar projects to return in detailed analysis (1-100, default: 25)

## Request Examples

```bash
# Basic request
curl -X GET "http://localhost:8000/api/v1/project-profiles/by-type/Hospital%2FHealthcare"

# With pagination
curl -X GET "http://localhost:8000/api/v1/project-profiles/by-type/Hospital%2FHealthcare?limit=20&offset=10"

# With search
curl -X GET "http://localhost:8000/api/v1/project-profiles/by-type/Other?search=medical&limit=50"

# With semantic similarity
curl -X GET "http://localhost:8000/api/v1/project-profiles/by-type/Hospital%2FHealthcare?enable_similarity=true&rfp_description=New medical center project with emergency services&top_similar_count=10"

# Complete example with all parameters
curl -X GET "http://localhost:8000/api/v1/project-profiles/by-type/Hospital%2FHealthcare?limit=50&search=emergency&enable_similarity=true&rfp_description=Emergency medical facility with trauma center&similarity_threshold=0.2&top_similar_count=15"
```

## Response

### Success Response (Basic)

```json
{
  "success": true,
  "message": "Project profiles retrieved successfully. Project type: Hospital/Healthcare",
  "project_type": "Hospital/Healthcare",
  "total_profiles": 25,
  "project_profiles": [
    {
      "profile_id": 123,
      "project_id": "P2024-001",
      "content_archive_id": 456,
      "project_name": "Regional Medical Center Expansion",
      "project_type": "Hospital/Healthcare",
      "facility_owner": "Regional Health System",
      "location": "Dallas, TX",
      "location_state": "TX",
      "our_solutions_description": "Comprehensive healthcare facility design and construction management",
      "project_dates": "2023-2025",
      "start_date": "2023-01-15",
      "end_date": "2025-06-30",
      "key_staff_project_team": "John Smith (PM), Jane Doe (Lead Architect)",
      "client_contact": "Mike Johnson, Facilities Director",
      "contract_value": 45000000.0,
      "construction_cost": 42000000.0,
      "project_size": "250,000 sq ft",
      "delivery_method": "Design-Build",
      "awards": "Healthcare Design Excellence Award 2024",
      "project_lessons": "Coordination with ongoing hospital operations was critical",
      "similarity_score": null,
      "similarity_percentage": null,
      "content_archives": [
        {
          "content_archive_id": 456,
          "name": "Project Overview",
          "content": "This medical center expansion project involves...",
          "project_id": "P2024-001",
          "location": "Dallas, TX",
          "location_state": "TX",
          "owner": "Regional Health System",
          "facility_owner": "Regional Health System",
          "project_lessons": "Critical to maintain sterile environments during construction",
          "client": "Regional Health System",
          "about": "Comprehensive healthcare facility expansion",
          "started_date": null,
          "construction_cost": "42000000",
          "created_date": "2023-01-15T10:00:00",
          "modified_date": "2024-01-15T14:30:00"
        }
      ],
      "source_table": "project_profiles"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 25
  },
  "processing_time_seconds": 1.23,
  "timestamp": "2025-11-03T10:30:00Z"
}
```

### Success Response (With Semantic Similarity)

```json
{
  "success": true,
  "message": "Project profiles retrieved with semantic similarity analysis. Returning 25 profiles. Top similarity: 89.3%",
  "project_type": "Hospital/Healthcare",
  "total_profiles": 25,
  "project_profiles": [
    {
      "profile_id": 123,
      "project_id": "P2024-001",
      "content_archive_id": 456,
      "project_name": "Regional Medical Center Expansion",
      "project_type": "Hospital/Healthcare",
      "facility_owner": "Regional Health System",
      "location": "Dallas, TX",
      "location_state": "TX",
      "our_solutions_description": "Comprehensive healthcare facility design and construction management with emergency services",
      "project_dates": "2023-2025",
      "start_date": "2023-01-15",
      "end_date": "2025-06-30",
      "key_staff_project_team": "John Smith (PM), Jane Doe (Lead Architect)",
      "client_contact": "Mike Johnson, Facilities Director",
      "contract_value": 45000000.0,
      "construction_cost": 42000000.0,
      "project_size": "250,000 sq ft",
      "delivery_method": "Design-Build",
      "awards": "Healthcare Design Excellence Award 2024",
      "project_lessons": "Coordination with ongoing hospital operations was critical",
      "similarity_score": 0.893,
      "similarity_percentage": "89.3%",
      "content_archives": [
        {
          "content_archive_id": 456,
          "name": "Emergency Services Project Overview",
          "content": "This medical center expansion project involves emergency department renovation...",
          "project_id": "P2024-001",
          "location": "Dallas, TX",
          "location_state": "TX",
          "owner": "Regional Health System",
          "facility_owner": "Regional Health System",
          "project_lessons": "Critical to maintain sterile environments during construction",
          "client": "Regional Health System",
          "about": "Comprehensive healthcare facility expansion with emergency services",
          "started_date": null,
          "construction_cost": "42000000",
          "created_date": "2023-01-15T10:00:00",
          "modified_date": "2024-01-15T14:30:00"
        }
      ],
      "source_table": "project_profiles"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 25
  },
  "processing_time_seconds": 4.67,
  "semantic_similarity": {
    "success": true,
    "rfp_description": "Emergency medical facility with trauma center",
    "total_profiles_analyzed": 23,
    "profiles_with_similarity": [
      {
        "profile_id": 123,
        "project_name": "Regional Medical Center Expansion",
        "similarity_score": 0.893,
        "similarity_percentage": "89.3%",
        "our_solutions_description": "Comprehensive healthcare facility design and construction management with emergency services"
      }
    ],
    "top_similarity_score": 0.893,
    "average_similarity_score": 0.654,
    "processing_time_seconds": 3.21
  },
  "timestamp": "2025-11-03T10:30:00Z"
}
```

### Error Response

```json
{
  "detail": "Internal server error: Database connection failed"
}
```

## Data Models

### ProjectProfileData

```python
class ProjectProfileData(BaseModel):
    profile_id: int
    project_id: Optional[str] = None
    content_archive_id: Optional[int] = None
    project_name: Optional[str] = None
    project_type: Optional[str] = None
    facility_owner: Optional[str] = None
    location: Optional[str] = None
    location_state: Optional[str] = None
    our_solutions_description: Optional[str] = None
    project_dates: Optional[str] = None
    start_date: Optional[str] = None  # ISO format
    end_date: Optional[str] = None    # ISO format
    key_staff_project_team: Optional[str] = None
    client_contact: Optional[str] = None
    contract_value: Optional[float] = None
    construction_cost: Optional[float] = None
    project_size: Optional[str] = None
    delivery_method: Optional[str] = None
    awards: Optional[str] = None
    project_lessons: Optional[str] = None
    similarity_score: Optional[float] = None
    similarity_percentage: Optional[str] = None
    content_archives: List[ContentArchive] = []
    source_table: str = "project_profiles"
```

### ContentArchive

```python
class ContentArchive(BaseModel):
    content_archive_id: int
    name: Optional[str] = None
    content: Optional[str] = None
    project_id: Optional[str] = None
    location: Optional[str] = None
    location_state: Optional[str] = None
    owner: Optional[str] = None
    facility_owner: Optional[str] = None
    project_lessons: Optional[str] = None
    client: Optional[str] = None
    about: Optional[str] = None
    started_date: Optional[str] = None
    construction_cost: Optional[str] = None
    created_date: Optional[str] = None      # ISO format
    modified_date: Optional[str] = None     # ISO format
```

### SemanticSimilarityResponse

```python
class SemanticSimilarityResponse(BaseModel):
    success: bool = True
    rfp_description: str
    total_profiles_analyzed: int
    profiles_with_similarity: List[ProjectProfileData]  # Top N profiles
    top_similarity_score: float
    average_similarity_score: float
    processing_time_seconds: float
    message: Optional[str] = None
```

## Backend Services

### ProjectsService.get_project_profiles_by_type()

**Method Signature:**
```python
async def get_project_profiles_by_type(
    self, 
    project_type: str, 
    limit: int = 100000, 
    offset: int = 0,
    search_term: Optional[str] = None
) -> List[ProjectProfileData]
```

**Database Query:**
```sql
SELECT ProfileID, ProjectID, ContentArchiveID, ProjectName, ProjectType, 
       FacilityOwner, Location, LocationState, OurSolutionsDescription, 
       ProjectDates, StartDate, EndDate, KeyStaffProjectTeam, ClientContact, 
       ContractValue, ConstructionCost, ProjectSize, DeliveryMethod, Awards, 
       ProjectLessons
FROM Project_Profiles 
WHERE ProjectType = ?
[AND search conditions if search_term provided]
ORDER BY ProfileID DESC
[OFFSET ? ROWS FETCH NEXT ? ROWS ONLY if pagination]
```

**Search Fields:** 
- ProjectName
- Location  
- FacilityOwner
- OurSolutionsDescription

### ProjectsService.get_content_archives_for_projects()

**Method Signature:**
```python
async def get_content_archives_for_projects(
    self, 
    project_ids: List[str]
) -> Dict[str, List[ContentArchive]]
```

**Database Query:**
```sql
SELECT ContentArchiveID, name, content, projectId, location, location_state,
       owner, facilityowner, projectlessons, client, about,
       constructioncost, CreatedDate, ModifiedDate
FROM Content_Archives 
WHERE projectId IN (?, ?, ...)
ORDER BY projectId, CreatedDate DESC
```

### SemanticSimilarityService.calculate_project_profile_similarities()

**Method Signature:**
```python
async def calculate_project_profile_similarities(
    self, 
    rfp_description: str, 
    project_profiles: List[ProjectProfileData],
    include_content_archives: bool = True
) -> List[Tuple[ProjectProfileData, float]]
```

**Similarity Algorithm for Project Profiles:**

Since Project_Profiles table doesn't have a `description` field like the Projects table, the similarity calculation uses alternative content sources:

1. **Primary Content Sources:**
   - `our_solutions_description` (main project description)
   - `project_name` (for context)
   - `project_lessons` (lessons learned)
   - `awards` (project achievements)

2. **Content Archives Integration:**
   - Archive `name` fields
   - Archive `content` (HTML cleaned to plain text)
   - Archive `about` descriptions
   - Archive `project_lessons`

3. **Content Filtering:**
   - Profiles must have valid content (>10 characters in main fields or >5 characters in names)
   - Profiles with only null/empty content are filtered out
   - HTML content is extracted to plain text

4. **Embedding Process:**
   - Combined content is limited to 8000 characters to avoid token limits
   - Uses Azure OpenAI text-embedding-ada-002 model
   - Calculates cosine similarity between RFP and profile embeddings

5. **Scoring:**
   - Returns similarity scores between 0.0 and 1.0
   - Results sorted by similarity score (highest first)
   - Includes formatted percentage strings for display

**Content Combination Example:**
```
"Project: Regional Medical Center Expansion Comprehensive healthcare facility design and construction management Awards: Healthcare Design Excellence Award 2024 Coordination with ongoing hospital operations was critical Project Overview This medical center expansion project involves emergency department renovation... Comprehensive healthcare facility expansion with emergency services"
```

## Database Schema

### Project_Profiles Table

| Column | Type | Description |
|--------|------|-------------|
| ProfileID | int | Primary key |
| ProjectID | varchar | Foreign key to Projects table |
| ContentArchiveID | int | Foreign key to Content_Archives table |
| ProjectName | varchar | Name of the project |
| ProjectType | varchar | Type/category of project |
| FacilityOwner | varchar | Owner of the facility |
| Location | varchar | Project location |
| LocationState | varchar | Project state |
| OurSolutionsDescription | text | Description of solutions provided |
| ProjectDates | varchar | Project timeline |
| StartDate | date | Project start date |
| EndDate | date | Project end date |
| KeyStaffProjectTeam | text | Key team members |
| ClientContact | varchar | Client contact information |
| ContractValue | decimal | Contract value |
| ConstructionCost | decimal | Construction cost |
| ProjectSize | varchar | Size of the project |
| DeliveryMethod | varchar | Project delivery method |
| Awards | text | Awards received |
| ProjectLessons | text | Lessons learned |

### Content_Archives Table

| Column | Type | Description |
|--------|------|-------------|
| ContentArchiveID | int | Primary key |
| name | varchar | Archive entry name |
| content | text | Archive content |
| projectId | varchar | Associated project ID |
| location | varchar | Project location |
| location_state | varchar | Project state |
| owner | varchar | Project owner |
| facilityowner | varchar | Facility owner |
| projectlessons | text | Project lessons |
| client | varchar | Client information |
| about | text | About the project |
| constructioncost | decimal | Construction cost |
| CreatedDate | datetime | Creation timestamp |
| ModifiedDate | datetime | Last modification timestamp |

## Error Handling

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 500 | Internal Server Error - Database connection issues or query failures |

## URL Encoding for Project Types

Project types containing special characters must be URL encoded:

| Original | URL Encoded |
|----------|-------------|
| `Hospital/Healthcare` | `Hospital%2FHealthcare` |
| `Airport/Transportation` | `Airport%2FTransportation` |
| `Sport/Recreation/Aquatic` | `Sport%2FRecreation%2FAquatic` |
| `Waterfront/Pier/Port` | `Waterfront%2FPier%2FPort` |

## Performance Notes

- Default limit of 100,000 effectively returns all records if no limit specified
- Content archives are fetched separately and joined in memory
- Database queries use exact string matching on ProjectType field
- Search functionality uses LIKE queries with wildcards
- **Semantic similarity adds 2-5 seconds processing time** depending on the number of profiles and content size
- **Similarity analysis requires valid content** - profiles with insufficient text content are filtered out
- **Content is truncated to 8000 characters** per profile to avoid embedding token limits
- **Batch embedding processing** is used for better performance when analyzing multiple profiles

## Semantic Similarity Usage Notes

### When to Use Similarity Analysis
- When you have a specific RFP description to compare against
- For finding the most relevant project profiles for proposal writing
- When you need ranked results based on content relevance

### Content Requirements for Similarity
Projects profiles need at least one of the following with sufficient content:
- `our_solutions_description` (>10 characters)
- `project_name` (>5 characters) 
- `project_lessons` (>10 characters)
- `awards` (>10 characters)
- Content archives with valid `name`, `content`, or `about` fields

### Similarity Score Interpretation
- **0.8-1.0**: Very high similarity (excellent match)
- **0.6-0.8**: High similarity (good match)
- **0.4-0.6**: Moderate similarity (potential match)
- **0.2-0.4**: Low similarity (weak match)
- **0.0-0.2**: Very low similarity (poor match)

### Best Practices
- Use descriptive RFP descriptions for better similarity results
- Set appropriate `similarity_threshold` to filter out poor matches
- Use `top_similar_count` to limit detailed analysis results
- Consider content archives when available for richer similarity analysis