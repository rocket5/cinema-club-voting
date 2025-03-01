# New Knowledge Base

This file documents new insights and knowledge gained about the Cinema Club Voting codebase.

## Supabase Integration

- The project is being migrated from FaunaDB to Supabase for database and authentication
- Supabase provides both database and authentication services in a single platform
- Row-Level Security (RLS) policies are used to control access to data in Supabase
- RLS policies can be defined at the table level to restrict access based on user roles
- Supabase allows for flexible role management through custom user metadata
- The `is_host` flag in the profiles table is used to determine if a user has host privileges
- Supabase client is initialized with project URL and anon key from environment variables
- Authentication state is managed through the Supabase Auth API
- User profiles are stored in a separate profiles table linked to auth.users
- The profiles table includes fields for name, bio, and host status
- Supabase triggers can be used to automatically create profile records when users sign up
- The Supabase client provides methods for authentication (signUp, signIn, signOut)
- User session state is persisted in local storage by the Supabase client
- The AuthContext provides a centralized way to access authentication state throughout the app
- Protected routes can be implemented using the authentication state from AuthContext
- Host-specific routes can be protected based on the user's host status
- Migration from FaunaDB to Supabase requires careful planning of database schema and authentication flow
- Row-Level Security (RLS) policies in Supabase provide fine-grained access control at the database level
- User role management can be implemented using a profiles table with an is_host boolean field
- Supabase triggers can automatically create user profiles when new users sign up
- Error handling for database operations should account for table existence and record existence
- The Supabase client needs proper initialization with URL and anon key from environment variables
- Authentication state management is handled through the Supabase Auth API
- Username is required for host mode to ensure session creator identification
- Explicitly clearing user state during logout helps prevent stale authentication states
- Overriding Supabase auth methods with custom implementations allows for better debugging and error handling
- Adding a debug method to the Supabase client helps diagnose authentication issues
- When extending Supabase client methods for debugging, it's crucial to preserve all original methods
- Replacing the entire auth object can break functionality like onAuthStateChange
- Method-by-method extension is safer than replacing the entire object
- Adding new methods with different names (e.g., debugSignOut) is safer than overriding existing methods
- Preserving the original method references ensures core functionality remains intact
- Supabase stores authentication state in localStorage with keys prefixed with 'sb-'
- When regular logout fails, clearing localStorage and sessionStorage can force authentication state reset
- Multiple fallback strategies for logout ensure users can always sign out
- Force page reload can help recover from stuck authentication states
- Creating user profiles during signup improves the user experience by eliminating the need for a separate profile creation step
- Storing username in both auth metadata and the profiles table provides redundancy and flexibility
- Unhandled Promise rejections in authentication methods can cause the login process to get stuck
- Wrapping authentication methods with proper error handling prevents unhandled rejections
- Implementing timeout detection for login attempts helps identify and recover from stuck states
- Providing emergency reset options in the login UI improves user experience during authentication issues
- Tracking authentication errors in the AuthContext allows for better error reporting and recovery
- Proper cleanup of auth state change listeners prevents memory leaks and unexpected behavior

## Authentication Implementation

- The application uses a context-based authentication system with React Context API
- AuthContext provides authentication state and methods to the entire application
- The useAuth hook simplifies access to authentication state and methods
- Authentication state includes the current user object and loading status
- Protected routes redirect unauthenticated users to the login page
- Host routes check both authentication status and host privileges
- The Login page handles user authentication with email and password
- The Signup page handles user registration with email and password
- The Profile page allows users to view and update their profile information
- Users can toggle between host and regular user modes in their profile
- Authentication-related UI components are conditionally rendered based on auth state
- The Navbar displays different links based on authentication status
- CSS styles for authentication pages use a consistent design language
- Form validation is implemented for login and signup forms
- Error handling is implemented for authentication operations
- Loading states are displayed during authentication operations
- Success messages are displayed after successful operations
- Context-based authentication system using React Context API provides global access to auth state
- Protected routes can be implemented using wrapper components that check authentication status
- User profiles should be created automatically upon registration to avoid errors
- Error handling for missing profile data is crucial for a smooth user experience
- Profile data should be fetched after authentication and stored in state for use across components
- Validation for required fields should be implemented at both UI and database levels
- Conditional UI elements can guide users to complete required profile information
- Providing multiple logout options (navbar and profile page) improves user experience
- Proper cleanup of authentication state during logout prevents UI inconsistencies
- Comprehensive logging throughout the authentication flow helps identify issues
- Emergency logout functions provide a way to recover from stuck states
- Tracking authentication state changes with console logs helps diagnose timing issues
- Adding retry functionality for profile fetching improves resilience
- The onAuthStateChange listener is essential for keeping the application in sync with auth state
- Preserving the original onAuthStateChange method is critical for proper authentication flow
- Implementing emergency logout options helps users recover from stuck authentication states
- Adding fallback navigation to login page ensures users can always reset their session
- Aggressive logout strategies that clear localStorage and sessionStorage can resolve persistent authentication issues
- Implementing multiple layers of fallback for logout operations ensures reliability
- Using window.location.href for navigation during logout is more reliable than React Router's navigate
- Force page reload can help clear memory state when other logout methods fail
- Collecting username during signup simplifies the onboarding process and ensures users have a complete profile from the start
- Validating username length during signup prevents issues with too short or too long usernames
- Providing clear instructions about username visibility helps users make informed decisions
- Implementing timeout detection for login attempts helps identify and recover from stuck states
- Adding emergency reset buttons in the login UI improves user experience during authentication issues
- Tracking authentication errors in the AuthContext allows for better error reporting and recovery
- Proper cleanup of auth state change listeners prevents memory leaks and unexpected behavior
- Wrapping authentication methods with proper error handling prevents unhandled rejections

