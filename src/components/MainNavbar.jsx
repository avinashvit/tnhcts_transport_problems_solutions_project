import React, { useState } from 'react';
import { useLiveDatabase } from '../context/LiveDatabaseContext';
import {
  Bus,
  Clock,
  QrCode,
  AlertTriangle,
  Menu,
  X,
  Smartphone,
  Shield,
  LogOut,
  Radio,
  Sliders,
  CheckCircle2,
  Navigation,
  MapPin,
} from 'lucide-react';

export default function MainNavbar({ activeTab, setActiveTab }) {
  const { currentUser, role, logout, lastSyncTime, liveClockTime } = useLiveDatabase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation tabs based on active role
  const getNavItems = () => {
    if (role === 'driver') {
      return [
        { id: 'driver_console', label: 'Driver Cabin Console', icon: Bus, badge: 'ACTIVE' },
        { id: 'map', label: 'Route GPS Map', icon: Navigation, badge: 'LIVE' },
        { id: 'timetable', label: 'Route Timetable', icon: Clock },
      ];
    }
    if (role === 'admin') {
      return [
        { id: 'admin_console', label: 'Fleet Command Desk', icon: Shield, badge: 'FLEET' },
        { id: 'map', label: 'Statewide Fleet Map', icon: Navigation, badge: 'RADAR' },
        { id: 'timetable', label: 'Bus Timetable', icon: Clock },
        { id: 'tracker', label: 'Parent GPS View', icon: Smartphone },
      ];
    }
    // Student & Parent Mobile
    return [
      { id: 'tracker', label: 'Live Bus Tracking', icon: Bus, badge: 'LIVE GPS' },
      { id: 'map', label: 'Interactive GPS Map', icon: Navigation, badge: 'MAP' },
      { id: 'timetable', label: 'Bus Timetable', icon: Clock },
      { id: 'pass', label: 'Digital Bus Pass', icon: QrCode },
      { id: 'report', label: 'Report a Problem', icon: AlertTriangle },
    ];
  };

  const navItems = getNavItems();

  const handleSelect = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleLabel = () => {
    if (role === 'driver') return `Driver: ${currentUser?.name || 'Driver 1'} (${currentUser?.busId || 'Bus 14A'})`;
    if (role === 'admin') return 'Admin: District Transport Officer (Central)';
    return `Student: ${currentUser?.name || 'Student 1'} (${currentUser?.routeNumber ? currentUser.routeNumber.split(' ')[0] : 'Bus 14A'})`;
  };

  const getRoleBadgeColor = () => {
    if (role === 'driver') return 'bg-blue-600 text-white';
    if (role === 'admin') return 'bg-black text-white';
    return 'bg-[#86efac] text-slate-950';
  };

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-40 font-mono">
      {/* Official Top Status Ribbon */}
      <div className="bg-black text-white text-[11px] px-4 sm:px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="font-bold">
            SchoolRoute TN • Synchronized State Database Active
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#86efac] font-bold">🕒 {liveClockTime}</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">Sync: {lastSyncTime}</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-300 font-bold hidden sm:inline">Cross-Tab Realtime Broadcast</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => handleSelect(navItems[0].id)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-black text-[#86efac] rounded-lg border-2 border-black flex items-center justify-center font-bold text-base shadow-neo-sm group-hover:-translate-y-0.5 transition-transform">
            🚌
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-slate-900 leading-none block">
              SCHOOLROUTE.TN
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Tamil Nadu School Bus Live Gateway
            </span>
          </div>
        </div>

        {/* Center: Navigation Links for Current Role */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-2 border-black ${
                  isActive
                    ? 'bg-black text-white shadow-neo-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#86efac]' : 'text-slate-600'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-[#10b981] text-white' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side: Active User Session & Logout */}
        <div className="flex items-center gap-2">
          {/* Active User Badge & Sign Out Button */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1 border-2 border-black rounded-lg text-xs shadow-neo-sm">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded border border-black ${getRoleBadgeColor()}`}>
              {getRoleLabel()}
            </span>

            {/* Official Logout button */}
            <button
              onClick={logout}
              title="Sign Out to Role Authentication Screen"
              className="neo-btn text-[10px] font-bold px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 border border-black rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3 text-red-600" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-black rounded bg-white shadow-neo-sm"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t-2 border-black p-4 space-y-3 shadow-neo">
          <div className="p-2.5 bg-slate-50 border border-black rounded flex items-center justify-between text-xs">
            <span className="font-bold">{getRoleLabel()}</span>
            <button
              onClick={logout}
              className="text-xs text-red-600 font-bold underline"
            >
              Logout
            </button>
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full p-2.5 rounded text-xs font-bold text-left flex items-center justify-between border-2 border-black ${
                    isActive ? 'bg-black text-white shadow-neo-sm' : 'bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
