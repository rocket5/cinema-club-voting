# New Knowledge Base

This document contains insights and learnings about the Cinema Club Voting codebase.

## Architecture Insights

- The application uses React Context (AppModeContext) to manage global state for Host/Vote mode toggling
- The Navbar component already includes functionality to switch between Host and Vote modes
- FaunaDB is used as the database backend with serverless Netlify functions
- Session creation is restricted to Host mode for administrative control

## Technical Implementation Details

- Sessions in FaunaDB have fields like startDate, status, hostId, and winningMovie
- The application uses React Router for navigation between different views
- Bootstrap is used for basic styling with custom CSS for specific components
- Netlify Functions are used to create a serverless backend API

## Recent Learnings

- FaunaDB date format may not always be compatible with JavaScript's Date constructor and requires conversion
- Always validate date values before attempting to format them to prevent runtime errors
- Some session fields (status, startDate) might be missing in older database records
- Try-catch blocks should be used when formatting dates to prevent rendering errors
- FaunaDB query response structure may vary (data can be directly an array or nested within data.data)
- It's safer to parse API responses as text first, then attempt JSON parsing in a try-catch block
- Raw logging of response objects is essential for debugging FaunaDB integration issues
- Defensive coding is necessary when working with external APIs - never assume field existence
- Two-stage error handling (both in API function and UI components) creates a more resilient application
- User feedback with retry capability improves the user experience when API errors occur
- FaunaDB timestamps are returned as complex objects with properties like 'value', 'timestamp', or 'time'
- When working with dates from external APIs, it's important to inspect their structure before processing
- JSON.stringify() can be used as a last resort to at least get some representation of complex objects

## FaunaDB Date Format Specifics

- FaunaDB may return timestamps as JSON objects with an `isoString` property
- FaunaDB Time objects sometimes use an `@ts` property to store the actual timestamp value
- When stringifying date objects, they may become nested JSON strings that need to be parsed again
- Multi-level parsing might be needed to extract date values from FaunaDB responses
- Always check both the type of date values and their internal structure
- It's safer to parse JSON strings within your date handling functions, as FaunaDB might use different formats across versions 