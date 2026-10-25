import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChamferBadge,
  NeonStickyNote,
  CodeTag,
  BracketGlyph,
  Starburst,
  ArrowPad,
} from '../components/NeoStickers';
import { Shield, User, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { loginAsStudent, loginAsAdmin } = useAuth();

  const [studentName, setStudentName] = useState('');
  const [adminUsername, setAdminUsername] = useState('tnstc_official');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const handleStudentLogin = (e) => {
    e.preventDefault();
    loginAsStudent(studentName.trim() || 'Government School Representative');
    if (onLoginSuccess) onLoginSuccess('report');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    loginAsAdmin('District Transport Officer');
    if (onLoginSuccess) onLoginSuccess('dashboard');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-mono flex flex-col justify-center items-center">
      {/* Brand Header */}
      <div className="w-full max-w-3xl text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-black text-white rounded flex items-center justify-center font-bold text-base shadow-neo">
            {'{ }'}
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-slate-600">
            SCHOOLROUTE.TN
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight lowercase">
          tamil nadu transit desk
        </h1>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
          // Role-based prototype: student intake & administrative resolution system.
        </p>
      </div>

      {/* Two Portal Cards in Reference Image Aesthetic */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Card 1: Student / Commuter Login (Soft Pink Accent) */}
        <div className="relative bg-white border-2 border-black rounded-[2rem] p-6 sm:p-8 shadow-neo flex flex-col justify-between overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BracketGlyph size={20} />
              <ChamferBadge text="/ student" />
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                [ CITIZEN & COMMUTER ]
              </span>
              <h2 className="text-2xl font-bold text-slate-900 lowercase mt-1">
                student portal
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Report transit deficits, bus timing mismatches, and track resolution.
              </p>
            </div>

            {/* Neon Note in Card */}
            <div className="py-2">
              <NeonStickyNote
                title="privacy"
                lines={['no personal phone numbers', 'quick intake form']}
                rotate="-rotate-1"
                className="text-[11px]"
              />
            </div>
          </div>

          <form onSubmit={handleStudentLogin} className="mt-6 space-y-4 pt-4 border-t-2 border-black/10">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Village / School (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Morappur GHSS Student"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full neo-btn py-2.5 px-4 bg-[#86efac] text-slate-950 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#6ee7b7]"
            >
              <span>[ Enter as Student Commuter ➔ ]</span>
            </button>
          </form>
        </div>

        {/* Card 2: Official / Admin Login (Periwinkle Blue Accent) */}
        <div className="relative bg-white border-2 border-black rounded-[2rem] p-6 sm:p-8 shadow-neo flex flex-col justify-between overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BracketGlyph size={20} />
              <ChamferBadge text="/ official" />
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                [ TNSTC & EDUCATION DEPT ]
              </span>
              <h2 className="text-2xl font-bold text-slate-900 lowercase mt-1">
                official admin
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Review grievances register, inspect GIS route map, and verify solutions.
              </p>
            </div>

            <div className="p-3 bg-slate-100 border border-black rounded text-[11px] text-slate-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                Administrative Access:
              </div>
              <p className="text-[10px] text-slate-500">
                1-click instant login enabled for evaluators.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4 pt-4 border-t-2 border-black/10">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Officer ID
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full text-xs p-2 border-2 border-black rounded bg-slate-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Passcode
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full text-xs p-2 border-2 border-black rounded bg-slate-50 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full neo-btn py-2.5 px-4 bg-black text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-900"
            >
              <span>[ Login as Official Admin ➔ ]</span>
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 text-center font-mono text-[11px] text-slate-500">
        // Demonstration Prototype • Tamil Nadu State Transport Decision Support
      </div>
    </div>
  );
}
