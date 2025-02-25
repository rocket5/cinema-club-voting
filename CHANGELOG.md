# Changelog

All notable changes to the Cinema Club Voting project will be documented in this file.

## [Unreleased]

### Added
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

### Changed
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

### Fixed
- Fixed date formatting issue in SessionsList component that was causing "Invalid time value" error
- Added more robust date handling in get-sessions serverless function
- Added fallback values for missing status fields
- Fixed HTTP 500 error in get-sessions serverless function by improving error handling
- Improved handling of different FaunaDB response structures
- Fixed JSON parsing of API responses with better error reporting
- Fixed handling of date objects from FaunaDB with proper property extraction
- Improved date formatting to handle both string and object date formats
- Added parsing of nested isoString property in JSON date strings
- Fixed handling of FaunaDB Time objects with @ts property 
- Fixed issue where movies were not displayed when clicking on a session in Vote mode
- Fixed issue where "Add New Movie" button was shown in Vote mode
- Fixed issue with bulk delete operations not properly deleting documents in FaunaDB
- Implemented multi-approach deletion strategy to handle different FaunaDB document formats 