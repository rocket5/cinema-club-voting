# New Knowledge Base

This file documents new insights and knowledge gained about the Cinema Club Voting codebase.

## FaunaDB Integration

- The project uses FaunaDB as its database solution
- FaunaDB client is initialized in Netlify functions using environment variables for the secret key
- The database schema includes collections for Movies, Sessions, and Votes
- FaunaDB Query Language (FQL) is used for database operations
- Netlify functions serve as the API layer between the frontend and FaunaDB
- The project uses the newer `fauna` package instead of the older `faunadb` package
- Error handling is implemented consistently across database operations with detailed error messages
- Timestamps are automatically added to records for created and updated operations
- FaunaDB requires the use of the null-check operator (`!`) when deleting documents to prevent errors when the document doesn't exist
- Collection names in FaunaDB queries must be consistent and match the actual collection names in the database (e.g., `movies`, `sessions`, `votes` instead of `Movie`, `Session`, `Vote`)
- FaunaDB's document IDs are strings, not numbers, and must be handled accordingly when performing operations
- Centralizing FaunaDB operations in a dedicated library significantly simplifies Netlify functions and improves code maintainability
- Using a centralized FaunaDB library reduces code duplication and ensures consistent error handling across all database operations
- Refactoring Netlify functions to use a centralized library makes the codebase more maintainable and easier to update
- The FaunaDB library pattern with separate modules for different entities (movies, sessions, votes) provides a clean separation of concerns

## API Architecture

- The project uses Netlify functions as serverless API endpoints
- Each API endpoint is implemented as a separate function in the `netlify/functions` directory
- The frontend communicates with these endpoints using the Fetch API
- API endpoints follow RESTful principles with appropriate HTTP methods (GET, POST, PUT, DELETE)
- Error handling is implemented consistently across all API endpoints
- Response formats are standardized across all API endpoints
- The frontend API code is centralized in dedicated modules (e.g., `src/api/movies.js`, `src/api/sessions.js`)
- Replacing monolithic API endpoints with dedicated functions for specific operations improves maintainability and testability
- Dedicated API functions are easier to understand, test, and maintain than monolithic functions that handle multiple operations
- Frontend API modules abstract away the details of API communication, making it easier to change the underlying implementation
- Enhanced error handling in frontend API modules improves the user experience by providing more detailed error messages
- Consistent response parsing in frontend API modules ensures that the frontend always receives data in the expected format

## Bulk Operations

- Bulk operations (like deleting all movies or sessions) are implemented using a two-phase approach:
  1. First attempt a bulk delete operation using FaunaDB's `forEach` method
  2. If that fails, fall back to deleting items one by one
- This approach ensures that bulk operations are as efficient as possible while still being reliable
- Bulk operations return detailed results, including success/failure status for each item
- Centralizing bulk operation logic in the FaunaDB library simplifies the Netlify functions that expose these operations
- Bulk operations are exposed through dedicated API endpoints (`delete-all-movies`, `delete-all-sessions`)
- The frontend API provides dedicated functions for bulk operations, making them easy to use from the frontend

## Refactoring Insights

- Refactoring monolithic functions into dedicated functions for each operation significantly improves code maintainability
- Centralizing database operations in a dedicated library reduces code duplication and ensures consistent error handling
- Updating frontend API code to use dedicated functions instead of monolithic functions improves code organization and testability
- Removing unused code (like the monolithic `movies.js` function) reduces technical debt and improves code clarity
- Standardizing response formats across all API endpoints makes the API easier to use and understand
- Enhancing error handling in both backend and frontend code improves the user experience
- Consistent logging throughout the codebase makes debugging easier
- The refactoring process revealed several areas for improvement, such as inconsistent error handling and response formats
- The refactored code is more modular, making it easier to add new features or modify existing ones
- The refactored code follows the Single Responsibility Principle, with each function having a clear and specific purpose

## Technical Implementation Details

