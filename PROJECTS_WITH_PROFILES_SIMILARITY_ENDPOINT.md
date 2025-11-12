# Projects with Profiles - Semantic Similarity Endpoint Documentation

## Overview
This endpoint combines the functionality of retrieving projects with comprehensive profile data and performing semantic similarity analysis using Azure OpenAI embeddings. It's designed for finding historically relevant projects with rich metadata when responding to RFPs.

**Endpoint**: `POST /api/v1/projects/with-profiles/semantic-similarity`

## Key Features

### ✅ **Comprehensive Data Integration**
- Retrieves projects from both `Projects` and `Project_Profiles` tables using INNER JOIN
- Returns complete project data plus rich profile information
- Includes facility details, financial data, team information, and lessons learned

### ✅ **Advanced Semantic Analysis**
- Uses Azure OpenAI embeddings for intelligent similarity matching
- Compares RFP descriptions against project descriptions AND content archives
- Provides similarity scores and percentages for easy interpretation

### ✅ **Flexible Filtering & Pagination**
- Filter by project type (handles special characters like "Hospital/Healthcare")
- Configurable similarity thresholds to control result quality
- Pagination support for large datasets
- Optional search term for additional filtering

### ✅ **Performance Optimized**
- Batch embedding processing for efficiency
- Configurable result limits to manage processing time
- Detailed performance metrics in response

## Request Format

