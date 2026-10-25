import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRightLeft, PlusCircle, Shield, User } from 'lucide-react';

export default function Header({ title, subtitle, onQuickReport, onSwitchRole }) {
  const { role, isAdmin, isStudent, switchRole } = useAuth();

  const handleToggleRole = () => {
    const target = isAdmin ? 'student' : 'admin';
    if (onSwitchRole) {
      onSwitchRole(target);
    } else {
      switchRole(target);
    }
  };

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-30">
      {/* Official Top Clean Status bar */}
      <div className="bg-black text-white text-[11px] font-mono px-4 sm:px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#86efac] animate-pulse"></span>
          <span className="font-bold">
            SchoolRoute TN • Government School Transport Decision Support
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-slate-400 hidden sm:inline">Active Portal:</span>
          <span className="font-bold px-2 py-0.5 rounded bg-white text-black">
            {isAdmin ? 'ADMIN DESK' : 'STUDENT INTAKE'}
          </span>
        </div>
      </div>

      {/* Main Top Header Bar */}
      <div className="px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="font-mono text-xs text-slate-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right side role switcher and quick actions */}
        <div className="flex items-center gap-3">
          {/* Active User Badge & Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 border-2 border-black rounded shadow-neo-sm">
            <div className="px-2 py-0.5 text-xs font-mono font-bold flex items-center gap-1.5 text-slate-900">
              {isAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-blue-700" />
                  <span>Admin Session</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Student Session</span>
                </>
              )}
            </div>

            <button
              onClick={handleToggleRole}
              title={isAdmin ? 'Switch to Student Portal' : 'Switch to Admin Portal'}
              className="neo-btn font-mono text-xs font-bold px-2.5 py-1 bg-black text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3 h-3 text-[#86efac]" />
              <span>{isAdmin ? 'Switch to Student' : 'Switch to Admin'}</span>
            </button>
          </div>

          {onQuickReport && isStudent && (
            <button
              onClick={onQuickReport}
              className="neo-btn font-mono text-xs font-bold px-3 py-1.5 bg-[#86efac] text-slate-950 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
