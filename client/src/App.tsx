import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css'

//Import Layouts
import Navbar from '@/components/layout/Navbar';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import HallOfGivers from './pages/HallOfGivers';
import DashboardHome from './pages/dashboard/Home';
import DashboardGifts from './pages/dashboard/Gifts';
import DashboardGoals from './pages/dashboard/Goals';
import DashboardSettings from './pages/dashboard/Settings';
import PublicProfile from './pages/PublicProfile';

import { useInitApp } from './hooks/useInitApp';


const App = () => {
  //Initialize App with User Creds - Checks Session
  useInitApp();

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#f9fbff] text-[#1a2a3a] selection:bg-blue-300/40">

        <Routes>
          {/* Public Pages with Navbar - Use a wrapper Route */}
          <Route element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Outlet />
              </main>
            </>
          }>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/hall-of-givers" element={<HallOfGivers />} />

            {/* Note: PublicProfile (/:username) should be last to avoid catching other paths */}
            <Route path="/:username" element={<PublicProfile />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<DashboardHome />} />
            <Route path="gifts" element={<DashboardGifts />} />
            <Route path="goals" element={<DashboardGoals />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>

        </Routes>

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
