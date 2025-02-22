import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddMovie from './pages/AddMovie';
import MovieDetail from './pages/MovieDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddMovie />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