- Sessions are sorted by date (newest first) for better user experience
- Refactoring complex multi-approach strategies (for updates and deletions) into a single library function dramatically simplifies the code
- The library approach allows for consistent timestamp handling across all database operations
- Centralizing database operations in a library makes it easier to implement and enforce data validation rules
- Using a library pattern reduces the risk of errors when performing database operations
- The library approach makes it easier to add new features or modify existing ones without duplicating code
- Refactoring Netlify functions to use the library reduces their size by up to 80%, making them more maintainable
- FaunaDB can return data in different structures depending on the query and response size
- Library functions must handle multiple possible response structures from FaunaDB (direct array, nested data.data array, single object)
- Always check if the response from FaunaDB is an array before attempting to use array methods like map()
- FaunaDB query responses should be thoroughly logged during development to understand their structure
- Defensive programming is essential when working with FaunaDB responses to handle all possible data structures
- Refactoring complex date extraction logic from Netlify functions into the FaunaDB library centralizes this complex logic in one place
- Moving complex data processing (like date extraction) from Netlify functions to the library layer improves maintainability and consistency
- The extractDateString helper function in the sessions library handles all the complex date format variations from FaunaDB
- Centralizing date extraction logic ensures consistent date handling across all functions that need to process dates
- Implementing bulk deletion operations in the library layer provides a consistent approach across different entity types
- The deleteAllMovies and deleteAllSessions functions follow the same pattern, making the code more maintainable
- Bulk deletion operations benefit from a two-phase approach: first attempt a bulk delete, then fall back to individual deletions
- Reusing existing single-entity deletion functions (deleteMovie, deleteSession) in bulk operations ensures consistency
- Bulk operations should always return detailed results including success/failure status for each entity
- Implementing bulk operations in the library layer allows for better error handling and logging

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
- The AddMovie component is designed to handle both adding new movies and editing existing ones
- The application follows a RESTful API pattern with separate serverless functions for different operations (get, create, update, delete)
- The codebase contains a mix of older and newer FaunaDB client implementations, requiring careful handling of database operations

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
- Bootstrap Icons are used for action buttons to create a cleaner, more modern UI
- The application uses a consistent pattern for CRUD operations with separate serverless functions
- Detailed error handling is implemented at both the API and UI levels for better user experience
- Dedicated serverless functions for specific operations (like delete-movie) provide better reliability than generic endpoints

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
- Using icons instead of text for action buttons creates a cleaner, more modern UI
- The useNavigate hook from React Router is essential for programmatic navigation in response to user actions
- Implementing edit functionality requires careful state management to handle both new and existing data
- Conditional rendering based on edit mode helps reuse the same form component for both adding and editing
- Loading states with spinners improve user experience during data fetching operations
- Error states with retry options help users recover from API failures
- When implementing a feature, ensure all required serverless functions exist and are properly implemented
- Detailed error logging in both the browser console and serverless function logs is essential for debugging
- Providing a retry mechanism for failed API calls improves user experience and helps recover from transient errors
- Always include a way for users to navigate back when encountering errors to prevent them from getting stuck
- When updating documents in FaunaDB, it's important to first verify the document exists before attempting to update it
- Multiple ID format handling (string vs numeric) is necessary for robust FaunaDB operations
- Implementing fallback strategies for database operations increases the reliability of the application
- Detailed logging before, during, and after database operations helps identify the exact point of failure
- When updating a document in FaunaDB, using a multi-step approach with verification improves reliability
- FaunaDB document updates require a specific structure with a nested 'data' property for the fields to update
- When updating FaunaDB documents, it's important to use the correct syntax: `doc.update({ data: { field: value } })`
- FaunaDB has multiple valid syntaxes for updating documents, and implementing fallbacks for each increases reliability
- The FaunaDB client library may handle document references differently between versions, requiring multiple approaches
- Using native JavaScript Date objects and converting to ISO strings is more reliable than using FQL Time functions
- When updating documents, only include the fields that need to be updated to minimize the risk of data loss
- FaunaDB schema definitions may not reflect the actual structure of documents in the database due to schema evolution
- When a codebase contains a mix of older and newer FaunaDB client implementations, it's important to create dedicated functions for critical operations
- Replacing generic endpoints (like movies.js) with dedicated functions for specific operations improves reliability and maintainability
- When deleting documents in FaunaDB, it's important to use the same client library and syntax as other operations for consistency
- Updating component code to use new endpoints is simpler than trying to fix complex generic endpoints
- When implementing critical database operations like deletion, it's essential to try multiple approaches with different syntax variations
- Examining working code (like delete-all-movies.js) can provide valuable insights into successful patterns for database operations
- For maximum reliability, implement multiple deletion approaches to handle all possible FaunaDB document formats and ID types
- Detailed logging of each deletion attempt helps identify which approach works for specific document structures
- When a function fails with a 500 error, examining the Netlify function logs is crucial for understanding the root cause
- When client libraries cause inconsistent behavior, using direct REST API calls can provide a more reliable solution
- Missing or inconsistent client library files can cause hard-to-debug issues in serverless functions
- Direct REST API calls to FaunaDB can bypass client library inconsistencies and version conflicts
- Enhanced error reporting in UI components helps users understand what went wrong and provides developers with better debugging information
- Using built-in Node.js modules like 'https' instead of external dependencies reduces deployment issues in serverless functions
- Serverless functions should minimize external dependencies to reduce deployment size and potential compatibility issues
- When working with serverless functions, it's important to check if required modules are available in the runtime environment
- When working with FaunaDB, it's important to understand the different document structures that can exist in the database
- FaunaDB FQL queries can be used to search for documents in multiple ways, providing more flexibility than REST API calls
- The FaunaDB query language (FQL) allows for complex operations like filtering, mapping, and conditional logic
- When deleting documents in FaunaDB, it's important to verify the document exists before attempting to delete it
- FaunaDB documents can be referenced in multiple ways: by ID, by reference, or by query
- When working with FaunaDB, it's important to identify which version of FQL syntax is supported by your database
- The FQL syntax in the documentation may not match the syntax supported by your specific FaunaDB instance
- Error messages like "Cannot use `[]` operator with type `Set<movies>`" indicate that you're using newer FQL syntax with an older FaunaDB version
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- When troubleshooting FaunaDB operations, pay close attention to the exact error messages as they provide clues about the correct syntax
- When troubleshooting a non-working function, examine a similar working function and replicate its approach exactly
- Using the exact same client library and version is crucial for consistent behavior across related functions
- When multiple approaches fail, the most reliable solution is to copy the approach from a known working function
- The client library import statement is critical - using `const { Client, fql } = require('fauna')` vs other import methods can make a difference
- For maximum reliability, use the same client initialization, query syntax, and error handling as a working function
- When using FQL queries, avoid direct string interpolation inside the query
- FQL queries with variables are more reliable than direct string interpolation
- String values in FQL queries should be defined as variables outside string contexts to avoid escaping issues
- When troubleshooting FQL syntax errors, examine the exact error message which often points to the specific syntax issue
- For critical operations like deletion, finding the document first and then using its exact ID for deletion is more reliable than direct ID-based deletion
- Comprehensive error handling with multiple fallback strategies is essential for robust serverless functions
- Enhanced error reporting in UI components provides better user feedback and debugging information
- When all else fails, simplify the approach and focus on what works rather than trying to fix complex queries
- For FaunaDB operations, it's often more reliable to first fetch all documents and then find the target document in JavaScript before performing operations
- Using a JavaScript-first approach (finding items in memory) before attempting database operations can be more reliable than complex FQL queries
- When implementing multiple deletion strategies, use a cascading approach where each strategy is only attempted if the previous one fails
- Implementing a "find first, then delete" pattern is more reliable than trying to delete directly by ID
- For complex operations, it's better to break them down into multiple simple steps rather than trying to do everything in a single query
- When working with FaunaDB, extensive logging of input parameters, intermediate results, and final outcomes is essential for debugging

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

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
- When updating documents in FaunaDB, use the pattern `let doc = collection.byId(id)` followed by `doc.update(data)`
- The FQL `Time.now()` function can be used to automatically timestamp document updates
- When fetching a single document by ID, use the pattern `let doc = collection.byId(id)` followed by `doc` to return the document
- Always check if a document exists before trying to access its properties to avoid runtime errors
- For update operations, implement a multi-step approach: first check if the document exists, then attempt the update
- When an update fails, try alternative ID formats (string vs numeric) as FaunaDB may handle them differently
- Wrap each database operation in its own try-catch block to implement fallback strategies
- Log the document structure before and after update operations to verify changes were applied correctly
- Use the spread operator (...) when returning updated document data to include all fields in the response
- FaunaDB document updates require a specific structure with fields nested under a 'data' property
- There are multiple valid syntaxes for updating documents in FaunaDB:
  - `doc.update({ data: { field: value } })`
  - `collection.update(id, { data: { field: value } })`
