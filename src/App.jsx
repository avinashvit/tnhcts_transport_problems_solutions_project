import React, { useState, useEffect } from 'react';
import { LiveDatabaseProvider, useLiveDatabase } from './context/LiveDatabaseContext';
import RoleLoginPage from './pages/RoleLoginPage';
import MainNavbar from './components/MainNavbar';
import ParentLiveTracker from './components/ParentLiveTracker';
import DriverConsole from './components/DriverConsole';
import AdminConsole from './components/AdminConsole';
import BusTimetable from './components/BusTimetable';
import StudentBusPass from './components/StudentBusPass';
import SimpleReportBus from './components/SimpleReportBus';
import LiveBusMap from './components/LiveBusMap';

function AppContent() {
  const { currentUser, role, latestSmsNotification, setLatestSmsNotification } = useLiveDatabase();

  // Tab state based on active role
  const [activeTab, setActiveTab] = useState('tracker');

  // Automatically switch tab when role changes
  useEffect(() => {
    if (role === 'driver') {
      setActiveTab('driver_console');
    } else if (role === 'admin') {
      setActiveTab('admin_console');
    } else {
      setActiveTab('tracker');
    }
  }, [role]);

  // Auto-dismiss the sliding mobile SMS notification banner after 7 seconds
  useEffect(() => {
    if (latestSmsNotification) {
      const timer = setTimeout(() => {
        setLatestSmsNotification(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [latestSmsNotification, setLatestSmsNotification]);

  // If not logged in, render the 3-Role Login Portal
  if (!currentUser) {
    return <RoleLoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-mono relative">
      {/* Real-time Parent Mobile Phone Push Notification Banner */}
      {latestSmsNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in fade-in slide-in-from-top-6 duration-300">
          <div
            className={`text-white border-2 border-black rounded-2xl p-4 shadow-neo-lg flex items-start justify-between gap-3 font-mono ${
              latestSmsNotification.type === 'irregular_behavior'
                ? 'bg-[#450a0a] border-red-500'
                : 'bg-slate-950 border-black'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold border-2 border-black shadow-neo-sm text-lg ${
                  latestSmsNotification.type === 'irregular_behavior'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#86efac] text-slate-950'
                }`}
              >
                {latestSmsNotification.type === 'irregular_behavior' ? '🚨' : '💬'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      latestSmsNotification.type === 'irregular_behavior'
                        ? 'bg-red-900 text-red-200 border-red-500'
                        : 'bg-black text-[#86efac] border-[#86efac]/40'
                    }`}
                  >
                    {latestSmsNotification.type === 'irregular_behavior'
                      ? 'EMERGENCY SMS • TN-GOVT-EDU'
                      : 'LIVE SMS • TN-GOVT-EDU'}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    To: +91 {latestSmsNotification.phone || currentUser?.phone || '98421 78901'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold ml-auto">
                    {latestSmsNotification.time}
                  </span>
                </div>
                <p className="text-xs text-slate-100 leading-snug">
                  {latestSmsNotification.message}
                </p>
                <div
                  className={`text-[10px] font-bold flex items-center gap-1 pt-0.5 ${
                    latestSmsNotification.type === 'irregular_behavior'
                      ? 'text-red-300'
                      : 'text-emerald-400'
                  }`}
                >
                  <span>✓✓ Cellular SMS Dispatched to Parent Phone via SMSMobileAPI</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setLatestSmsNotification(null)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1 hover:bg-slate-800 rounded cursor-pointer"
              title="Dismiss Notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Header with Role Switcher & Live Database Status */}
      <MainNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Role-Specific Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {/* ============ DRIVER ROLE VIEW ============ */}
        {role === 'driver' && (
          <>
            {activeTab === 'driver_console' && <DriverConsole />}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      DRIVER CABIN • REAL-TIME GPS NAVIGATION RADAR
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                      On-Road Feeder Route Map: {currentUser?.busId || 'BUS-14A'}
                    </h1>
                  </div>
                </div>
                <LiveBusMap selectedBusId={currentUser?.busId || 'BUS-14A'} height="580px" showControls={true} />
              </div>
            )}
            {activeTab === 'timetable' && (
              <BusTimetable onTrackRoute={() => setActiveTab('driver_console')} />
            )}
          </>
        )}

        {/* ============ ADMIN ROLE VIEW ============ */}
        {role === 'admin' && (
          <>
            {activeTab === 'admin_console' && <AdminConsole />}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      TNSTC HEADQUARTERS • STATEWIDE FLEET RADAR
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                      Tamil Nadu School Feeder Fleet Map (All Buses)
                    </h1>
                  </div>
                </div>
                <LiveBusMap selectedBusId="all" height="600px" showControls={true} />
              </div>
            )}
            {activeTab === 'timetable' && (
              <BusTimetable onTrackRoute={() => setActiveTab('tracker')} />
            )}
            {activeTab === 'tracker' && <ParentLiveTracker />}
          </>
        )}

        {/* ============ STUDENT / PARENT MOBILE VIEW ============ */}
        {role === 'student_parent' && (
          <>
            {activeTab === 'tracker' && <ParentLiveTracker />}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      PARENT & STUDENT DESK • LIVE SATELLITE GPS
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                      Interactive Feeder Corridor & School Bus Map
                    </h1>
                  </div>
                </div>
                <LiveBusMap selectedBusId="BUS-14A" height="600px" showControls={true} />
              </div>
            )}
            {activeTab === 'timetable' && (
              <BusTimetable onTrackRoute={() => setActiveTab('tracker')} />
            )}
            {activeTab === 'pass' && <StudentBusPass />}
            {activeTab === 'report' && <SimpleReportBus />}
          </>
        )}
      </main>

      {/* Clean Bottom Footer */}
      <footer className="bg-white border-t-2 border-black py-4 px-6 text-xs text-slate-600 font-mono mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <strong className="text-slate-900">SchoolRoute TN</strong> • Tamil Nadu State Transport Corporation (TNSTC)
            <span className="block text-[11px] text-slate-400 mt-0.5">
              100% Free Travel Scheme for Government School Students (G.O. Ms. No. 42)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold bg-slate-50 px-3 py-1.5 border border-black rounded shadow-neo-sm">
            Active Session: {currentUser.name} ({role?.toUpperCase()})
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LiveDatabaseProvider>
      <AppContent />
    </LiveDatabaseProvider>
  );
}
