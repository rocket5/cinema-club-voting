import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddMovie from './pages/AddMovie';
import MovieDetail from './pages/MovieDetail';
import Session from './pages/Session';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import ProtectedHostRoute from './routes/ProtectedHostRoute';
import { AppModeProvider } from './context/AppModeContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppModeProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/session/:sessionId" 
                  element={
                    <ProtectedRoute>
                      <Session />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/session/:sessionId/add" 
                  element={
                    <ProtectedRoute>
                      <AddMovie />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/session/:sessionId/edit/:movieId" 
                  element={
                    <ProtectedRoute>
                      <AddMovie />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/add" 
                  element={
                    <ProtectedHostRoute>
                      <AddMovie />
                    </ProtectedHostRoute>
                  } 
                />
                <Route 
                  path="/movie/:id" 
                  element={
                    <ProtectedRoute>
                      <MovieDetail />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AppModeProvider>
    </AuthProvider>
  );
}

export default App;