## React Router Integration

- Protected routes are implemented using React Router's component composition
- The ProtectedRoute component wraps routes that require authentication
- The HostRoute component wraps routes that require host privileges
- Route protection is implemented by checking auth state and redirecting if necessary
- The useNavigate hook is used for programmatic navigation after authentication events
- The useLocation hook is used to determine the current route for UI highlighting
- Public routes (login, signup) are accessible without authentication
- All other routes are protected and require authentication
- Protected routes can be implemented as wrapper components around Route components
- Navigation handling after authentication events (login, logout) improves user experience
- Role-based route protection can be implemented by checking user attributes
- Programmatic navigation after logout ensures users are redirected to appropriate pages
- Fallback navigation options help users recover from stuck states
- Using window.location.href for navigation during logout is more reliable than React Router's navigate
- Force page reload can help clear memory state when other logout methods fail
- Redirecting to the login page after detecting a stuck login attempt helps users recover

## User Experience Improvements

- The authentication flow provides clear feedback on success and error states
- Loading indicators are displayed during authentication operations
- Form validation prevents submission of invalid data
- Error messages are displayed when authentication operations fail
- Success messages are displayed after successful operations
- The Profile page provides a user-friendly interface for managing account settings
- The host mode toggle provides a simple way to switch between user roles
- The Navbar provides easy access to authentication-related actions
- CSS styles for authentication pages create a consistent and professional look
- Responsive design ensures a good experience on both desktop and mobile devices
- Loading states should be clearly indicated to users during authentication and data fetching
- Error messages should be descriptive and actionable
- Success messages provide positive feedback for user actions
- Form validation enhances data integrity and user experience
- Responsive design ensures usability across different devices
- Visual indicators for required fields help users understand what information is needed
- Conditional disabling of buttons prevents users from performing actions without meeting requirements
- Providing logout functionality in multiple locations improves accessibility
- Adding debug information panels helps developers troubleshoot issues
- Retry buttons allow users to recover from temporary failures
- Fallback UI for authentication loading states improves user experience
- Emergency logout options provide a way for users to recover from stuck authentication states
- Clear error messages during logout failures help users understand what went wrong
- Multiple fallback strategies for logout ensure users can always sign out
- Force page reload can help recover from stuck authentication states
- Implementing timeout detection for login attempts helps identify and recover from stuck states
- Adding emergency reset buttons in the login UI improves user experience during authentication issues
- Providing debug options in the login UI helps developers troubleshoot authentication issues
- Displaying warning messages for long-running login attempts helps manage user expectations

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
- Refactoring database operations into library functions improves code organization
- Error handling should be comprehensive and provide meaningful feedback
- Environment variables should be properly configured for different environments
- Automatic profile creation should handle both missing tables and missing records
- Authentication state should be explicitly cleared during logout to prevent stale states
- Supabase's onAuthStateChange listener helps keep authentication state in sync
- Console logging at key points in the authentication flow helps identify issues
- Tracking component lifecycle events helps understand when authentication state changes
- Checking if database tables exist before querying them prevents errors
- Tracking the number of fetch attempts helps identify infinite loops
- When extending or modifying third-party libraries, preserve all original functionality
- Method-by-method extension is safer than object replacement for third-party libraries
- Store references to original methods before overriding them to maintain functionality
- Adding new methods with different names instead of overriding existing ones prevents conflicts
- Using a non-destructive approach to library extension ensures core functionality remains intact
- Supabase stores authentication state in localStorage with keys prefixed with 'sb-'
- Clearing localStorage and sessionStorage can force authentication state reset
- Multiple fallback strategies for logout ensure users can always sign out
- Force page reload can help recover from stuck authentication states
- Wrapping authentication methods with proper error handling prevents unhandled rejections
- Implementing timeout detection for login attempts helps identify and recover from stuck states
- Tracking authentication errors in the AuthContext allows for better error reporting and recovery
- Proper cleanup of auth state change listeners prevents memory leaks and unexpected behavior

