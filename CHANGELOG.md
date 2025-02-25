# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Created FaunaDB library functions for database operations
  - Added client module for FaunaDB connection
  - Added movies module with CRUD operations for movie data
  - Added sessions module with CRUD operations for session data
  - Added votes module with CRUD operations for vote data
- Added comprehensive unit tests for all FaunaDB library functions
  - Created test suite for movies module
  - Created test suite for sessions module
  - Created test suite for votes module
- Added required session name input field when creating a new session
- Added modal dialog for session creation with validation
- Added session name display in session list and session page
- Show list of previous sessions in Vote mode
- Mode-specific UI on Home page (Create Session in Host mode, Session List in Vote mode)
- Sessions list component with nice formatting
- Serverless function to fetch all sessions from database
- CSS styling for session cards
- Added retry button for session loading errors
- Added better error handling and user feedback
- Added movie ranking functionality in Vote mode
- Added debug panel with bulk delete functions for movies and sessions (Host mode only)
- Added ability for hosts to see and manage all existing sessions
- Added visual indicator for manageable sessions in Host mode
- Enhanced MovieCard to display additional OMDB information (poster, year, director, genre, IMDB rating)
- Added search results count display
- Added movie editing functionality with update-movie serverless function
- Added view, edit, and delete buttons with icons in host mode
- Added get-movie serverless function to fetch individual movie details
- Added retry functionality for movie detail loading errors
- Added delete-movie serverless function with multiple fallback strategies for reliable movie deletion
- Added comprehensive logging for delete operations to facilitate debugging

### Changed
- Updated session lists to sort by date with newest sessions appearing first
- Updated session creation process to require a session name
- Updated session cards to display session name instead of ID
- Updated session page to display session name in the header
- Home page now conditionally renders based on current app mode
- Session cards display session ID and creation time
- Improved resilience in API response handling
- Enhanced debug logging for troubleshooting
- Session page now uses MovieList component for better display of movies
- Improved Session page UI with proper Bootstrap styling
- Enhanced bulk deletion operations with better error handling and debugging
- Completely redesigned FaunaDB deletion approach with multiple fallback methods
- Modified Home page to fetch and display sessions in both Host and Vote modes
- Updated SessionsList component to support both Host and Vote mode interfaces
- Restricted "Create New Session" button to only be visible in Host mode
- Removed "Add Movie" button from navigation bar completely
- Updated get-session-movies serverless function to include OMDB fields in the response
- Improved MovieList component to ensure consistent movie data structure
- Improved movie card styling with better typography and visual hierarchy
- Simplified movie search to focus on title search only
- Replaced text buttons with icon buttons for better UI in movie cards
- Updated AddMovie component to support both adding and editing movies
- Improved MovieDetail component with better error handling and data display
- Enhanced movie detail view with proper fallbacks for missing data

### Fixed
- Fixed missing session names in get-sessions API response
- Fixed date formatting issue in SessionsList component that was causing "Invalid time value" error
- Added more robust date handling in get-sessions serverless function
- Added fallback values for missing status fields
- Fixed HTTP 500 error in get-sessions serverless function by improving error handling
- Improved handling of different FaunaDB response structures
- Fixed JSON parsing of API responses with better error reporting
- Fixed handling of date objects from FaunaDB with proper property extraction
- Fixed date formatting to handle both string and object date formats
- Added parsing of nested isoString property in JSON date strings
- Fixed handling of FaunaDB Time objects with @ts property 
- Fixed issue where movies were not displayed when clicking on a session in Vote mode
- Fixed issue where "Add New Movie" button was shown in Vote mode
- Fixed issue with bulk delete operations not properly deleting documents in FaunaDB
- Implemented multi-approach deletion strategy to handle different FaunaDB document formats
- Fixed non-functional edit and delete buttons in host mode
- Fixed movie detail view not working due to missing get-movie serverless function
- Fixed error handling in MovieDetail component to show meaningful error messages
- Fixed update-movie serverless function to properly handle movie updates with improved error handling and multiple ID format support
- Fixed 500 Internal Server Error in update-movie function by completely rewriting the update logic with proper FaunaDB document structure and multiple fallback strategies
- Fixed 500 Internal Server Error when deleting movies by creating a dedicated delete-movie function with multiple fallback strategies
- Fixed movie deletion by implementing multiple deletion approaches to handle various FaunaDB document formats and ID types
- Fixed inconsistencies between FaunaDB client versions by standardizing on the newer client for delete operations
- Fixed inconsistent collection names in FaunaDB queries
- Added null-check operator to delete operations to prevent errors when documents don't exist
- Fixed 'fetchMovies is not defined' error in Session.js by moving the function outside of useEffect scope

### Removed
- Removed advanced search functionality (director/actor search) due to OMDB API limitations
- Removed search status indicators and spinner
- Removed search tips section 
- Removed unnecessary VoteButton from movie detail view 