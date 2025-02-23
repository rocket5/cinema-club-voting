import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddMovie from './pages/AddMovie';
import MovieDetail from './pages/MovieDetail';
import ProtectedHostRoute from './routes/ProtectedHostRoute';
import { AppModeProvider } from './context/AppModeContext';
import './App.css';

function App() {
  return (
    <AppModeProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/add" 
                element={
                  <ProtectedHostRoute>
                    <AddMovie />
                  </ProtectedHostRoute>
                } 
              />
              <Route path="/movie/:id" element={<MovieDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppModeProvider>
  );
}

export default App;
