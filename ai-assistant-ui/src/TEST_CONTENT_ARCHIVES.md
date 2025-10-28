# Content Archives Integration Test

## How to Test the Content Archives Feature

### Automatic Testing (Development Mode)

1. **Start the application in development mode** (`npm start`)
2. **Upload any RFP document** through the Project Profiles modal
3. **Look for the yellow development notice** at the top of results
4. **Look for the test project or first project** - it will have real content archives from project "AMR L201 Cx"
5. **Click on the content archive buttons** to test the modal functionality with real data

### What You Should See

#### Test Data Source:
- **Real content archives** from project ID: `aBA1R000000CnwiWAC` 
- **Project Name**: "AMR L201 Cx"
- **3 actual content archive entries** from the database

#### In the Project Cards:
- **"Available Content:" section** with clickable buttons
- **Real content archive names** from the database
- **Eye icon** next to each button

#### When Clicking Content Buttons:
- **Modal opens** with actual project content
- **Real HTML content** from the database
- **Styled content** matching the application theme
- **Close button** and click-outside-to-close functionality

### Test Cases to Verify

1. ✅ **Modal Opening**: Click content archive buttons
2. ✅ **Modal Closing**: Close button and click outside
3. ✅ **Real HTML Rendering**: Check if actual database content displays properly
4. ✅ **Styling**: Verify consistent styling with app theme
5. ✅ **Responsiveness**: Test on different screen sizes
6. ✅ **Multiple Archives**: Real project has 3 content archive entries
7. ✅ **Accessibility**: Tab navigation and focus states
8. ✅ **Real Data**: Verify content is from actual project database

### How It Works

- Fetches real content archives via API: `/api/v1/projects/aBA1R000000CnwiWAC/content-archives`
- Applies content archives to the test project if found, or to the first project if test project not in results
- Uses actual database content instead of mock HTML

### Production Behavior

- In production (`NODE_ENV !== 'development'`), no test data is added
- Only content archives returned by the RFP analysis API will be displayed
- The development notice will not appear

### Removing Test Code

When ready for production, remove these sections from `ProjectProfilesModal.js`:

1. The real content archives injection (lines ~102-135)
2. The development notice display (lines ~319-324)
3. The dev-notice CSS styles

### Backend Integration

The component expects content archives in this format:
```javascript
{
  id: "unique_id",
  project_id: "project_id", 
  name: "Display Name",
  content: "<html>Content here</html>",
  content_type: "text/html"
}
```