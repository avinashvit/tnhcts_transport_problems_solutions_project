import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Lightbulb,
  Menu,
  X,
  RotateCcw,
  Shield,
  User,
  ArrowRightLeft,
  Search,
  Bus,
} from 'lucide-react';
import { useIssues } from '../context/IssuesContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const { issues, resetToDefaults } = useIssues();
  const { role, isAdmin, isStudent, switchRole } = useAuth();

  const unresolvedCount = issues.filter((i) => i.status !== 'Resolved').length;

  // Student navigation items (Strictly working features)
  const studentNavItems = [
    {
      id: 'report',
      label: 'Report a Problem',
      icon: PlusCircle,
      description: 'Submit school commute barrier',
    },
    {
      id: 'track',
      label: 'Track Reported Issues',
      icon: Search,
      description: 'Check status & department actions',
    },
  ];

  // Admin navigation items (Strictly working features)
  const adminNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Metrics, GIS map & urgent issues',
    },
    {
      id: 'issues',
      label: 'Transport Issues',
      icon: ClipboardList,
      badge: unresolvedCount > 0 ? unresolvedCount : null,
      description: 'Review table & update status',
    },
    {
      id: 'recommendations',
      label: 'Recommended Solutions',
      icon: Lightbulb,
      description: 'Rule-based administrative actions',
    },
  ];

  const currentNavItems = isAdmin ? adminNavItems : studentNavItems;

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const handleReset = () => {
    resetToDefaults();
    setResetConfirm(true);
    setTimeout(() => setResetConfirm(false), 2000);
  };

  const handleToggleRole = () => {
    const target = isAdmin ? 'student' : 'admin';
    switchRole(target);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden bg-white border-b-2 border-black px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold text-xs">
            {'{ }'}
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 text-sm tracking-tight block">
              SchoolRoute TN
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {isAdmin ? 'ADMIN PORTAL' : 'STUDENT PORTAL'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleRole}
            className="neo-btn font-mono text-xs font-bold px-2 py-1 bg-white"
          >
            {isAdmin ? '➔ Student' : '➔ Admin'}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 border border-black rounded bg-white text-slate-900"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop fixed left, Mobile slide-in) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r-2 border-black flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b-2 border-black bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-black text-white rounded flex items-center justify-center font-mono font-bold text-sm shadow-neo-sm">
              {'{ }'}
            </div>
            <div>
              <span className="font-mono font-bold text-slate-900 text-sm block leading-none">
                SchoolRoute TN
              </span>
              <span className="font-mono text-[10px] text-slate-500 block mt-1">
                Tamil Nadu School Transit
              </span>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-black/10 flex items-center justify-between font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Role:</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border border-black ${
                isAdmin ? 'bg-black text-white' : 'bg-[#86efac] text-black'
              }`}
            >
              {isAdmin ? 'ADMIN' : 'STUDENT'}
            </span>
          </div>
        </div>

        {/* Navigation Items for Current Role */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto font-mono">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? '// OFFICIAL ADMIN MENU' : '// STUDENT INTAKE MENU'}
          </div>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono transition-all text-left border ${
                  isActive
                    ? 'bg-black text-white font-bold border-black shadow-neo-sm translate-x-1'
                    : 'bg-white text-slate-800 border-transparent hover:border-black hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-[#86efac]' : 'text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                      isActive
                        ? 'bg-[#86efac] text-black border-black'
                        : 'bg-red-500 text-white border-black'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Switching & Data Controls Footer */}
        <div className="p-4 border-t-2 border-black bg-slate-50 space-y-2.5 font-mono">
          {/* One-Click Quick Role Switcher */}
          <button
            onClick={handleToggleRole}
            className="w-full neo-btn py-2 px-3 bg-black text-white text-xs font-bold flex items-center justify-between hover:bg-slate-900"
          >
            <span className="flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#86efac]" />
              <span>{isAdmin ? 'Switch to Student' : 'Switch to Admin'}</span>
            </span>
            <span className="text-[10px] text-slate-400">➔</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleReset}
            className="w-full text-left flex items-center justify-between px-2.5 py-1.5 border border-black bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-neo-sm"
            title="Reset to default Tamil Nadu sample records"
          >
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3 text-slate-600" />
              <span>{resetConfirm ? 'Reset Complete!' : 'Reset Demo Data'}</span>
            </span>
            <span className="text-[10px] text-slate-400">[↺]</span>
          </button>
        </div>
      </aside>
    </>
  );
}