## Authentication Debugging Techniques

- Adding console logs at key points in the authentication flow helps track state changes
- Overriding authentication methods with custom implementations provides visibility into the process
- Creating global debugging functions accessible from the browser console enables manual intervention
- Adding debug information panels in UI components helps visualize current state
- Implementing retry functionality allows recovery from temporary failures
- Emergency logout functions provide a way to break out of stuck states
- Checking if database tables exist before querying them helps identify schema issues
- Tracking component lifecycle events helps understand when authentication state changes
- Adding fallback UI for authentication loading states improves user experience
- Providing direct navigation options from loading states helps users recover
- Detailed error logging in catch blocks helps identify the root cause of issues
- Checking authentication state after logout confirms that the session was properly cleared
- When adding debugging to third-party libraries, preserve all original functionality
- Extend methods individually rather than replacing entire objects
- Store references to original methods before overriding them
- Add new methods with different names instead of overriding existing ones
- Implement global emergency functions accessible from the browser console
- Provide multiple ways to recover from authentication issues
- Inspect localStorage to identify authentication-related items
- Clear specific localStorage items to reset authentication state
- Use force page reload as a last resort to clear memory state
- Implement aggressive logout strategies that clear all storage
- Add multiple layers of fallback for critical operations like logout
- Implementing timeout detection for login attempts helps identify and recover from stuck states
- Adding emergency reset buttons in the login UI improves user experience during authentication issues
- Providing debug options in the login UI helps developers troubleshoot authentication issues
- Wrapping authentication methods with proper error handling prevents unhandled rejections
- Tracking authentication errors in the AuthContext allows for better error reporting and recovery
- Using setTimeout to detect potentially stuck operations provides a way to offer recovery options

## Authentication Storage Management

- Supabase stores authentication state in localStorage with keys prefixed with 'sb-'
- Session information may also be stored in sessionStorage
- Cookies may be used for certain authentication aspects
- When regular logout fails, clearing these storage mechanisms can force authentication state reset
- Identifying authentication-related localStorage items by prefix allows targeted clearing
- Clearing all storage (localStorage, sessionStorage, cookies) provides the most aggressive logout approach
- Force page reload ensures all memory state is cleared after storage is reset
- Using window.location.href for navigation during logout bypasses React Router's state management
- Multiple fallback strategies for logout ensure users can always sign out
- Implementing storage clearing in multiple components provides redundancy
- Global emergency functions provide a last resort for authentication reset
- Implementing timeout detection for login attempts helps identify when authentication is stuck
- Adding emergency reset buttons that clear storage helps users recover from stuck states
- Providing debug options in the login UI helps developers troubleshoot authentication issues

## JavaScript/React Best Practices

