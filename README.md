# Cinema Club Voting

A web application for cinema clubs to organize movie voting sessions, where members can suggest movies and vote on which ones to watch.

## Features

### Session Management
- Create new voting sessions
- View active sessions
- Track session status (active, completed)

### Movie Management
- Add movies to voting sessions
- Include movie details (title, description)
- Track who suggested each movie

### User Experience
- Host mode for session administrators
- Regular mode for participants
- Responsive design for mobile and desktop

### Backend
- Serverless architecture using Netlify Functions
- FaunaDB database for data persistence
- Secure API endpoints for data operations

## Technologies Used

- React 19
- React Router 7
- FaunaDB for database
- Netlify for hosting and serverless functions
- Bootstrap for UI styling

## Data Model

### Session
- Tracks voting sessions with start/end dates
- Identifies the host
- Stores session status
- References the winning movie when voting completes

### Movie
- Links to a specific session
- Stores movie details (title, description, image)
- Tracks who added the movie and when
- Tracks votes

### Vote
- Links a user's vote to a session and movie
- Stores the ranking information
- Timestamps when votes are cast

### Data Persistence
- All data stored in Fauna database
- Movies persist between page refreshes
- Session data remains intact across browser sessions

## Technical Stack

- **Frontend**: React.js
- **Backend**: Netlify Functions (Serverless)
- **Database**: Fauna
- **Hosting**: Netlify
- **Routing**: React Router
- **State Management**: React Context

## Project Structure

cinema-club-voting/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/       # React context for state management
│   ├── pages/         # Main page components
│   ├── routes/        # Route protection and management
│   └── App.js         # Main application component
├── netlify/
│   └── functions/     # Serverless functions for backend
└── public/            # Static assets

## Future Features (Planned)
- Voting functionality
- Movie sorting by votes
- Delete movie capability
- Session status management
- Session sharing functionality

## Getting Started

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/cinema-club-voting.git
cd cinema-club-voting
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with:
```
FAUNA_SECRET_KEY=your_fauna_db_key
```

4. Run the development server
```bash
npm run dev
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run dev`

Runs the app with Netlify dev server, including serverless functions.

## Deployment

This project is configured for deployment on Netlify with serverless functions.

## License

See the [LICENSE](LICENSE) file for details.
