# Project Profiles API - URL Encoding Issue Fix

## Problem Description

The frontend was experiencing 404 errors when trying to fetch project profiles for certain project types, specifically those containing forward slashes like `Hospital/Healthcare`.

### Symptoms
- ✅ `GET /api/v1/project-profiles/by-type/Courthouse` - Works fine
- ❌ `GET /api/v1/project-profiles/by-type/Hospital/Healthcare` - Returns 404 Not Found
- Database contains project profiles with `ProjectType = "Hospital/Healthcare"`
- Backend logs show successful data retrieval for some types but 404 for others

### Root Cause Analysis

The issue was with **URL path parameter encoding** when project types contain forward slashes:

1. **Database Reality**: Project types are stored as `Hospital/Healthcare`, `Airport/Transportation`, etc.
2. **Frontend Request**: `/api/v1/project-profiles/by-type/Hospital/Healthcare`
3. **FastAPI Interpretation**: 
   - Route pattern: `/project-profiles/by-type/{project_type}`
   - FastAPI sees: `project_type = "Hospital"` 
   - Treats `/Healthcare` as an additional unmatched path segment
   - Result: 404 Not Found

4. **URL Encoding Attempts**: Even with proper URL encoding (`Hospital%2FHealthcare`), FastAPI/Starlette has issues with route matching when path parameters contain encoded forward slashes.

## Solution Implemented

### Backend Changes

Added a new **query parameter endpoint** that bypasses the URL path encoding issues:

```python
@router.get("/project-profiles/by-type")
async def get_project_profiles_by_type_query_param(
    project_type: str = Query(..., description="The exact project type to filter by"),
    limit: Optional[int] = Query(None, ge=1, le=10000),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    rfp_description: Optional[str] = Query(None),
    enable_similarity: bool = Query(False),
    similarity_threshold: float = Query(0.1, ge=0.0, le=1.0),
    top_similar_count: int = Query(25, ge=1, le=100)
):
```

### API Endpoints Available

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/v1/project-profiles/by-type/{project_type}` | ⚠️ Limited | Works only for types without `/` |
| `GET /api/v1/project-profiles/by-type?project_type={type}` | ✅ Recommended | Works for all project types |

## Frontend Implementation Required

### Current Implementation (Problematic)
```javascript
// This fails for project types with forward slashes
const projectType = "Hospital/Healthcare";
const response = await fetch(
  `/api/v1/project-profiles/by-type/${projectType}?limit=50&enable_similarity=false`
);
```

### Required Fix
```javascript
// Use query parameter instead of path parameter
const projectType = "Hospital/Healthcare";
const response = await fetch(
  `/api/v1/project-profiles/by-type?project_type=${encodeURIComponent(projectType)}&limit=50&enable_similarity=false`
);
```

### Complete Example
```javascript
const fetchProjectProfiles = async (projectType, options = {}) => {
  const {
    limit = 50,
    offset = 0,
    search = null,
    enableSimilarity = false,
    rfpDescription = null,
    similarityThreshold = 0.1,
    topSimilarCount = 25
  } = options;

  // Build query parameters
  const params = new URLSearchParams({
    project_type: projectType,
    limit: limit.toString(),
    offset: offset.toString(),
    enable_similarity: enableSimilarity.toString()
  });

  if (search) params.append('search', search);
  if (enableSimilarity && rfpDescription) params.append('rfp_description', rfpDescription);
  if (enableSimilarity) {
    params.append('similarity_threshold', similarityThreshold.toString());
    params.append('top_similar_count', topSimilarCount.toString());
  }

  const response = await fetch(`/api/v1/project-profiles/by-type?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch project profiles: ${response.status}`);
  }
  
  return response.json();
};

// Usage examples
const courthouseProfiles = await fetchProjectProfiles("Courthouse");
const hospitalProfiles = await fetchProjectProfiles("Hospital/Healthcare", { limit: 100 });
const airportProfiles = await fetchProjectProfiles("Airport/Transportation", { 
  enableSimilarity: true, 
  rfpDescription: "New terminal building project" 
});
```

## Response Format

The response format remains **exactly the same** as the original endpoint:

```json
{
  "success": true,
  "message": "Project profiles retrieved successfully. Project type: Hospital/Healthcare",
  "project_type": "Hospital/Healthcare",
  "total_profiles": 50,
  "project_profiles": [...],
  "pagination": {
    "offset": 0,
    "limit": 50,
    "total_available": 50
  }
}
```

## Project Types That Required This Fix

The following project types contain forward slashes and need the query parameter approach:

- `Hospital/Healthcare`
- `Airport/Transportation`
- `Commercial/Retail`
- `Waterfront/Pier/Port`
- `Laboratory/Clean Room`
- `Library/Learning Resource Center`
- `Parking Lot/Parking Structure`
- `Sport/Recreation/Aquatic`
- `Student Center/Student Union`
- `Campus/Education`

## Testing Verification

```bash
# ✅ This works (query parameter)
curl "http://localhost:8000/api/v1/project-profiles/by-type?project_type=Hospital/Healthcare&limit=50"

# ❌ This fails (path parameter)
curl "http://localhost:8000/api/v1/project-profiles/by-type/Hospital/Healthcare?limit=50"

# ✅ This works (simple types)
curl "http://localhost:8000/api/v1/project-profiles/by-type/Courthouse?limit=50"
```

## Migration Steps

1. **Update API calls** in frontend components to use query parameters
2. **Test all project types** especially those with forward slashes
3. **Update any hardcoded URLs** in configuration or documentation
4. **Consider deprecating** the path parameter endpoint in future versions

## Benefits of This Solution

- ✅ **Universal compatibility**: Works with all project types
- ✅ **No URL encoding complexity**: Query parameters handle special characters automatically
- ✅ **Same functionality**: All features preserved (pagination, search, similarity analysis)
- ✅ **Same response format**: No frontend response handling changes needed
- ✅ **Future-proof**: Robust against new project types with special characters

## Additional Notes

- The original path parameter endpoint (`/by-type/{project_type}`) still works for project types without forward slashes
- Both endpoints are maintained for backward compatibility
- The query parameter approach is more robust and is the recommended solution going forward
- No database changes were required - this was purely a URL routing issue