- When extending objects with new functionality, preserve all original methods
- Use method-by-method extension rather than replacing entire objects
- Store references to original methods before overriding them
- Use proper error handling in asynchronous operations
- Implement comprehensive logging for debugging purposes
- Add fallback UI for error states to improve user experience
- Use React hooks effectively for state management and side effects
- Implement proper cleanup in useEffect hooks to prevent memory leaks
- Use conditional rendering to handle loading and error states
- Provide meaningful error messages to users
- Add retry functionality for critical operations
- Use React Context API for global state management
- Implement proper authentication state management
- Use React Router for navigation and route protection
- Add debugging tools that can be toggled on/off
- Follow the principle of least surprise when extending third-party libraries
- Avoid modifying third-party library objects directly when possible
- Use composition over inheritance for extending functionality
- Implement proper error boundaries to prevent application crashes
- Use try/catch blocks for error handling in async operations
- Add comprehensive logging for debugging purposes
- Implement proper cleanup in useEffect hooks to prevent memory leaks
- Use conditional rendering to handle loading and error states
- Provide meaningful error messages to users
- Add retry functionality for critical operations
- Use React Context API for global state management
- Implement proper authentication state management
- Use React Router for navigation and route protection
- Add new methods with different names instead of overriding existing ones
- Implement global emergency functions accessible from the browser console
- Provide multiple ways to recover from stuck states
- Implement multiple layers of fallback for critical operations
- Use window.location.href for navigation during critical operations like logout
- Clear localStorage and sessionStorage to reset application state when needed
- Force page reload as a last resort to clear memory state
- Wrap authentication methods with proper error handling to prevent unhandled rejections
- Implement timeout detection for long-running operations to identify stuck processes
- Add emergency reset options in the UI to help users recover from stuck states
- Track errors at the context level to provide better error reporting and recovery
- Properly clean up event listeners and subscriptions to prevent memory leaks
- Use setTimeout to detect potentially stuck operations and provide recovery options
- Provide debug options in the UI to help developers troubleshoot issues

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
- Modal dialog patterns simplify user interactions for common tasks
- Component structure should follow separation of concerns principles
- Navigation can be simplified using React Router hooks
- User profiles should contain only essential information needed for the application
- Authentication state management should be centralized in a context provider
- Debugging tools should be conditionally rendered based on environment
- Error boundaries can prevent entire application crashes due to authentication issues
- When extending third-party libraries, follow a non-destructive approach
- Implement multiple layers of fallback for critical operations
- Provide global emergency functions for last-resort recovery
- Use aggressive cleanup strategies for authentication state management
- Implement timeout detection for critical operations to identify stuck processes
- Add emergency reset options in the UI to help users recover from stuck states
- Track errors at the context level to provide better error reporting and recovery

## Netlify Deployment

- The project is configured for Netlify deployment with a netlify.toml file in the root directory
- The build command is set to "npm run build" and the publish directory is "build"
- Netlify functions are stored in the "netlify/functions" directory
- The project uses redirects to handle client-side routing with React Router
- The site is deployed at https://cinemaclub-ai.netlify.app
- Deployment can be done using the Netlify CLI with the command "netlify deploy --prod"
- It's important to run "npm run build" before deploying to ensure the latest changes are included
- After updating environment variables in the Netlify dashboard, a redeployment is required for the changes to take effect
- Environment variables can be set using the Netlify CLI with `netlify env:set KEY VALUE` or through the Netlify dashboard
- To check existing environment variables, use `netlify env:list` (values are hidden by default)
- Environment variables set in the Netlify dashboard are not automatically applied to functions until redeployment
- Environment variables must be configured in Netlify for production deployment
- Build settings should be properly configured for React applications

## Debugging Strategies

- Console logging at key points helps identify issues in the authentication flow
- Checking network requests can reveal API communication problems
- Understanding error codes from Supabase helps diagnose issues
- Adding emergency logout options can help recover from authentication state issues
- Tracking component lifecycle events helps understand when authentication state changes
- Adding retry functionality for critical operations improves resilience
- Implementing fallback UI for error states improves user experience
- Creating global debugging functions accessible from the browser console enables manual intervention
- Checking database table existence before querying helps identify schema issues
- Detailed error logging in catch blocks helps identify the root cause of issues
- Examining error stack traces helps pinpoint the exact location of issues
- Preserving original functionality when adding debugging code prevents new issues
- Implementing multiple recovery options ensures users can always reset their session
- Adding emergency logout buttons in UI components provides accessible recovery options
- Inspecting localStorage and sessionStorage helps identify authentication state issues
- Clearing specific storage items can reset authentication state
- Force page reload can help clear memory state when other methods fail
- Implementing multiple layers of fallback ensures reliability
- Adding global emergency functions provides a last resort for recovery
- Implementing timeout detection for login attempts helps identify when authentication is stuck
- Adding emergency reset buttons that clear storage helps users recover from stuck states
- Providing debug options in the login UI helps developers troubleshoot authentication issues
- Wrapping authentication methods with proper error handling prevents unhandled rejections
- Tracking authentication errors in the AuthContext allows for better error reporting and recovery
- Using setTimeout to detect potentially stuck operations provides a way to offer recovery options

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
- FaunaDB uses a document-based model which differs from Supabase's relational model
- Migration requires mapping between these different data models

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
- Consistent error handling patterns improve maintainability
- Structured API responses make frontend integration easier

## Bulk Operations

