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
import PublicProfile from './pages/PublicProfile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import { useInitApp } from './hooks/useInitApp';
import UsernameSetupModal from './components/UsernameSetupModal';
import { useAuthActions, useGiftActions, useUser } from './store';
import { useEffect, useRef } from 'react';
import { useChain } from './multichainkit/context/ChainContext';

//MultiChain Kit Imports


const App = () => {
  //Initialize App with User Creds - Checks Session
  useInitApp();

  const { getGlobalGiftStats } = useGiftActions();
  const { chain, address, disconnectWallet } = useChain();
  // const { disconnectWallet: disconnectAuth } = useAuthActions();

  const user = useUser();

  useEffect(() => {
    getGlobalGiftStats();
  }, []);



  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && address !== null) {
      isFirstRender.current = false;
      return;
    }

    const handleDisconnect = async () => {
      await disconnectWallet();
    }

    if (!isFirstRender.current) {
      handleDisconnect();
      isFirstRender.current = true;
    }

  }, [address]);


  return (

    <Router>
      <div className="flex flex-col min-h-screen bg-[#f9fbff] text-[#1a2a3a] selection:bg-blue-300/40">
        <UsernameSetupModal isOpen={!!user && user.username.includes("gc@")} />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/hall-of-givers" element={<HallOfGivers />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/:username" element={<PublicProfile />} />
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