- The FaunaDB client may interpret document references differently between versions, requiring multiple update approaches
- When updating documents, it's safer to use JavaScript Date objects converted to ISO strings than FQL Time functions
- For maximum compatibility, implement at least three fallback strategies for critical database operations
- The actual document structure in FaunaDB may differ from the schema definition due to schema evolution over time
- FaunaDB's error messages may not always clearly indicate the root cause of failures, requiring extensive logging
- There are multiple valid syntaxes for deleting documents in FaunaDB:
  - `doc.delete()`
  - `collection.delete(id)`
- When a codebase uses multiple versions of the FaunaDB client, it's better to create dedicated functions for each operation
- The older FaunaDB client uses `q.Delete(q.Ref(q.Collection('movies'), id))` syntax
- The newer FaunaDB client uses `movies.byId(id).delete()` syntax
- Mixing different client versions in the same codebase can lead to inconsistent behavior and errors
- For reliable document deletion in FaunaDB, implement multiple approaches:
  1. Using forEach to iterate through all documents and find the target by ID
  2. Direct deletion with byId using numeric ID
  3. Direct deletion with byId using string ID
- When implementing multiple fallback strategies, use a boolean flag to track success and only try subsequent approaches if previous ones fail
- Always return detailed error information to the client when all deletion approaches fail to aid in debugging
- The "delete all" functionality can be a valuable reference for implementing single-document deletion with the same patterns
- When debugging FaunaDB operations, log the type of ID being used (typeof id) as type mismatches are a common source of errors
- FQL queries can be used to find documents by any field, not just by ID
- The `movies.where(.id == "value")` syntax is more reliable than direct document references
- FQL's `filter()` function can be used to search for documents with specific field values
- The `append()` function in FQL can be used to add items to an array
- FQL's `forEach()` function can be used to iterate over collections and perform operations on each document
- When a document is not found, FQL operations may return null, which requires null checking before operations
- The error "Type 'Null' does not have field 'delete'" indicates an attempt to call a method on a null value
- Classic FQL syntax uses functions like Get(), Match(), Delete() instead of the newer dot notation syntax
- The error "Cannot use `[]` operator with type `Set<movies>`" indicates that array indexing is not supported in your FaunaDB version
- The error "Type `Set<movies>` does not have field `filter`" indicates that the filter() method is not supported in your FaunaDB version
- The error "Type `Array<Never>` does not have field `count`" indicates that the count() method is not supported in your FaunaDB version
- Classic FQL uses Lambda() and Var() for working with variables instead of arrow functions
- Classic FQL uses Select() to access object properties instead of dot notation
- When using classic FQL, document references are created with Ref(Collection("name"), "id")
- The Paginate() function is used to handle sets of references in classic FQL
- The Map() function is used to apply operations to each item in a set in classic FQL
- The Filter() function is used to filter sets based on a condition in classic FQL
- The Equals() function is used for equality comparisons in classic FQL
- The Documents() function is used to get all documents in a collection in classic FQL
- When a function works in one context (bulk operations) but not another (single operations), use the exact same approach for both
- The newer FaunaDB client uses `const { Client, fql } = require('fauna')` import syntax
- The newer FaunaDB client supports dot notation for accessing collection methods: movies.all(), movies.byId()
- When multiple deletion approaches fail, try using forEach to iterate through all documents and find the target by ID
- Using a combination of string and numeric ID comparisons increases reliability
- Tracking success with a boolean flag and returning structured results helps identify which approach worked
- For string values in FQL, define variables at the beginning of the query
- For numeric values in FQL, define variables at the beginning of the query
- Always use proper null checking in FQL queries: `if (doc != null) { ... }`
- When a query fails with syntax errors, try restructuring it to use variables instead of direct interpolation
- FQL queries should be structured to avoid direct string interpolation within expressions