```http
POST /api/v1/projects/with-profiles/semantic-similarity
Content-Type: application/x-www-form-urlencoded

rfp_description="New children's hospital with emergency department and NICU facilities"
&project_type="Hospital/Healthcare"
&limit=100
&similarity_threshold=0.3
&top_similar_count=25
&include_content_archives=true
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `rfp_description` | string | ✅ Yes | - | The RFP project description to compare against existing projects |
| `project_type` | string | ✅ Yes | - | Filter projects by specific type (e.g., "Hospital/Healthcare") |
| `limit` | integer | ❌ No | 100 | Maximum number of projects to analyze (1-1000) |
| `offset` | integer | ❌ No | 0 | Number of projects to skip for pagination |
| `search` | string | ❌ No | null | Additional search term to pre-filter projects |
| `similarity_threshold` | float | ❌ No | 0.1 | Minimum similarity threshold (0.0-1.0) |
| `top_similar_count` | integer | ❌ No | 50 | Number of top similar projects to return (1-500) |
| `include_content_archives` | boolean | ❌ No | true | Include content archives in similarity calculation |

## Response Model

### ProjectsWithProfilesSemanticSimilarityResponse

```json
{
  "success": true,
  "message": "Found 15 similar projects with profiles above 0.3 threshold",
  "project_type": "Hospital/Healthcare",
  "rfp_description": "New children's hospital with emergency department",
  "total_projects": 83,
  "total_projects_analyzed": 45,
  "projects_with_similarity": [
    {
      "project_id": "aBA1R000000CmvtWAC",
      "project_name": "Children's Medical Center Expansion",
      "project_number": "2019-8847-0001",
      "project_manager": "Smith, John",
      "project_type": "Hospital/Healthcare",
      "facility_owner": "Regional Medical Center",
      "location": "Los Angeles, CA",
      "our_solutions_description": "Design and construction of a new 200-bed children's hospital...",
      "key_staff_project_team": "Dr. Sarah Johnson, Chief Medical Officer",
      "client_contact": "sarah.johnson@regionalmed.org",
      "contract_value": 150000000.00,
      "construction_cost": 125000000.00,
      "project_size": "200 beds, 350,000 sq ft",
      "delivery_method": "Design-Build",
      "awards": "AIA Healthcare Design Award 2020",
      "project_lessons": "Early MEP coordination critical for complex medical systems",
      "similarity_score": 0.87,
      "similarity_percentage": "87.0%",
      "content_archives": [
        {
          "content_archive_id": 425,
          "name": "NICU Design Standards",
          "content": "Specialized requirements for neonatal intensive care...",
          "about": "Design guidelines for NICU facilities"
        }
      ]
    }
  ],
  "top_similarity_score": 0.87,
  "average_similarity_score": 0.54,
  "similarity_threshold": 0.3,
  "processing_time_seconds": 4.2,
  "pagination": null,
  "timestamp": "2025-11-12T14:30:00Z"
}
```

## Project Data Fields

### Core Project Information
- `project_id`: Unique project identifier
- `project_name`: Human-readable project name
- `project_number`: Project number/code
- `project_manager`: Assigned project manager
- `project_type`: Project category/type
- `status`: Current project status
- `created_date`, `modified_date`: Timestamp information

### Rich Profile Data
- `facility_owner`: Organization that owns the facility
- `location`, `location_state`: Project location details
- `our_solutions_description`: Detailed project description and solutions
- `key_staff_project_team`: Key team members involved
- `client_contact`: Primary client contact information
- `contract_value`, `construction_cost`: Financial information
- `project_size`: Physical size/scope metrics
- `delivery_method`: Project delivery approach
- `awards`: Recognition and awards received
- `project_lessons`: Lessons learned documentation

### Similarity Analysis
- `similarity_score`: Numerical similarity score (0.0-1.0)
- `similarity_percentage`: Formatted percentage for display
- `content_archives`: Related documents and content

## Usage Examples

### Basic Usage
```bash
curl -X POST "http://localhost:8000/api/v1/projects/with-profiles/semantic-similarity" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "rfp_description=Hospital emergency department renovation&project_type=Hospital/Healthcare"
```

### Advanced Filtering
```bash
curl -X POST "http://localhost:8000/api/v1/projects/with-profiles/semantic-similarity" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "rfp_description=Medical center with surgical suites&project_type=Hospital/Healthcare&similarity_threshold=0.5&limit=50&search=surgery"
```

### High-Quality Results
```bash
curl -X POST "http://localhost:8000/api/v1/projects/with-profiles/semantic-similarity" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "rfp_description=University research facility&project_type=Educational/Institutional&similarity_threshold=0.7&top_similar_count=10"
```

## Performance Considerations

### Processing Time
- **Typical**: 2-5 seconds for 100 projects
- **Factors**: Number of projects, content archive size, similarity threshold
- **Optimization**: Use appropriate limits and thresholds

### Similarity Thresholds Guide
- **0.8+**: Very similar projects (highly relevant)
- **0.6-0.8**: Moderately similar projects (good matches)
- **0.3-0.6**: Somewhat related projects (potential relevance)
- **<0.3**: Low similarity (likely not relevant)

### Best Practices
1. **Start with moderate thresholds** (0.3-0.5) to see result quality
2. **Use project type filtering** to narrow scope and improve performance
3. **Limit analysis to 100-500 projects** per request for optimal performance
4. **Include content archives** for more comprehensive similarity analysis
5. **Use pagination** for large result sets

## Error Handling

### Common Errors
- **400 Bad Request**: Empty `rfp_description` or `project_type`
- **404 Not Found**: No projects found for the specified type
- **500 Internal Server Error**: Database or similarity service issues

### Error Response Format
```json
{
  "detail": "rfp_description cannot be empty",
  "status_code": 400
}
```

## Integration with Other Endpoints

### Related Endpoints
- **GET** `/api/v1/projects/with-profiles/by-type` - Get projects with profiles without similarity
- **POST** `/api/v1/projects/semantic-similarity` - Basic project similarity without profiles
- **GET** `/api/v1/project-profiles/by-type/{type}` - Project profiles with optional similarity

### Workflow Integration
1. Use this endpoint to find similar projects with rich data
2. Extract relevant project IDs for deeper analysis
3. Use `/api/v1/projects/{project_id}/content-archives` for additional content
4. Combine results for comprehensive RFP responses

## Business Value

### For RFP Teams
- **Faster Research**: Quickly find relevant historical projects
- **Rich Context**: Access to project details, lessons learned, and team information
- **Quantified Relevance**: Similarity scores help prioritize which projects to study
- **Comprehensive Data**: All project and profile information in one response

### For Business Development
- **Competitive Intelligence**: Understand what projects you've done in specific markets
- **Experience Documentation**: Easily find and reference past work for proposals
- **Team Identification**: Find key personnel who worked on similar projects
- **Financial Insights**: Access to contract values and construction costs for benchmarking

### For Project Management
- **Lessons Learned**: Discover insights from similar past projects
- **Risk Identification**: Learn from challenges encountered in comparable work
- **Best Practices**: Identify successful approaches from high-performing projects
- **Resource Planning**: Understand typical team compositions and project requirements

---

**Note**: This endpoint requires Azure OpenAI embeddings service to be properly configured. Similarity analysis adds 2-5 seconds to response time depending on the number of projects analyzed.