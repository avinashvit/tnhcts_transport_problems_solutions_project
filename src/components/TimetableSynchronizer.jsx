import React, { useState, useMemo } from 'react';
import {
  Clock,
  Bus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Sliders,
  FileText,
} from 'lucide-react';
import { useIssues } from '../context/IssuesContext';

export default function TimetableSynchronizer({ onGeneratePetition }) {
  const { issues } = useIssues();

  // Pick default issue for simulation
  const [selectedIssueId, setSelectedIssueId] = useState(
    () => issues[0]?.id || 'TN-2026-001'
  );

  const currentIssue = useMemo(() => {
    return issues.find((i) => i.id === selectedIssueId) || issues[0];
  }, [issues, selectedIssueId]);

  // Timings in minutes from midnight (for easy arithmetic)
  // 08:50 AM = 8*60 + 50 = 530
  // 09:15 AM = 9*60 + 15 = 555
  // 04:20 PM = 16*60 + 20 = 980
  // 04:10 PM = 16*60 + 10 = 970
  const [morningAssemblyTime, setMorningAssemblyTime] = useState('08:50');
  const [eveningDismissalTime, setEveningDismissalTime] = useState('16:20');
  const [currentMorningBusArrival, setCurrentMorningBusArrival] = useState('09:18');
  const [currentEveningBusDeparture, setCurrentEveningBusDeparture] = useState('04:10');

  // Sliders for recommended shifts (in minutes)
  const [morningShift, setMorningShift] = useState(28); // advance depot trip by 28 mins
  const [eveningShift, setEveningShift] = useState(25); // delay depot trip by 25 mins

  const [copiedSchedule, setCopiedSchedule] = useState(false);

  // Helper to convert 'HH:MM' string to total minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper to convert total minutes to 12-hour format string 'hh:mm AM/PM'
  const minutesToTime12 = (totalMinutes) => {
    let m = Math.max(0, Math.min(1439, totalMinutes));
    const hours24 = Math.floor(m / 60);
    const mins = m % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  // Arithmetic calculations
  const assemblyMins = timeToMinutes(morningAssemblyTime);
  const dismissalMins = timeToMinutes(eveningDismissalTime);

  const currentArrivalMins = timeToMinutes(currentMorningBusArrival);
  // Current evening is 16:10 = 970
  const currentDepartureMins = timeToMinutes(currentEveningBusDeparture);

  // Morning Mismatch
  // If arrival > assembly => late!
  const morningMismatch = currentArrivalMins - assemblyMins;
  const isMorningLate = morningMismatch > 0;

  // Evening Mismatch
  // If departure < dismissal => bus leaves BEFORE students are dismissed!
  const eveningMismatch = dismissalMins - currentDepartureMins;
  const isEveningEarly = eveningMismatch > 0;

  // Optimized Arrival & Departure with shifts
  const optimizedArrivalMins = currentArrivalMins - morningShift;
  const optimizedDepartureMins = currentDepartureMins + eveningShift;

  const optimizedMorningBuffer = assemblyMins - optimizedArrivalMins; // minutes before prayer
  const optimizedEveningBuffer = optimizedDepartureMins - dismissalMins; // minutes after dismissal

  // Estimated lost hours per student per month
  const dailyLostMinutes = Math.max(0, morningMismatch);
  const monthlyLostHoursPerStudent = ((dailyLostMinutes * 22) / 60).toFixed(1);

  const handleReset = () => {
    setMorningAssemblyTime('08:50');
    setEveningDismissalTime('16:20');
    setCurrentMorningBusArrival('09:18');
    setCurrentEveningBusDeparture('04:10');
    setMorningShift(28);
    setEveningShift(25);
  };

  const handleCopyNotice = () => {
    const text = `TNSTC DEPOT SCHEDULE ADJUSTMENT REQUISITION
CORRIDOR: ${currentIssue?.village} ➔ ${currentIssue?.schoolName} (${currentIssue?.district} District)
AFFECTED STUDENTS: ${currentIssue?.affectedStudents} Commuters

1. MORNING BUS SERVICE TRIP ADJUSTMENT:
   • Current School Stop Arrival: ${minutesToTime12(currentArrivalMins)}
   • School Morning Prayer Bell: ${minutesToTime12(assemblyMins)}
   • Current Deficit: Late by ${morningMismatch} minutes (Students miss Prayer & Period 1 daily)
   • PROPOSED DEPOT SHIFT: Advance departure by -${morningShift} minutes
   • NEW OPTIMIZED ARRIVAL: ${minutesToTime12(optimizedArrivalMins)} (${optimizedMorningBuffer} mins before prayer bell)

2. EVENING BUS SERVICE TRIP ADJUSTMENT:
   • School Evening Dismissal Bell: ${minutesToTime12(dismissalMins)}
   • Current Bus Stop Departure: ${minutesToTime12(currentDepartureMins)} (Leaves ${eveningMismatch} mins before school ends!)
   • PROPOSED DEPOT SHIFT: Retard departure by +${eveningShift} minutes
   • NEW OPTIMIZED DEPARTURE: ${minutesToTime12(optimizedDepartureMins)} (${optimizedEveningBuffer} mins safe walking & boarding buffer)

PROJECTED IMPACT:
   • 100% Punctual Attendance recovered for ${currentIssue?.affectedStudents} students.
   • ${monthlyLostHoursPerStudent} instructional hours saved per student every month.
   • Eliminates evening darkness walking hazards for girl students.
`;
    navigator.clipboard.writeText(text);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2200);
  };

  return (
    <div className="bg-white border-2 border-black rounded-2xl shadow-neo p-5 sm:p-7 space-y-6 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b-2 border-black gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-black text-[#86efac] flex items-center justify-center font-bold text-sm shadow-neo-sm">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              FEATURE #1 • TNSTC & SCHOOL EDUCATION INITIATIVE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 lowercase tracking-tight">
            school bell & tnstc bus synchronizer
          </h2>
          <p className="text-xs text-slate-600">
            Simulate and eliminate the mismatch between school prayer bells and rural state bus schedules.
          </p>
        </div>

        {/* Corridor Quick Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border-2 border-black p-1.5 rounded flex-shrink-0">
          <Bus className="w-4 h-4 text-slate-700 ml-1" />
          <select
            value={selectedIssueId}
            onChange={(e) => setSelectedIssueId(e.target.value)}
            className="text-xs bg-white border border-black rounded px-2 py-1 outline-none font-bold"
          >
            {issues.map((i) => (
              <option key={i.id} value={i.id}>
                #{i.id}: {i.village} ({i.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Corridor Banner */}
      <div className="p-3.5 bg-slate-100 border border-black rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-slate-500 text-[10px] block uppercase font-bold">Active Simulation Route:</span>
          <span className="font-bold text-slate-900 text-sm">
            {currentIssue?.village} ➔ {currentIssue?.schoolName} ({currentIssue?.district} District)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-black text-white text-[11px] font-bold">
            {currentIssue?.affectedStudents} Commuters
          </span>
          <button
            onClick={handleReset}
            className="text-[11px] font-bold text-slate-600 hover:text-black flex items-center gap-1 border border-black px-2 py-0.5 rounded bg-white hover:bg-slate-200"
            title="Reset to default benchmark times"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Times</span>
          </button>
        </div>
      </div>

      {/* Grid: Current Inputs vs Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Timing Inputs */}
        <div className="space-y-4 p-5 bg-slate-50 border-2 border-black rounded-xl">
          <div className="flex items-center justify-between border-b border-black/15 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-700" />
              <span>Input Benchmark Timings</span>
            </span>
            <span className="text-[10px] text-slate-400">24h format</span>
          </div>

          {/* Morning Row */}
          <div className="space-y-3 bg-white p-3.5 border border-black rounded-lg">
            <div className="text-[11px] font-bold text-slate-800 uppercase flex items-center justify-between">
              <span>🌅 Morning Session:</span>
              <span className="text-[10px] text-slate-500">Prayer Bell vs Bus Arrival</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">
                  School Prayer Bell:
                </label>
                <input
                  type="time"
                  value={morningAssemblyTime}
                  onChange={(e) => setMorningAssemblyTime(e.target.value)}
                  className="w-full text-xs p-1.5 border-2 border-black rounded bg-slate-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">
                  Bus Arrival at Stop:
                </label>
                <input
                  type="time"
                  value={currentMorningBusArrival}
                  onChange={(e) => setCurrentMorningBusArrival(e.target.value)}
                  className="w-full text-xs p-1.5 border-2 border-black rounded bg-red-50 text-red-700 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Evening Row */}
          <div className="space-y-3 bg-white p-3.5 border border-black rounded-lg">
            <div className="text-[11px] font-bold text-slate-800 uppercase flex items-center justify-between">
              <span>🌇 Evening Session:</span>
              <span className="text-[10px] text-slate-500">Dismissal Bell vs Bus Departure</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">
                  School Dismissal Bell:
                </label>
                <input
                  type="time"
                  value={eveningDismissalTime}
                  onChange={(e) => setEveningDismissalTime(e.target.value)}
                  className="w-full text-xs p-1.5 border-2 border-black rounded bg-slate-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">
                  Bus Stop Departure:
                </label>
                <input
                  type="time"
                  value={currentEveningBusDeparture}
                  onChange={(e) => setCurrentEveningBusDeparture(e.target.value)}
                  className="w-full text-xs p-1.5 border-2 border-black rounded bg-amber-50 text-amber-800 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Interactive Optimization Sliders */}
          <div className="pt-2 border-t border-black/10 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 block">
              // Proposed TNSTC Depot Trip Shifts:
            </span>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Morning Shift (Advance Trip):</span>
                <strong className="text-blue-700">-{morningShift} mins</strong>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={morningShift}
                onChange={(e) => setMorningShift(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Evening Shift (Delay Trip):</span>
                <strong className="text-emerald-700">+{eveningShift} mins</strong>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={eveningShift}
                onChange={(e) => setEveningShift(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Diagnostics & Proposed Solution */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Diagnostic 1: Morning Deficit */}
          <div
            className={`p-4 border-2 border-black rounded-xl shadow-neo-sm ${
              isMorningLate ? 'bg-red-50/60' : 'bg-emerald-50/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                {isMorningLate ? (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Morning Assembly Diagnostic</span>
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold border border-black ${
                  isMorningLate ? 'bg-red-500 text-white' : 'bg-[#86efac] text-black'
                }`}
              >
                {isMorningLate ? `LATE BY ${morningMismatch} MINS` : 'PUNCTUAL'}
              </span>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed">
              {isMorningLate ? (
                <>
                  Bus arrives at <strong>{minutesToTime12(currentArrivalMins)}</strong>, exactly{' '}
                  <strong className="text-red-700">{morningMismatch} minutes</strong> after the prayer bell (
                  {minutesToTime12(assemblyMins)}). Students routinely miss morning prayer and the first 25 minutes of Period 1.
                </>
              ) : (
                <>
                  Bus arrives punctually at <strong>{minutesToTime12(currentArrivalMins)}</strong> before the prayer bell (
                  {minutesToTime12(assemblyMins)}).
                </>
              )}
            </p>

            <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">With Proposed Shift (-{morningShift}m):</span>
              <span className="font-bold text-emerald-800">
                ➔ New Arrival: {minutesToTime12(optimizedArrivalMins)} ({optimizedMorningBuffer}m buffer)
              </span>
            </div>
          </div>

          {/* Diagnostic 2: Evening Conflict */}
          <div
            className={`p-4 border-2 border-black rounded-xl shadow-neo-sm ${
              isEveningEarly ? 'bg-amber-50/70' : 'bg-emerald-50/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                {isEveningEarly ? (
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Evening Dismissal Diagnostic</span>
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold border border-black ${
                  isEveningEarly ? 'bg-amber-500 text-white' : 'bg-[#86efac] text-black'
                }`}
              >
                {isEveningEarly ? `LEAVES ${eveningMismatch}M TOO EARLY` : 'SAFE DEPARTURE'}
              </span>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed">
              {isEveningEarly ? (
                <>
                  Bus departs at <strong>{minutesToTime12(currentDepartureMins)}</strong>, which is{' '}
                  <strong className="text-amber-800">{eveningMismatch} minutes before</strong> school dismissal (
                  {minutesToTime12(dismissalMins)}). Students are either forced to leave class early or wait until dark.
                </>
              ) : (
                <>
                  Bus departs at <strong>{minutesToTime12(currentDepartureMins)}</strong> after dismissal.
                </>
              )}
            </p>

            <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">With Proposed Shift (+{eveningShift}m):</span>
              <span className="font-bold text-emerald-800">
                ➔ New Departure: {minutesToTime12(optimizedDepartureMins)} ({optimizedEveningBuffer}m buffer)
              </span>
            </div>
          </div>

          {/* Impact Scorebox */}
          <div className="p-4 bg-black text-white rounded-xl border-2 border-black flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Educational Impact Recovered:
              </span>
              <div className="text-2xl font-bold text-[#86efac] mt-0.5">
                +{monthlyLostHoursPerStudent} Hours / Month
              </div>
              <span className="text-[10px] text-slate-300">
                instructional learning saved per student
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white block">
                {currentIssue?.affectedStudents} Commuters
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                100% Punctual Retention
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          // Ready for submission to TNSTC Depot Traffic Inspector & Headmaster
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCopyNotice}
            className="w-full sm:w-auto neo-btn px-4 py-2 bg-white text-black text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100"
          >
            {copiedSchedule ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Schedule!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Depot Alteration Notice</span>
              </>
            )}
          </button>

          {onGeneratePetition && (
            <button
              onClick={() => onGeneratePetition(currentIssue)}
              className="w-full sm:w-auto neo-btn px-5 py-2 bg-[#fde047] text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#facc15]"
            >
              <FileText className="w-3.5 h-3.5 text-slate-950" />
              <span>Generate Official Petition ➔</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
