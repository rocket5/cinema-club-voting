# New Knowledge Base

This document contains insights and learnings about the Cinema Club Voting codebase.

## Architecture Insights

- The application uses a modal dialog pattern for collecting required information before creating resources
- Session names are stored in the FaunaDB database and displayed throughout the application for better user experience
- The application uses React Context (AppModeContext) to manage global state for Host/Vote mode toggling
- The Navbar component already includes functionality to switch between Host and Vote modes
- FaunaDB is used as the database backend with serverless Netlify functions
- Session creation is restricted to Host mode for administrative control
- The application has a well-structured component system with reusable components like MovieList and MovieCard
- Debug tools are implemented as a collapsible panel component and restricted to Host mode for safety
- The application uses a mode-based architecture to control which features are available to hosts vs. voters
- Navigation elements are conditionally rendered based on the current application mode (Host/Vote)
- Navigation has been simplified to focus only on essential functions, with secondary actions moved to contextual locations
- The MovieCard component is designed to display rich movie data from OMDB API, including poster, year, director, genre, and IMDB rating
- The MovieSearch component focuses on title-based search due to OMDB API limitations

## Technical Implementation Details

- Sessions are sorted by date (newest first) for better user experience
- Sessions in FaunaDB can now have a sessionName field for better identification
- Form validation is implemented for required fields with visual feedback
- The application uses React Router for navigation between different views
- Bootstrap is used for basic styling with custom CSS for specific components
- Netlify Functions are used to create a serverless backend API
- The voting functionality is implemented using a ranking system with the RankInput component
- Bulk database operations are implemented through dedicated Netlify serverless functions
- The same SessionsList component is used for both host and voter modes, with conditional rendering based on isHostMode prop
- OMDB API integration provides rich movie data that is stored in FaunaDB and displayed in the UI
- The MovieList component processes movie data to ensure consistent structure before passing to MovieCard

## Recent Learnings

- Sorting data by recency (newest first) improves user experience by showing the most relevant content first
- When adding new fields to database entities, ensure all API endpoints that return those entities include the new fields
- Adding a modal dialog for session creation improves the user experience by collecting all required information upfront
- Form validation with visual feedback helps users understand what information is required
- Displaying meaningful names instead of IDs significantly improves the readability and usability of the application
- FaunaDB date format may not always be compatible with JavaScript's Date constructor and requires conversion
- Always validate date values before attempting to format them to prevent runtime errors
- Some session fields (status, startDate) might be missing in older database records
- Try-catch blocks should be used when formatting dates to prevent rendering errors
- FaunaDB query response structure may vary (data can be directly an array or nested within data.data)
- It's safer to parse API responses as text first, then attempt JSON parsing in a try-catch block
- The application follows a pattern of conditionally rendering UI elements based on the current app mode
- Components can be easily extended to support multiple modes by passing appropriate props and using conditional rendering
- The same endpoint for fetching sessions can be reused in both Host and Vote modes
- Raw logging of response objects is essential for debugging FaunaDB integration issues
- Defensive coding is necessary when working with external APIs - never assume field existence
- Two-stage error handling (both in API function and UI components) creates a more resilient application
- User feedback with retry capability improves the user experience when API errors occur
- FaunaDB timestamps are returned as complex objects with properties like 'value', 'timestamp', or 'time'
- When working with dates from external APIs, it's important to inspect their structure before processing
- JSON.stringify() can be used as a last resort to at least get some representation of complex objects
- When refactoring components, it's important to maintain mode-specific UI elements like hiding "Add Movie" in Vote mode
- Components should be conditionally rendered based on the current application mode to enforce permission boundaries
- Using established component patterns (like MovieList) helps maintain UI consistency across the application
- Bulk delete operations in FaunaDB require querying for all documents first, then deleting each one individually
- Giving admin users debug tools improves the development and testing workflow but should be restricted to admin roles
- When deleting documents in FaunaDB, it's more reliable to first assign the document to a variable using `let doc = collection.byId(id)` and then call `doc.delete()`
- IDs in FaunaDB should be explicitly converted to strings when used in queries to avoid type mismatches
- Extensive logging is crucial for debugging FaunaDB operations, especially capturing the structure of returned documents
- When integrating external APIs like OMDB, it's important to handle optional fields with fallback values to prevent rendering errors
- Processing data at the list component level ensures consistent data structure before passing to individual card components
- Toggle buttons for UI modes should provide clear visual feedback about the current state
- Form layouts should adapt responsively between mobile and desktop views
- Null checks are essential when working with API responses that may have missing fields
- Empty states with helpful instructions improve the user experience for new users

## FaunaDB Date Format Specifics

- FaunaDB may return timestamps as JSON objects with an `isoString` property
- FaunaDB Time objects sometimes use an `@ts` property to store the actual timestamp value
- When stringifying date objects, they may become nested JSON strings that need to be parsed again
- Multi-level parsing might be needed to extract date values from FaunaDB responses
- Always check both the type of date values and their internal structure
- It's safer to parse JSON strings within your date handling functions, as FaunaDB might use different formats across versions

## FaunaDB Query and Modification Best Practices

- Always validate the structure of data returned from FaunaDB queries before attempting to access nested properties
- For important operations like deletion, log the full document structure to understand what you're working with
- When deleting documents, use a two-step approach: first retrieve the document by ID, then delete it
- Convert IDs to strings when passing them to FaunaDB queries to ensure consistent type handling
- Include extensive error handling for each document operation in bulk processes, rather than relying on a single try/catch
- For debugging FaunaDB operations, log both input parameters and output results to track the flow of data
- Multiple deletion strategies may be needed for FaunaDB documents due to syntax differences between versions or document structures
- FaunaDB bulk operations can be performed using the forEach method on a collection's all() result
- When doing critical operations, implement multiple fallback approaches to handle different FaunaDB syntax variations
- Try multiple ID formats when deleting documents (numeric ID, string ID, quoted ID) as FaunaDB may interpret them differently
- For critical operations, verify the results by querying the database again after the operation
- Numeric vs string IDs can cause issues in FaunaDB - always try both formats if one fails 

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent structure before rendering individual cards
- The OMDB API returns poster URLs that can be used directly in the UI
- For movies without posters, always provide a placeholder image URL 
- The OMDB API doesn't have direct parameters for searching by director or actor, only title search is supported
- The OMDB API's search endpoint (with parameter 's') only returns basic movie information, requiring additional calls to get full details
- The OMDB API response structure differs between search results and detailed movie information
- The OMDB API may return 'N/A' for missing fields rather than null or empty strings
- The OMDB API has rate limits, so it's important to optimize the number of API calls made during searches
- The OMDB API parameters are limited to: search term (s), type (movie/series/episode), year (y), page number, and response format
- For advanced search capabilities like filtering by director or actor, a different API like TMDB would be more suitable
- When implementing search functionality, it's crucial to review API documentation to understand its capabilities and limitations
- The OMDB API is best used for title-based searches and retrieving detailed information about specific movies by IMDb ID 