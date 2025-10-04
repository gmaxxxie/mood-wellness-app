import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import Solutions from './pages/Solutions';
import History from './pages/History';
import Profile from './pages/Profile';

function App() {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, pt: 2 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/results" element={<Results />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;