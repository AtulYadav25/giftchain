// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css'

//Import Layouts
import Navbar from '@/components/layout/Navbar';
// import { Footer } from './components/Footer';
// import { Home } from './pages/Home';
// import { Home } from './pages/Home';
import Home from './pages/Home';
import Profile from './pages/Profile';
import HallOfGivers from './pages/HallOfGivers';
import { useInitApp } from './hooks/useInitApp';

const App = () => {
  //Initialize App with User Creds - Checks Session
  // useInitApp();


  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#f9fbff] text-[#1a2a3a] selection:bg-blue-300/40">

        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/profile" element={<Profile />} /> */}
            {/* <Route path="/hall-of-givers" element={<HallOfGivers />} /> */}
          </Routes>
        </main>
        {/* <Footer /> */}

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #e3f2ff",
              color: "#274472",
              fontSize: "15px",
              borderRadius: "14px",
              padding: "12px 16px",
              boxShadow: "0 4px 12px rgba(180, 210, 255, 0.35)",
              fontFamily: "Concert One, sans-serif",
            },
            success: {
              iconTheme: {
                primary: "#4da3ff",     // soft blue for success icon
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ff6b6b",     // soft red, not aggressive
                secondary: "#ffffff",
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;