- Bulk operations (like deleting all movies or sessions) are implemented using a two-phase approach:
  1. First attempt a bulk delete operation using FaunaDB's `forEach` method
  2. If that fails, fall back to deleting items one by one
- This approach ensures that bulk operations are as efficient as possible while still being reliable
- Bulk operations return detailed results, including success/failure status for each item
- Centralizing bulk operation logic in the FaunaDB library simplifies the Netlify functions that expose these operations
- Bulk operations are exposed through dedicated API endpoints (`delete-all-movies`, `delete-all-sessions`)
- The frontend API provides dedicated functions for bulk operations, making them easy to use from the frontend
- Batch operations can improve performance for multiple related changes

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
- Breaking down large components improves maintainability and readability
- Extracting reusable logic into custom hooks enhances code reuse
- Simplifying user interfaces to focus on essential information improves user experience

## Recent Learnings

- Supabase provides a more integrated solution for both database and authentication compared to FaunaDB
- Row-Level Security (RLS) policies in Supabase provide a powerful way to control data access at the database level
- The AuthContext pattern provides a clean way to manage authentication state throughout a React application
- Protected routes can be implemented using component composition in React Router
- User roles can be managed through custom user metadata in Supabase
- The useAuth hook simplifies access to authentication state and methods throughout the application
- Form validation with visual feedback improves the user experience in authentication forms
- Loading states with spinners provide better feedback during asynchronous operations
- Error handling with clear error messages helps users understand what went wrong
- Success messages provide confirmation that operations completed successfully
- The Profile page provides a central place for users to manage their account settings
- The host mode toggle provides a simple way to switch between user roles
- CSS styles for authentication pages create a consistent and professional look
- Responsive design ensures a good experience on both desktop and mobile devices
- Supabase's authentication API provides methods for common operations like signUp, signIn, and signOut
- User session state is persisted in local storage by the Supabase client
- The AuthContext provides a centralized way to access authentication state throughout the app
- Protected routes can be implemented using the authentication state from AuthContext
- Host-specific routes can be protected based on the user's host status
- Conditional rendering based on authentication state improves the user experience
- The Navbar provides easy access to authentication-related actions
- CSS styles for authentication pages create a consistent and professional look
- Responsive design ensures a good experience on both desktop and mobile devices
- Handling missing database tables requires graceful error recovery
- Automatic profile creation for new users improves the onboarding experience
- Proper error handling for database operations is essential for robust applications
- Supabase RLS policies provide a powerful way to secure data access
- Requiring username for host mode ensures accountability and identification in collaborative features
- Conditional UI elements can guide users through required steps before enabling certain features
- Explicitly clearing authentication state during logout prevents UI inconsistencies
- Providing multiple logout options improves user experience and helps recover from stuck states
- Comprehensive logging throughout the authentication flow helps identify issues
- Emergency logout functions provide a way to recover from stuck authentication states
- Adding retry functionality for profile fetching improves resilience
- Checking if database tables exist before querying them prevents errors
- Tracking component lifecycle events helps understand when authentication state changes
- Adding fallback UI for authentication loading states improves user experience
- When extending third-party libraries, preserve all original functionality to prevent unexpected issues
- Method-by-method extension is safer than replacing entire objects when adding debugging
- The onAuthStateChange listener is critical for proper authentication state management
- Examining error stack traces helps pinpoint the exact location of issues
- Preserving original functionality when adding debugging code prevents new issues
- Overriding individual methods is safer than replacing entire objects
- Adding new methods with different names instead of overriding existing ones is the safest approach
- Implementing global emergency functions provides a last resort for recovery
- Providing multiple ways to recover from authentication issues improves user experience
- Supabase stores authentication state in localStorage with keys prefixed with 'sb-'
- Clearing localStorage and sessionStorage can force authentication state reset
- Multiple fallback strategies for logout ensure users can always sign out
- Force page reload can help recover from stuck authentication states
- Using window.location.href for navigation during logout is more reliable than React Router's navigate
- Unhandled Promise rejections in authentication methods can cause the login process to get stuck
- Wrapping authentication methods with proper error handling prevents unhandled rejections
- Implementing timeout detection for login attempts helps identify and recover from stuck states
- Providing emergency reset options in the login UI improves user experience during authentication issues
- Tracking authentication errors in the AuthContext allows for better error reporting and recovery
- Proper cleanup of auth state change listeners prevents memory leaks and unexpected behavior
- Using setTimeout to detect potentially stuck operations provides a way to offer recovery options
