## Frontend Integration: RFP Analysis with Semantic Similarity

### API Endpoint
**POST** `/api/v1/rfp-projects/rfp/analyze-with-similarity`

### Request Parameters (Form Data)
```
session_id: string (required)
user_id: string (required) 
file: File (required) - PDF, DOC, or DOCX
description: string (optional)
project_limit: number (default: 50)
enable_similarity: boolean (default: true)
similarity_threshold: number (default: 0.1, range: 0.0-1.0)
top_similar_count: number (default: 10, range: 1-100)
```

### Response Structure
```json
{
  "rfp_analysis": {
    "success": true,
    "message": "RFP analysis completed successfully",
    "rfp_filename": "courthouse-rfp.pdf",
    "detected_project_type": "Courthouse",
    "confidence_score": 0.95,
    "brief_description": "New courthouse facility with courtrooms and offices",
    "reasoning": "Document contains courthouse-specific terms...",
    "keywords_found": ["courthouse", "judicial", "courtroom"],
    "alternative_types": [],
    "processing_time_seconds": 2.5,
    "timestamp": "2025-10-28T..."
  },
  "matching_projects": {
    "success": true,
    "message": "Projects retrieved with semantic similarity analysis. Top similarity: 96.7%",
    "project_type": "Courthouse",
    "total_projects": 12,
    "projects": [
      {
        "project_id": "PROJ001",
        "project_name": "County Courthouse Renovation",
        "description": "Renovation of existing courthouse facilities...",
        "similarity_score": 0.967,
        "similarity_percentage": "96.7%",
        "content_archives": [
          {
            "id": "1",
            "project_id": "PROJ001", 
            "content": "<p>Detailed project information...</p>",
            "name": "Project Overview",
            "content_type": "text/html"
          }
        ]
      }
    ],
    "timestamp": "2025-10-28T..."
  },
  "semantic_similarity": {
    "success": true,
    "message": "Semantic similarity analysis completed successfully",
    "rfp_description": "New courthouse facility with courtrooms and offices",
    "total_projects_analyzed": 12,
    "projects_with_similarity": [...], // Same as matching_projects.projects
    "top_similarity_score": 0.967,
    "average_similarity_score": 0.745,
    "processing_time_seconds": 1.2,
    "timestamp": "2025-10-28T..."
  }
}
```

### Key Features
- **Semantic Similarity**: Projects include `similarity_score` (0.0-1.0) and `similarity_percentage` (formatted)
- **Content Archives**: Each project includes associated content archive entries with HTML content
- **Filtering**: Projects with null/empty descriptions are automatically filtered out
- **Statistics**: Response includes top similarity score and average across all analyzed projects