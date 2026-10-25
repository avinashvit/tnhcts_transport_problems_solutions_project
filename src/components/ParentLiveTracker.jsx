import React, { useState, useEffect } from 'react';
import LiveBusMap from './LiveBusMap';
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Smartphone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Send,
  Users,
  School,
  Radio,
  MessageSquare,
  X,
} from 'lucide-react';
import { useLiveDatabase } from '../context/LiveDatabaseContext';
import {
  openNativePhoneSms,
  openWhatsAppAlert,
  sanitizeIndianPhone,
} from '../utils/smsGateway';

export default function ParentLiveTracker() {
  const {
    currentUser,
    buses,
    students,
    lastSyncTime,
    liveClockTime,
    playSmsChime,
    studentReportIrregularBehavior,
  } = useLiveDatabase();

  const [selectedRouteId, setSelectedRouteId] = useState(currentUser?.busId || 'BUS-14A');
  const [parentPhoneInput, setParentPhoneInput] = useState(currentUser?.phone || '73059 40480');

  // Red Button Irregular Behaviour Report State (The only student-side SMS trigger)
  const [isIrregularModalOpen, setIsIrregularModalOpen] = useState(false);
  const [irregularCategory, setIrregularCategory] = useState('Dangerous / Rash Driving & Overspeeding');
  const [irregularDetails, setIrregularDetails] = useState('');
  const [irregularStatus, setIrregularStatus] = useState(null);
  const [isSendingIrregular, setIsSendingIrregular] = useState(false);

  // Keep route synced with user's assigned bus
  useEffect(() => {
    if (currentUser?.busId) {
      setSelectedRouteId(currentUser.busId);
    }
  }, [currentUser?.busId]);

  const activeRoute =
    buses.find((r) => r.id === selectedRouteId) || buses[0];

  const isBusAtSchool =
    activeRoute.statusType === 'arrived' ||
    activeRoute.progress >= 100 ||
    activeRoute.currentStopIndex >= (activeRoute.stops?.length || 1) - 1;

  const routeStudents = students.filter((s) => s.busId === activeRoute.id);

  const handleSubmitIrregularReport = async () => {
    setIsSendingIrregular(true);
    setIrregularStatus(null);
    try {
      const phone = parentPhoneInput || currentUser?.phone || '73059 40480';
      const res = await studentReportIrregularBehavior({
        busId: activeRoute.id,
        studentId: currentUser?.id,
        studentName: currentUser?.name || 'M. Kaviya',
        parentPhone: phone,
        issueType: irregularCategory,
        details: irregularDetails,
      });

      const isDelivered = res.apiResult?.success === true;
      const gatewayMsg = res.apiResult?.message || '';

      if (isDelivered) {
        setIrregularStatus({
          type: 'success',
          text: `✓ Emergency SMS queued & sent via SMSMobileAPI to +91 ${phone}!`,
          phone,
          message: res.message,
          id: res.apiResult?.id,
          note: res.apiResult?.note,
        });
      } else {
        setIrregularStatus({
          type: 'error',
          text: gatewayMsg || 'SMS gateway could not dispatch. Please use the 1-Click Phone SIM button below.',
          rawError: gatewayMsg,
          phone,
          message: res.message,
        });
      }

      if (typeof playSmsChime === 'function') {
        try {
          playSmsChime();
        } catch (audioErr) {
          console.warn('Audio chime warning:', audioErr);
        }
      }
    } catch (err) {
      setIrregularStatus({
        type: 'error',
        text: `SMS dispatch issue: ${err.message}`,
      });
    } finally {
      setIsSendingIrregular(false);
    }
  };

  // Remaining distance calculated from activeRoute.progress
  const progressPercent = activeRoute.progress || 30;
  const remainingDistanceKm = Math.max(
    0.3,
    (((100 - progressPercent) / 100) * 12).toFixed(1)
  );
  const liveEtaMins = Math.max(1, Math.ceil(remainingDistanceKm * 1.8));

  return (
    <div className="space-y-6 font-mono max-w-5xl mx-auto">
      {/* Official 1-Student = 1-School & 1-Route Allocation Banner */}
      {currentUser && (
        <div className="bg-[#ecfdf5] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-neo space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase bg-black text-[#86efac] px-2.5 py-0.5 rounded">
                COMMUTER REGISTRATION • 1 STUDENT = 1 SCHOOL & 1 ROUTE
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {currentUser.name} ({currentUser.id})
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-700 px-2.5 py-0.5 rounded">
              ✓ 100% Free Bus Scheme G.O. Ms. No. 42
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-2.5 bg-white border border-black rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">1 Designated School:</span>
              <strong className="text-blue-900 block mt-0.5">
                {currentUser.schoolName || activeRoute.destinationSchool}
              </strong>
            </div>

            <div className="p-2.5 bg-white border border-black rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">1 Assigned Feeder Bus:</span>
              <strong className="text-emerald-800 block mt-0.5">
                {activeRoute.routeNumber} ({activeRoute.busRegNo})
              </strong>
            </div>

            <div className="p-2.5 bg-white border border-black rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Bus Driver:</span>
              <strong className="text-slate-900 block mt-0.5">
                {activeRoute.driverName} ({activeRoute.driverPhone})
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border-2 border-black rounded-2xl p-5 sm:p-7 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TAMIL NADU STATE TRANSPORT CORPORATION (TNSTC) • PARENT DESK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 lowercase tracking-tight">
            live govt bus tracker for parents
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Live GPS telemetry synchronized with the bus driver cabin. Track exact village stops, speed, and safety SMS alerts directly on your mobile.
          </p>
        </div>

        {/* Route Selector Dropdown */}
        <div className="flex flex-col gap-1 bg-slate-50 p-2 border-2 border-black rounded-lg flex-shrink-0">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
            <span>Select Feeder Route:</span>
            <span className="text-emerald-700 font-bold">● {liveClockTime}</span>
          </div>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="text-xs font-bold bg-white border border-black rounded px-2.5 py-1.5 outline-none text-slate-900"
          >
            {buses.map((r) => (
              <option key={r.id} value={r.id}>
                {r.routeNumber} • {r.originVillage} ➔ {r.district}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= ON-BUS PHYSICAL PANIC BUTTON (AIS-140) ZERO-PHONE ARCHITECTURE BANNER ================= */}
      <div className="bg-red-50 border-3 border-red-600 rounded-2xl p-4 sm:p-5 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex flex-col items-center justify-center flex-shrink-0 border-2 border-black shadow-neo-sm">
            <span className="text-2xl animate-pulse">🚨</span>
            <span className="text-[8px] font-black tracking-tighter uppercase">AIS-140</span>
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded border border-black shadow-sm">
                MoRTH AIS-140 COMPLIANT
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black text-[#86efac] px-2 py-0.5 rounded border border-black">
                ZERO-PHONE STUDENT COMMUTE
              </span>
              <span className="text-xs text-red-700 font-bold hidden lg:inline">
                • Direct Cellular Tower SMS
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-red-950">
              On-Bus Physical Panic Button & Conductor SOS
            </h3>
            <p className="text-xs text-red-800 max-w-2xl leading-snug">
              <strong>Govt school students do not need mobile phones while traveling.</strong> Buses are equipped with physical red SOS buttons mounted on interior window pillars (Seat #4 / Rear Door). Pressing the physical button transmits satellite GPS telemetry to the TNSTC Depot & immediately dispatches an urgent cellular SMS to the parent (+91 {currentUser?.phone || parentPhoneInput}).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIrregularStatus(null);
            setIsIrregularModalOpen(true);
          }}
          className="w-full md:w-auto neo-btn py-3.5 px-5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-black rounded-xl shadow-neo cursor-pointer flex-shrink-0"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>🚨 Simulate On-Bus Physical Panic Button (AIS-140 SOS)</span>
        </button>
      </div>

      {/* Primary Live Bus Status Card */}
      <div className="bg-white border-2 border-black rounded-2xl shadow-neo overflow-hidden flex flex-col md:flex-row items-stretch">
        {/* Left Protruding Colored Block */}
        <div className="bg-[#10b981] text-white p-6 md:w-56 flex-shrink-0 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                LIVE BUS GPS
              </span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </div>
            <div className="text-2xl font-bold mt-2 lowercase tracking-tight">
              {activeRoute.routeNumber.split(' ')[0]}
            </div>
            <div className="text-xs font-medium opacity-90 mt-0.5">
              {activeRoute.busRegNo}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/30 space-y-2">
            <div>
              <span className="text-[10px] block opacity-80 uppercase">Depot:</span>
              <span className="text-xs font-bold block">{activeRoute.depot}</span>
            </div>
            <div>
              <span className="text-[10px] block opacity-80 uppercase">Crowd Status:</span>
              <span className="text-[11px] font-bold block bg-black/20 px-2 py-0.5 rounded mt-0.5">
                {activeRoute.crowdLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-5 sm:p-7 space-y-6">
          {/* Top Corridor Line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/10 gap-2">
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Active Student Feeder Corridor
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {activeRoute.originVillage} ➔ {activeRoute.destinationSchool}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded bg-[#86efac] text-slate-950 font-bold border border-black shadow-neo-sm">
                ● {activeRoute.status}
              </span>
            </div>
          </div>

          {/* Key Metrics: Speed, ETA, Remaining Distance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-black rounded-lg">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Estimated Arrival
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {isBusAtSchool || progressPercent >= 100 ? 'At School' : `${liveEtaMins} mins`}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Arrival: {isBusAtSchool ? (activeRoute.actualArrivalTime || activeRoute.schoolArrival || liveClockTime) : activeRoute.schoolArrival}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-black rounded-lg">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Distance to School
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {progressPercent >= 100 ? '0.0 km' : `${remainingDistanceKm} km`}
              </div>
              <span className="text-[10px] text-slate-500">State Feeder Route</span>
            </div>

            <div className="p-3 bg-slate-50 border border-black rounded-lg">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Driver Telemetry
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {activeRoute.speed} km/h
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Safe speed compliance
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-black rounded-lg">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Students on Board
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {routeStudents.filter((s) => s.isBoarded).length} / {routeStudents.length}
              </div>
              <span className="text-[10px] text-slate-500">Boarding verified</span>
            </div>
          </div>

          {/* Visual Route Progress Track Bar */}
          <div className="space-y-2 p-4 bg-slate-50 border-2 border-black rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                <span>{activeRoute.originVillage}</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                {progressPercent}% of feeder route completed
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800">
                <School className="w-3.5 h-3.5" />
                <span>School Gate</span>
              </span>
            </div>

            {/* Custom Track Bar with moving Bus Pin */}
            <div className="relative w-full h-4 bg-slate-200 border-2 border-black rounded-full overflow-visible my-3">
              <div
                className="h-full bg-[#10b981] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Moving Bus Pin */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-black text-white p-1 rounded-full border-2 border-white shadow-neo-sm transition-all duration-700"
                style={{ left: `${Math.min(96, Math.max(4, progressPercent))}%` }}
                title={`Live Bus Location: ${remainingDistanceKm} km from school`}
              >
                <Bus className="w-4 h-4 text-[#86efac]" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>Morning Departure: {activeRoute.morningPickup}</span>
              <span className="text-emerald-800 font-bold">
                Driver Cabin: {activeRoute.driverName}
              </span>
              <span>Target Bell: {activeRoute.schoolArrival}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Geographic Bus & Route Corridor Map */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-700" />
              <span>Live Geographic Map & Stops Telemetry</span>
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-bold">
            Click on 🚌 Bus, 📍 Stops, or 🏫 School Gate for full details & student rosters
          </span>
        </div>

        <LiveBusMap
          selectedBusId={selectedRouteId}
          onSelectBus={setSelectedRouteId}
          height="480px"
          showControls={true}
        />
      </div>

      {/* Grid: Route Stops Progress & Parent SMS Notification Mobile View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stops Timeline */}
        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-700" />
              <span>Route Stops & Live Progress</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-black">
              Stop {activeRoute.currentStopIndex + 1} of {activeRoute.stops.length}
            </span>
          </div>

          <div className="space-y-3">
            {activeRoute.stops.map((stop, idx) => {
              const isPassed = stop.passed;
              const isCurrent = idx === activeRoute.currentStopIndex;
              const isNext = stop.isNext;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 border-black flex items-center justify-between text-xs transition-all ${
                    isCurrent
                      ? 'bg-amber-100/70 border-black shadow-neo-sm'
                      : isPassed
                      ? 'bg-emerald-50/60 border-black/50'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full border border-black flex items-center justify-center font-bold text-[11px] ${
                        isPassed
                          ? 'bg-[#10b981] text-white'
                          : isCurrent
                          ? 'bg-black text-white animate-pulse'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPassed ? '✓' : `0${idx + 1}`}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{stop.name}</span>
                        {stop.isSchool && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-black text-white font-bold">
                            DESTINATION
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Scheduled Time: {stop.time}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border border-black ${
                      isPassed
                        ? 'bg-emerald-200 text-emerald-900'
                        : isCurrent
                        ? 'bg-black text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPassed ? 'Departed' : isCurrent ? 'BUS HERE' : 'Upcoming'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Crew Contact & Depot Helpline */}
          <div className="p-4 bg-slate-50 border-2 border-black rounded-xl space-y-2 text-xs">
            <div className="font-bold uppercase tracking-wider text-[11px] text-slate-700 flex items-center justify-between">
              <span>Bus Crew & Depot Hotline:</span>
              <Phone className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Driver:</span>
                <strong className="text-slate-900">{activeRoute.driverName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Conductor:</span>
                <strong className="text-slate-900">{activeRoute.conductorName}</strong>
              </div>
              <div className="col-span-2 pt-1 border-t border-black/10 flex justify-between items-center">
                <span className="text-slate-500">TNSTC Regional Depot Hotline:</span>
                <strong className="text-blue-800">{activeRoute.depotHotline}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Enrolled Student Commuters & Live SMS Alerts System Info */}
        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Enrolled Student Commuters</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  Assigned to Bus {activeRoute.routeNumber.split(' ')[0]} ({routeStudents.length} Students)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-black">
                {isBusAtSchool
                  ? `${routeStudents.filter((s) => s.isBoarded).length} Arrived • ${routeStudents.filter((s) => !s.isBoarded).length} Missed`
                  : `${routeStudents.filter((s) => s.isBoarded).length} / ${routeStudents.length} On Board`}
              </span>
            </div>

            {/* List of Students with Boarding Status */}
            <div className="space-y-2.5">
              {routeStudents.map((s) => {
                const hasReachedSchool =
                  isBusAtSchool ||
                  s.status === 'Safely Arrived at School Gate' ||
                  Boolean(s.arrivedSchoolTime) ||
                  activeRoute.statusType === 'arrived' ||
                  activeRoute.progress >= 100 ||
                  activeRoute.currentStopIndex >= (activeRoute.stops?.length || 1) - 1;

                const isArrivedSafe = hasReachedSchool && s.isBoarded;
                const isMissed = (hasReachedSchool || s.isMissed) && !s.isBoarded;

                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border-2 border-black flex items-center justify-between text-xs transition-all ${
                      isArrivedSafe
                        ? 'bg-emerald-50 border-black shadow-neo-sm'
                        : isMissed
                        ? 'bg-red-50 border-red-800 shadow-neo-sm'
                        : s.isBoarded
                        ? 'bg-emerald-50 border-black shadow-neo-sm'
                        : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full border border-black flex items-center justify-center font-bold text-[11px] ${
                          isArrivedSafe
                            ? 'bg-[#10b981] text-white'
                            : isMissed
                            ? 'bg-red-600 text-white'
                            : s.isBoarded
                            ? 'bg-[#10b981] text-white'
                            : 'bg-white text-slate-500'
                        }`}
                      >
                        {isArrivedSafe ? '✓' : isMissed ? '✕' : s.isBoarded ? '✓' : '□'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{s.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">({s.id})</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Stop: <strong>{s.stopName}</strong> • {s.classGrade}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded border border-black ${
                        isArrivedSafe
                          ? 'bg-[#86efac] text-slate-950'
                          : isMissed
                          ? 'bg-red-200 text-red-950 border-red-800'
                          : s.isBoarded
                          ? 'bg-[#86efac] text-slate-950'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isArrivedSafe
                        ? `✓ Inside School Campus (${s.arrivedSchoolTime || activeRoute.actualArrivalTime || activeRoute.schoolArrival || liveClockTime})`
                        : isMissed
                        ? `⚠️ Bus Missed (Alert Sent)`
                        : s.isBoarded
                        ? `Boarded (${s.boardedTime || '08:16 AM'})`
                        : 'Waiting at Stop'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Official Automated Cellular SMS Policy Info Card */}
            <div className="p-4 bg-slate-50 border-2 border-black rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-900 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Automated Cellular SMS Alerts Active</span>
                </span>
                <span className="text-[10px] font-bold bg-[#86efac] text-slate-950 px-2 py-0.5 rounded border border-black">
                  SMSMobileAPI Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Cellular SMS notifications are automatically dispatched over telecom towers to parent phone:
              </p>
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-black/20">
                  <span className="text-emerald-700 font-bold shrink-0">🟢 1. Child Boarded:</span>
                  <span className="text-slate-700">Driver marks student boarded at pickup stop.</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-black/20">
                  <span className="text-blue-700 font-bold shrink-0">🏫 2. School Arrival:</span>
                  <span className="text-slate-700">Driver confirms bus reached school gate safely.</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-black/20">
                  <span className="text-red-700 font-bold shrink-0">🚨 3. Safety Alert:</span>
                  <span className="text-slate-700">Student taps red safety button to report irregular transit.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Parent Phone Banner */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-600">
            <span>Alert Destination Parent Phone:</span>
            <strong className="font-mono text-slate-900 text-xs">+91 {currentUser?.phone || parentPhoneInput}</strong>
          </div>
        </div>
      </div>

      {/* ================= RED BUTTON IRREGULAR BEHAVIOUR SMS MODAL ================= */}
      {isIrregularModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white border-4 border-black rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-neo-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header (Pinned at Top) */}
            <div className="flex items-start justify-between border-b-2 border-black p-4 sm:p-5 bg-white shrink-0">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold mb-1 border border-black shadow-neo-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>ON-BUS AIS-140 HARDWARE SIMULATOR</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight lowercase">
                  on-bus physical panic button
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                  Simulates the physical red SOS panic button mounted on Bus {activeRoute.routeNumber} pillar (Zero-Phone System).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsIrregularModalOpen(false)}
                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer font-bold text-sm shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable with Smooth Scroll) */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {/* Tactical Visual On-Bus Panic Button Unit Housing */}
              <div className="bg-amber-100 border-3 border-black rounded-2xl p-4 shadow-neo-sm space-y-3">
                <div className="flex items-center justify-between border-b border-black/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                      BUS PILLAR #3 • AIS-140 SOS UNIT / அவசர உதவி பொத்தான்
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-black text-[#86efac] px-2 py-0.5 rounded">
                    GPS-GSM TELEMETRY
                  </span>
                </div>

                {/* Tactile Red Physical Button Display */}
                <div className="bg-slate-900 rounded-xl p-4 border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full bg-red-600 border-4 border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.7)] flex items-center justify-center text-white text-2xl font-black cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                        🚨
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                      </span>
                    </div>
                    <div className="text-white space-y-0.5">
                      <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                        Physical Hardware Switch
                      </span>
                      <h4 className="text-sm font-bold">Press In Transit Emergency</h4>
                      <p className="text-[10px] text-slate-400 max-w-xs leading-tight">
                        Mounted on bus wall. Accessible to all students without mobile phones.
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 text-[10px] font-mono text-left space-y-1 text-slate-300">
                    <div className="text-[#86efac] font-bold">✓ AIS-140 Telemetry Online</div>
                    <div>• Vehicle: {activeRoute.busRegNo || 'TNSTC Govt Bus'}</div>
                    <div>• Route: {activeRoute.routeNumber}</div>
                  </div>
                </div>

                {/* Zero-Phone Commute Policy Callout */}
                <div className="p-2.5 bg-white border border-black/20 rounded-xl text-[11px] text-slate-700 leading-snug">
                  <strong>Zero-Phone Reality:</strong> Govt school students do not carry smartphones while commuting. Under Tamil Nadu transport safety norms, any student noticing reckless driving, route diversion, or danger presses this physical wall button or informs the conductor. An automatic cellular SMS is dispatched directly to the parent's phone.
                </div>
              </div>

              {/* Commuter & Parent Recipient Info */}
              <div className="p-3 bg-red-50 border-2 border-red-500 rounded-2xl grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase block">Student Commuter:</span>
                  <strong className="text-slate-900 block font-mono">
                    {currentUser?.name || 'M. Kaviya'} ({currentUser?.classGrade || '10th Std'})
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase block">Bus & Driver:</span>
                  <strong className="text-slate-900 block font-mono">
                    {activeRoute.routeNumber} • {activeRoute.driverName}
                  </strong>
                </div>
                <div className="col-span-2 pt-2 border-t border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-red-900 uppercase">Alert Destination Parent Mobile:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-1 bg-white border border-black rounded text-xs font-bold font-mono text-red-900">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={parentPhoneInput.replace(/\D/g, '')}
                      onChange={(e) => setParentPhoneInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile"
                      className="w-36 text-xs font-bold font-mono px-2 py-1 bg-white border-2 border-black rounded-lg outline-none focus:ring-2 focus:ring-red-600 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Incident Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Select Emergency / Hazard Trigger Reason:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'Dangerous / Rash Driving & Overspeeding', label: '⚡ Rash Driving / Dangerous Speed' },
                    { id: 'Route Diversion / Unscheduled Village Stop', label: '🚫 Route Diversion / Unknown Stop' },
                    { id: 'Severe Overcrowding / Footboard Danger', label: '👥 Footboard Danger / Overcrowded' },
                    { id: 'Misbehaviour / Harassment Inside Bus', label: '🛑 Misbehaviour / Harassment' },
                    { id: 'Bus Breakdown / Stalled Long Halt', label: '🔧 Bus Breakdown / Roadside Stalled' },
                    { id: 'Skipped Student Pickup Stop', label: '🚏 Skipped Scheduled Student Stop' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIrregularCategory(item.id)}
                      className={`p-2.5 rounded-xl text-left text-xs font-bold border-2 border-black transition-all cursor-pointer ${
                        irregularCategory === item.id
                          ? 'bg-red-600 text-white shadow-neo-sm font-extrabold'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Specific Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 block">
                  Additional Incident Details (Optional):
                </label>
                <textarea
                  rows={2}
                  value={irregularDetails}
                  onChange={(e) => setIrregularDetails(e.target.value)}
                  placeholder="Describe what occurred (e.g. driver skipped stop without halting)..."
                  className="w-full text-xs font-mono p-2.5 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Message Preview */}
              <div className="p-3 bg-slate-950 text-white rounded-xl border-2 border-black text-xs space-y-1">
                <span className="text-[10px] text-red-400 font-bold block uppercase">
                  Cellular SMS Transmitted by On-Bus Unit to Parent Mobile:
                </span>
                <p className="text-[11px] text-slate-200 leading-relaxed font-mono">
                  {`TN-GOVT-EDU URGENT: On-bus physical SOS panic button (AIS-140) pressed on Bus ${activeRoute.routeNumber.split(' ')[0]} (${liveClockTime || 'now'}) regarding ${irregularCategory}.${irregularDetails.trim() ? ` Note: ${irregularDetails.trim()}` : ''} Driver cabin & TNSTC Depot alerted. Helpline: 1098 / 04342-260100.`}
                </p>
              </div>

              {/* Feedback / Status */}
              {irregularStatus && (
                <div
                  className={`p-3.5 rounded-xl border-2 border-black text-xs font-bold space-y-2.5 ${
                    irregularStatus.type === 'success'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-800'
                      : 'bg-red-100 text-red-950 border-red-800'
                  }`}
                >
                  {irregularStatus.type === 'success' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-800" />
                        <span>{irregularStatus.text}</span>
                      </div>
                      <div className="p-2.5 bg-emerald-200/70 border border-emerald-800/30 rounded-lg text-[11px] font-normal text-emerald-950 space-y-1">
                        <p className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                          <span>📲 Sent to your iPhone API SMS app!</span>
                        </p>
                        <p className="leading-relaxed">
                          Your iPhone received the SMS in the <strong>API SMS</strong> app. Tap <strong>[ 💬 Prepare SMS ]</strong> and hit the send arrow (↑) to dispatch via SIM.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-800" />
                      <span>{irregularStatus.text}</span>
                    </div>
                  )}

                  {/* Direct 1-Tap Real SMS Fallback (Works 100% Free on all phones) */}
                  <div className="pt-2 border-t border-black/10 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => openNativePhoneSms(irregularStatus.phone, irregularStatus.message)}
                      className="neo-btn flex-1 px-3 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-2 shadow-neo-sm"
                    >
                      <Smartphone className="w-4 h-4 text-[#86efac] animate-bounce" />
                      <span>📱 Deliver Directly from Messages App ➔</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openWhatsAppAlert(irregularStatus.phone, irregularStatus.message)}
                      className="neo-btn px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-neo-sm"
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                      <span>Open in WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 24x7 Official Helpline Fast Access */}
              <div className="p-3 bg-slate-100 border border-black/20 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-700">
                <span className="font-bold uppercase tracking-wider text-slate-900">Official Helplines:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-black font-bold">Childline: 1098</span>
                <span className="bg-white px-2 py-0.5 rounded border border-black font-bold">Women Helpline: 181</span>
                <span className="bg-white px-2 py-0.5 rounded border border-black font-bold">TNSTC Control: 149</span>
              </div>
            </div>

            {/* Modal Footer (Pinned at Bottom with Submit Button) */}
            <div className="p-4 sm:p-5 border-t-2 border-black bg-slate-50 shrink-0 space-y-2">
              <button
                type="button"
                disabled={isSendingIrregular}
                onClick={handleSubmitIrregularReport}
                className="w-full neo-btn py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 border-2 border-black rounded-xl shadow-neo cursor-pointer disabled:opacity-50"
              >
                {isSendingIrregular ? (
                  <span>Transmitting On-Bus Telemetry Alert to Parent...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>[ 🚨 PRESS ON-BUS PHYSICAL SOS (DISPATCH CELLULAR SMS) ]</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>MoRTH AIS-140 Vehicle Safety Unit • SMSMobileAPI Gateway</span>
                <button
                  type="button"
                  onClick={() => setIsIrregularModalOpen(false)}
                  className="font-bold text-slate-700 hover:text-black underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