## OMDB API Integration

- The OMDB API provides rich movie data including title, year, director, genre, plot, and ratings
- When storing OMDB data in FaunaDB, include all relevant fields to enhance the user experience
- Always handle missing OMDB fields with fallback values to prevent rendering errors
- The MovieCard component can display OMDB data using Bootstrap badges for a clean UI
- Processing movie data at the list level ensures consistent data structure before rendering individual cards
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

## React Component Best Practices

- Functions that need to be called from event handlers should be defined at the component level, not inside useEffect hooks
- When a function is defined inside a useEffect hook, it's only accessible within that hook's scope
- Moving data fetching functions outside of useEffect makes them reusable throughout the component
- For functions that depend on state or props, define them at the component level to ensure they have access to the latest values
- When refreshing data after operations like delete or update, having reusable fetch functions at the component level simplifies the code
- The React component scope follows JavaScript closure rules - inner functions have access to outer variables, but not vice versa 

## Netlify Functions Refactoring

- Refactoring all Netlify functions to use the FaunaDB library has significantly reduced code complexity
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines after refactoring
- Complex date extraction logic is now handled in the library layer rather than in individual functions
- Refactored functions follow a consistent structure: validate request, call library function, return response
- Error handling and logging patterns are consistent across all refactored functions
- Refactored functions are more resilient to changes in FaunaDB response structures
- The library approach makes it easier to add new features or modify existing ones
- Separation of concerns is improved with HTTP handling in functions and data processing in the library
- Refactored functions are easier to test due to reduced responsibilities
- Duplicate functions (create-session.js and add-session.js) can be consolidated in future refactoring
- Standardized implementations for CRUD operations across all entity types
- Improved error reporting and validation consistency
- Enhanced timestamp handling and data structure standardization
- Bulk operations (delete-all-movies.js, delete-all-sessions.js) are now much simpler, delegating complex logic to the library
- Refactored bulk deletion functions are reduced from nearly 200 lines to less than 40 lines each
- The library approach allows for reuse of common patterns across different entity types
- Bulk operations now have consistent error handling and result formatting

