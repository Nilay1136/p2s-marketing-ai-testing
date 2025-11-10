# Timecards and Resume API Endpoints

This document describes the new API endpoints for fetching timecard data and resume information for project resources.

## Table of Contents
- [Timecards API](#timecards-api)
- [Resume API](#resume-api)
- [Usage Flow](#usage-flow)
- [Error Handling](#error-handling)

## Timecards API

### Get Timecards by Project ID

**Endpoint:** `GET /api/v1/timecards/project/{project_id}`

**Description:** Retrieves all timecards for a specific project by project ID.

**Parameters:**
- `project_id` (path, required): The project ID to fetch timecards for

**Request Example:**
```
GET /api/v1/timecards/project/aBA1R0000008aTGWAY
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Successfully retrieved 59 timecards for project aBA1R0000008aTGWAY",
  "errors": [],
  "timestamp": "2025-11-10T07:25:42.397882",
  "timecards": [
    {
      "id": "aCEUb0000019yqnOAA",
      "enddate": "2025-11-09",
      "projectid": "aBA1R0000008aTGWAY",
      "milestoneid": "aAyUb0000005cuHKAQ",
      "totalhrs": "0.25",
      "discipline": "A - Administrative",
      "resourcerole": "Project Assistant",
      "projectno": "2022-0697-0000-8000",
      "GroupNo": null,
      "StudioLeader": "Peterson, Kevin",
      "contactid": "0031R00002dWhKJQA0",
      "resource": "Westerhold, Sharon"
    }
    // ... more timecard entries
  ],
  "total_count": 59,
  "project_id": "aBA1R0000008aTGWAY"
}
```

### Get Project Resources Summary

**Endpoint:** `GET /api/v1/timecards/project/{project_id}/resources-summary`

**Description:** Retrieves aggregated resource summary for a specific project, showing total hours, timecard count, and date range for each resource.

**Parameters:**
- `project_id` (path, required): The project ID to fetch resource summary for

**Request Example:**
```
GET /api/v1/timecards/project/aBA1R0000008aTGWAY/resources-summary
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Successfully retrieved resource summary for project aBA1R0000008aTGWAY",
  "errors": [],
  "timestamp": "2025-11-10T08:00:00.000000",
  "resources": [
    {
      "contactid": "0031R000024xGsPQAU",
      "resource": "Voso, John",
      "discipline": "E - Electrical",
      "resourcerole": "CAD/BIM Designer Grade 04",
      "studio_leader": "Herrera, Jonathan",
      "total_hours": "92.00",
      "timecard_count": 12,
      "earliest_date": "2023-02-11",
      "latest_date": "2024-10-26"
    },
    {
      "contactid": "0031R00002ClVIaQAN",
      "resource": "Alexander, Greg",
      "discipline": "PM - Project Manager",
      "resourcerole": "Engineer Grade 05",
      "studio_leader": "Alexander, Greg",
      "total_hours": "13.00",
      "timecard_count": 24,
      "earliest_date": "2024-06-22",
      "latest_date": "2025-10-12"
    }
    // ... more resource summaries
  ],
  "total_resources": 9,
  "project_id": "aBA1R0000008aTGWAY"
}
```

## Resume API

### Get Resume by Timecard Contact ID

**Endpoint:** `GET /api/v1/resumes/contactid/{timecard_contactid}`

**Description:** Retrieves resume information using the contactid from timecards. This follows the relationship chain: Timecards.contactid → ActiveContacts.Id → ActiveContacts.Email → Contacts.Email → Contacts.ContactID → Resumes.contact_id

**Parameters:**
- `timecard_contactid` (path, required): The contactid from timecard entries

**Request Example:**
```
GET /api/v1/resumes/contactid/0031R000024xGsPQAU
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Successfully retrieved resume for Voso, John",
  "errors": [],
  "timestamp": "2025-11-10T08:15:00.000000",
  "resume": {
    "resume_id": 1,
    "contact_id": 48,
    "original_filename": "Voso John.docx",
    "file_type": "docx",
    "file_size_kb": 191,
    "last_modified_date": "2025-08-28T02:03:07.428299",
    "processing_status": "completed",
    "llm_processed_date": "2025-11-08T12:33:15.560001",
    "description": "John Voso is an experienced CAD/BIM Designer specializing in electrical systems...",
    "education": "['BS, Electrical Engineering, Cal Poly Pomona', 'Certificate in CAD Design']",
    "certifications": "['AutoCAD Certified Professional', 'Revit Certified Professional']",
    "affiliations": "Institute of Electrical and Electronics Engineers (IEEE)",
    "key_highlights": "['10+ years CAD/BIM experience', 'Expert in electrical design', 'Strong project coordination skills']",
    "refs": null,
    "job_title": "CAD/BIM Designer",
    "awards": "['Employee of the Month - March 2024']",
    "publications": null,
    "years_of_experience": 10,
    "primary_discipline": "Electrical Engineering",
    "full_text": "Complete resume text content here...",
    "llm_extraction_metadata": "{\"extraction_date\": \"2025-11-08T12:33:15.559977\", \"model_used\": \"Azure OpenAI GPT-4\"}",
    "is_latest": true,
    "is_duplicate": false,
    "superseded_by_resume_id": null,
    "created_at": "2025-11-08T07:03:52.680000",
    "updated_at": "2025-11-08T07:03:52.680000"
  },
  "contact_info": {
    "first_name": "John",
    "last_name": "Voso",
    "full_name": "Voso, John",
    "email": "john.voso@p2sinc.com",
    "title": "CAD/BIM Designer"
  }
}
```

### Get Resume by Contact ID

**Endpoint:** `GET /api/v1/resumes/contact/{contact_id}`

**Description:** Retrieves resume information using the ContactID from the Contacts table directly.

**Parameters:**
- `contact_id` (path, required): The ContactID from the Contacts table

**Request Example:**
```
GET /api/v1/resumes/contact/48
```

**Response Structure:**
Same as above resume response structure.

## Usage Flow

### Typical workflow to get timecard data and then resume information:

1. **Get Project Timecards**
   ```
   GET /api/v1/timecards/project/{project_id}
   ```

2. **Get Resource Summary** (optional)
   ```
   GET /api/v1/timecards/project/{project_id}/resources-summary
   ```

3. **Select a Resource** - From either response, pick a resource and note their `contactid`

4. **Get Resume Information**
   ```
   GET /api/v1/resumes/contactid/{contactid}
   ```

### Example Flow:

```bash
# Step 1: Get timecards
GET /api/v1/timecards/project/aBA1R0000008aTGWAY

# Step 2: From response, select a contactid (e.g., "0031R000024xGsPQAU")
GET /api/v1/resumes/contactid/0031R000024xGsPQAU

# Result: Full resume information for that resource
```

## Error Handling

### Common Error Responses:

**404 - Not Found**
```json
{
  "success": false,
  "message": "No resume found for contactid: 0031R000024xGsPQAU",
  "errors": ["Resume not found"],
  "timestamp": "2025-11-10T08:15:00.000000"
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "message": "Error retrieving timecards: Database connection failed",
  "errors": ["Database connection failed"],
  "timestamp": "2025-11-10T08:15:00.000000"
}
```

## Data Relationships

### Database Relationship Chain:
```
Timecards.contactid 
    ↓
ActiveContacts.Id 
    ↓ (via Email)
ActiveContacts.Email = Contacts.Email 
    ↓
Contacts.ContactID 
    ↓
Resumes.contact_id
```

### Key Points:

- **Timecards**: Contains project time entries with `contactid` linking to ActiveContacts
- **ActiveContacts**: Bridge table with `Id` and `Email`
- **Contacts**: Main contact information with `ContactID` and `Email`
- **Resumes**: Resume data linked via `contact_id` to Contacts table
- **Resume Filtering**: Returns latest, non-duplicate resumes (`is_latest = 1` AND `is_duplicate = 0`)

## Response Models

### Timecard Model
- `id`: Timecard ID
- `enddate`: End date of timecard entry
- `projectid`: Project ID
- `milestoneid`: Milestone ID
- `totalhrs`: Total hours worked (decimal)
- `discipline`: Discipline/Department
- `resourcerole`: Resource role
- `projectno`: Project number
- `GroupNo`: Group number (nullable)
- `StudioLeader`: Studio leader name
- `contactid`: Contact ID (links to ActiveContacts)
- `resource`: Resource name

### ResourceSummary Model
- `contactid`: Contact ID
- `resource`: Resource name
- `discipline`: Discipline
- `resourcerole`: Resource role
- `studio_leader`: Studio leader name
- `total_hours`: Sum of all hours worked
- `timecard_count`: Number of timecard entries
- `earliest_date`: Earliest timecard date
- `latest_date`: Latest timecard date

### Resume Model
- `resume_id`: Resume ID
- `contact_id`: Contact ID
- `original_filename`: Original file name
- `file_type`: File type (docx, pdf, etc.)
- `file_size_kb`: File size in KB
- `last_modified_date`: Last modified date
- `processing_status`: Processing status
- `llm_processed_date`: LLM processing date
- `description`: Resume description
- `education`: Education information (JSON string)
- `certifications`: Certifications (JSON string)
- `affiliations`: Professional affiliations
- `key_highlights`: Key highlights (JSON string)
- `refs`: References
- `job_title`: Job title
- `awards`: Awards (JSON string)
- `publications`: Publications
- `years_of_experience`: Years of experience (integer)
- `primary_discipline`: Primary discipline
- `full_text`: Full resume text content
- `llm_extraction_metadata`: LLM extraction metadata (JSON)
- `is_latest`: Boolean indicating if this is the latest version
- `is_duplicate`: Boolean indicating if this is a duplicate
- `superseded_by_resume_id`: ID of newer resume if superseded
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp