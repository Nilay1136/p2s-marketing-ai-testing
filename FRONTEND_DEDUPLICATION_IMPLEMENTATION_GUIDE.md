# Frontend Deduplication Fix - Implementation Guide

## Overview
This guide provides steps to fix the project duplication issue by implementing **profile-priority deduplication** in the frontend, without making any backend changes.

## Problem Summary
- **Current Issue**: Same projects appear in both API calls, causing duplicates in UI
- **Solution**: Deduplicate by `project_id` and prioritize projects with profiles
- **Approach**: Frontend-only changes to existing deduplication logic

---

## Implementation Steps

### **Step 1: Locate the Frontend File**
Find and open the main project profiles component:
```
File: ProjectProfilesModal.js
Location: [Your frontend src directory]
```

### **Step 2: Find Current Deduplication Logic**
Look for the existing deduplication code (approximately around line where projects are combined):

```javascript
// FIND THIS EXISTING CODE:
const uniqueProjects = combinedProjects.filter((project, index, array) => 
  array.findIndex(p => p.project_id === project.project_id) === index
);
```

### **Step 3: Replace with Enhanced Deduplication**
Replace the existing deduplication logic with this enhanced version:

```javascript
// REPLACE WITH THIS ENHANCED LOGIC:
const deduplicateWithProfilePriority = (regularProjects, profileProjects) => {
  const projectMap = new Map();
  
  // First, add all regular projects
  regularProjects.forEach(project => {
    projectMap.set(project.project_id, { 
      ...project, 
      sourceType: 'regular',
      hasProfile: false 
    });
  });
  
  // Then, add profile projects (will overwrite duplicates with profile priority)
  profileProjects.forEach(project => {
    projectMap.set(project.project_id, { 
      ...project, 
      sourceType: 'withProfiles',
      hasProfile: true 
    });
  });
  
  return Array.from(projectMap.values());
};

// Use the new deduplication function
const uniqueProjects = deduplicateWithProfilePriority(
  filteredProjects, 
  filteredProjectsWithProfiles
);
```

### **Step 4: Update the Projects Combination Logic**
Find where projects are combined and update it:

```javascript
// FIND THIS EXISTING CODE:
const combinedProjects = [
  ...filteredProjects.map(project => ({ ...project, sourceType: 'regular' })),
  ...filteredProjectsWithProfiles.map(project => ({ ...project, sourceType: 'withProfiles' }))
];

// REPLACE WITH:
// Use the new deduplication function directly (no need for combinedProjects step)
const uniqueProjects = deduplicateWithProfilePriority(
  filteredProjects, 
  filteredProjectsWithProfiles
);
```

### **Step 5: Add Debugging Logs (Optional but Recommended)**
Add console logging to track the deduplication process:

```javascript
// ADD THIS BEFORE THE DEDUPLICATION:
console.log('🔍 Deduplication Debug Info:', {
  regularProjects_count: filteredProjects.length,
  profileProjects_count: filteredProjectsWithProfiles.length,
  total_before_dedup: filteredProjects.length + filteredProjectsWithProfiles.length,
  regularProjects_sample: filteredProjects.slice(0, 2).map(p => ({ 
    id: p.project_id, 
    name: p.project_name 
  })),
  profileProjects_sample: filteredProjectsWithProfiles.slice(0, 2).map(p => ({ 
    id: p.project_id, 
    name: p.project_name 
  }))
});

// AFTER DEDUPLICATION:
console.log('✅ After Deduplication:', {
  unique_count: uniqueProjects.length,
  with_profiles_count: uniqueProjects.filter(p => p.sourceType === 'withProfiles').length,
  regular_only_count: uniqueProjects.filter(p => p.sourceType === 'regular').length,
  duplicates_removed: (filteredProjects.length + filteredProjectsWithProfiles.length) - uniqueProjects.length
});
```

### **Step 6: Update Profile Filter Logic**
Ensure the "Show only projects with profiles" filter works correctly:

```javascript
// FIND THIS EXISTING CODE:
const finalFilteredProjects = showOnlyWithProfiles 
  ? uniqueProjects.filter(project => project.sourceType === 'withProfiles')
  : uniqueProjects;

// KEEP AS IS - This should work correctly with the new deduplication
```

### **Step 7: Update Profile Button Logic**
Ensure the "View Project Profile" button appears correctly:

```javascript
// FIND THIS EXISTING CODE:
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

// KEEP AS IS - This should work correctly with the new sourceType assignment
```

---

## Complete Code Example

Here's the complete updated section for reference:

```javascript
// Enhanced deduplication function
const deduplicateWithProfilePriority = (regularProjects, profileProjects) => {
  const projectMap = new Map();
  
  // First, add all regular projects
  regularProjects.forEach(project => {
    projectMap.set(project.project_id, { 
      ...project, 
      sourceType: 'regular',
      hasProfile: false 
    });
  });
  
  // Then, add profile projects (will overwrite duplicates)
  profileProjects.forEach(project => {
    projectMap.set(project.project_id, { 
      ...project, 
      sourceType: 'withProfiles',
      hasProfile: true 
    });
  });
  
  return Array.from(projectMap.values());
};

// In your render/processing logic:
// Filter out test projects (keep existing logic)
const filteredProjects = matchingProjects.filter(project => {
  const projectNumber = project.project_number || '';
  return !projectNumber.startsWith('0000');
});

const filteredProjectsWithProfiles = projectsWithProfiles.filter(project => {
  const projectNumber = project.project_number || '';
  return !projectNumber.startsWith('0000');
});

// Debug logging
console.log('🔍 Before deduplication:', {
  regularProjects_count: filteredProjects.length,
  profileProjects_count: filteredProjectsWithProfiles.length,
  total: filteredProjects.length + filteredProjectsWithProfiles.length
});

// NEW: Enhanced deduplication with profile priority
const uniqueProjects = deduplicateWithProfilePriority(
  filteredProjects, 
  filteredProjectsWithProfiles
);

// Debug logging
console.log('✅ After deduplication:', {
  unique_count: uniqueProjects.length,
  with_profiles_count: uniqueProjects.filter(p => p.sourceType === 'withProfiles').length,
  duplicates_removed: (filteredProjects.length + filteredProjectsWithProfiles.length) - uniqueProjects.length
});

// Apply profile filter (keep existing logic)
const finalFilteredProjects = showOnlyWithProfiles 
  ? uniqueProjects.filter(project => project.sourceType === 'withProfiles')
  : uniqueProjects;
```

---

## Testing Steps

### **Test Case 1: Park/Outdoor RFP**
1. Upload a Park/Outdoor RFP
2. Check browser console for debug logs
3. **Expected Results**:
   ```
   🔍 Before deduplication: {regularProjects_count: 43, profileProjects_count: 11, total: 54}
   ✅ After deduplication: {unique_count: 43, with_profiles_count: 11, duplicates_removed: 11}
   ```
4. **UI Should Show**: 43 projects when "Show only projects with profiles" is unchecked, 11 when checked

### **Test Case 2: Campus/Education RFP**
1. Upload a Campus/Education RFP  
2. Check console logs
3. **Expected Results**: Should show deduplicated projects with profiles prioritized
4. **UI Should Show**: Projects with green "Profile" badges for those with profiles

### **Test Case 3: Checkbox Toggle**
1. Upload any RFP
2. Toggle "Show only projects with profiles" checkbox
3. **Expected Behavior**: 
   - Unchecked: Shows all unique projects
   - Checked: Shows only projects with `sourceType: 'withProfiles'`

---

## Troubleshooting

### **Issue: No deduplication happening**
- **Check**: Console logs show `duplicates_removed: 0`
- **Cause**: No projects have matching `project_id` values
- **Solution**: Verify both API calls are returning data with same project IDs

### **Issue: Wrong projects getting priority**
- **Check**: Projects without profiles showing when checkbox is checked
- **Cause**: `sourceType` not being assigned correctly
- **Solution**: Verify the `deduplicateWithProfilePriority` function is being called

### **Issue: Profile buttons not showing**
- **Check**: Projects have `sourceType: 'withProfiles'` in console
- **Cause**: Button logic depends on correct `sourceType` assignment
- **Solution**: Ensure profile projects get `sourceType: 'withProfiles'`

### **Issue: Console errors**
- **Check**: Browser console for JavaScript errors
- **Cause**: Syntax errors in the new deduplication function
- **Solution**: Verify the function is correctly placed and syntax is valid

---

## Expected Outcome

After implementing these changes:

1. **No Duplicates**: Same `project_id` will only appear once in the list
2. **Profile Priority**: When duplicates exist, the version with profile data is kept
3. **Correct Filtering**: "Show only projects with profiles" checkbox works correctly
4. **Maintained Functionality**: All existing features continue to work
5. **Better UX**: Users see clean, deduplicated project lists with prioritized profile data

---

## Files to Modify

- **Primary**: `ProjectProfilesModal.js` (or equivalent React component)
- **Testing**: Browser developer console for debugging logs
- **Validation**: UI behavior with various RFP uploads

## Rollback Plan

If issues arise, you can quickly revert by restoring the original deduplication logic:

```javascript
// ROLLBACK CODE:
const uniqueProjects = combinedProjects.filter((project, index, array) => 
  array.findIndex(p => p.project_id === project.project_id) === index
);
```

This implementation requires **no backend changes** and should resolve the duplicate projects issue while maintaining all existing functionality.