- Refactoring Netlify functions to use a centralized library dramatically reduces their complexity and size
- The get-sessions.js function was reduced from over 200 lines to less than 30 lines by using the library
- Complex date extraction logic is better placed in the library layer than in individual Netlify functions
- Netlify functions should focus on HTTP request/response handling, delegating business logic to the library
- Refactored Netlify functions have a consistent structure: validate request, call library function, return response
- Error handling in refactored functions is simpler and more consistent across all endpoints
- Refactoring Netlify functions to use the library makes it easier to add new features or modify existing ones
- The library approach ensures that all Netlify functions use the same client initialization and query patterns
- Refactored functions have better separation of concerns: HTTP handling in the function, data processing in the library
- Consistent logging patterns across refactored functions make debugging easier
- Refactored functions are more resilient to FaunaDB response structure changes as the library handles these variations
- The library approach ensures that all functions benefit from improvements made to the library functions
- Refactoring reduces the risk of inconsistent behavior between different Netlify functions
- Systematic refactoring of all Netlify functions to use the library creates a more maintainable codebase
- Refactored functions are easier to test as they have fewer responsibilities and dependencies
- Duplicate functions like create-session.js and add-session.js can be consolidated after refactoring to use the same library function
- Refactoring reveals redundant functions that can be consolidated or removed
- Standardizing on a single implementation for each operation (create, read, update, delete) improves consistency
- Refactoring functions that serve similar purposes (like create-session.js and add-session.js) to use the same library function ensures consistent behavior
- Enhanced error reporting in refactored functions provides better debugging information for both developers and users
- Refactored functions include more detailed error messages that help identify the root cause of failures
- The library approach makes it easier to implement consistent validation across all functions
- Refactoring reveals inconsistencies in how data is structured and validated across different functions
- Standardizing on a single implementation for each operation ensures that all functions use the same data structure
- The library approach makes it easier to implement consistent timestamp handling across all functions 