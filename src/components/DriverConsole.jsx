import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useLiveDatabase } from '../context/LiveDatabaseContext';
import LiveBusMap from './LiveBusMap';
import {
  Bus,
  MapPin,
  CheckCircle2,
  Users,
  Navigation,
  Clock,
  AlertTriangle,
  Send,
  Radio,
  Sliders,
  Check,
  QrCode,
  Camera,
  X,
  Scan,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function DriverConsole() {
  const {
    currentUser,
    buses,
    drivers,
    students,
    smsLog,
    driverStartTrip,
    driverAdvanceStop,
    driverArriveAtSchool,
    driverUpdateStatus,
    driverToggleStudentBoarding,
    driverScanStudentQrPass,
    driverDismissEmergencyAlert,
    liveClockTime,
    lastSyncTime,
    playSmsChime,
  } = useLiveDatabase();

  // Find the bus assigned to this driver dynamically from live DB
  const myAssignedBus = buses.find(
    (b) => b.driverId === currentUser?.id || b.id === currentUser?.busId
  );

  const [activeConsoleBusId, setActiveConsoleBusId] = useState(
    myAssignedBus?.id || currentUser?.busId || buses[0]?.id || 'BUS-14A'
  );

  // Sync if admin reassigns this driver to a new bus route
  useEffect(() => {
    if (myAssignedBus?.id) {
      setActiveConsoleBusId(myAssignedBus.id);
    }
  }, [myAssignedBus?.id]);

  const myBus =
    buses.find((b) => b.id === activeConsoleBusId) || myAssignedBus || buses[0];
  const myStudents = students.filter((s) => s.busId === myBus.id);

  const [customDelayText, setCustomDelayText] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);

  // Digital Pass QR Code Scanner Modal States
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScanFeedback, setQrScanFeedback] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isProcessingCode, setIsProcessingCode] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastScannedCodeRef = useRef('');
  const lastScanTimeRef = useRef(0);

  const nextStop = myBus.stops[myBus.currentStopIndex + 1];
  const isAtSchool =
    myBus.statusType === 'arrived' ||
    myBus.progress >= 100 ||
    myBus.currentStopIndex >= (myBus.stops?.length || 1) - 1;

  const triggerFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleStartTrip = () => {
    driverStartTrip(myBus.id);
    triggerFeedback(`🚀 Feeder Trip Started! Live GPS initialized at Stop 1 (${myBus.stops[0]?.name || 'Origin'}). Ready to scan boarding student QR passes.`);
  };

  const handleAdvance = () => {
    if (isAtSchool) return;
    driverAdvanceStop(myBus.id);
    triggerFeedback(`Bus advanced to next stop! GPS telemetry & stops updated.`);
  };

  const handleArriveSchool = () => {
    driverArriveAtSchool(myBus.id);
    triggerFeedback(`Trip Ended! Safe arrival SMS dispatched to boarded students, and "Bus Missed" alert sent to unboarded students via SMSMobileAPI.`);
  };

  const handleSpeedChange = (speed) => {
    driverUpdateStatus(myBus.id, { speed });
    triggerFeedback(`Speed updated to ${speed} km/h (live GPS telemetry).`);
  };

  const handleCrowdChange = (crowdLevel) => {
    driverUpdateStatus(myBus.id, { crowdLevel });
    triggerFeedback(`Crowd status updated to "${crowdLevel}".`);
  };

  const handleReportDelay = (reason) => {
    const text = reason || customDelayText;
    if (!text.trim()) return;
    driverUpdateStatus(myBus.id, {
      status: `Delayed (${text})`,
      isDelayed: true,
    });
    setCustomDelayText('');
    triggerFeedback(`Delay status updated on GPS monitor.`);
  };

  const handleStudentBoarding = (studentId, studentName, parentPhone, willBeBoarded) => {
    driverToggleStudentBoarding(studentId);
    if (!willBeBoarded) {
      triggerFeedback(`📲 Real-time Boarding SMS dispatched to parent (${parentPhone}) for ${studentName} via SMSMobileAPI!`);
    } else {
      triggerFeedback(`Boarding status for ${studentName} reset to waiting.`);
    }
  };

  // Reset scan tracker refs when scanner modal is opened or closed
  useEffect(() => {
    lastScannedCodeRef.current = '';
    lastScanTimeRef.current = 0;
    isProcessingRef.current = false;
    setIsProcessingCode(false);
    if (!isQrScannerOpen) {
      setQrScanFeedback(null);
    }
  }, [isQrScannerOpen]);

  // Webcam scanning effect using jsQR - runs continuously without aborting on wrong QR
  useEffect(() => {
    let stream = null;
    let isActive = true;

    const scanVideoLoop = () => {
      if (!isActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data) {
              const raw = String(code.data).trim();
              const now = Date.now();
              // Only trigger if not actively verifying AND (it is a different QR code OR 2s elapsed since last scan of same code)
              if (!isProcessingRef.current) {
                if (raw !== lastScannedCodeRef.current || now - lastScanTimeRef.current > 2000) {
                  lastScannedCodeRef.current = raw;
                  lastScanTimeRef.current = now;
                  handleScanPayload(raw);
                }
              }
            }
          } catch (e) {
            // Frame analysis catch
          }
        }
      }

      // CRITICAL: Always schedule the next animation frame so scanning never freezes!
      if (isActive) {
        animRef.current = requestAnimationFrame(scanVideoLoop);
      }
    };

    if (isQrScannerOpen) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            if (!isActive) {
              s.getTracks().forEach((t) => t.stop());
              return;
            }
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              videoRef.current.setAttribute('playsinline', 'true');
              videoRef.current.play().catch(() => {});
              setCameraActive(true);
              scanVideoLoop();
            }
          })
          .catch((err) => {
            console.warn('Camera stream not started:', err.message);
            setCameraActive(false);
          });
      }
    }

    return () => {
      isActive = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isQrScannerOpen]);

  // Process scanned QR payload or student ID with live re-scan capability
  const handleScanPayload = async (codeString) => {
    if (!codeString) return;
    isProcessingRef.current = true;
    setIsProcessingCode(true);

    try {
      const res = await driverScanStudentQrPass(codeString);
      if (res.success) {
        setQrScanFeedback({
          type: 'success',
          text: res.message,
          student: res.student,
          alreadyBoarded: res.alreadyBoarded,
        });
        if (typeof playSmsChime === 'function') {
          playSmsChime();
        }
      } else {
        setQrScanFeedback({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err) {
      setQrScanFeedback({
        type: 'error',
        text: `Scanner error: ${err.message}`,
      });
    } finally {
      // Cooldown before unlocking camera for the next student pass
      setTimeout(() => {
        isProcessingRef.current = false;
        setIsProcessingCode(false);
      }, 500);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleScanPayload(manualCodeInput.trim());
    setManualCodeInput('');
  };

  return (
    <div className="space-y-6 font-mono max-w-5xl mx-auto">
      {/* Driver Console Header */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TNSTC ON-ROAD DRIVER & CONDUCTOR LIVE CONSOLE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight lowercase">
            driver cabin controller
          </h1>
          <p className="text-xs text-slate-600">
            Welcome, <strong>{currentUser?.name || 'Driver 1'}</strong>. Synchronized with parents and depot in real time.
          </p>
        </div>

        {/* Bus Info Badge & Synchronized Clock */}
        <div className="bg-slate-50 p-3 border-2 border-black rounded-xl text-xs space-y-1.5 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Bus className="w-4 h-4 text-blue-700" />
              <span>{myBus.routeNumber}</span>
            </div>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-400">
              🕒 {liveClockTime}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Vehicle: <strong>{myBus.busRegNo}</strong> • {myBus.depot}
          </div>
        </div>
      </div>

      {/* Active On-Bus Physical Panic Button Alarm Banner (AIS-140) */}
      {myBus?.emergencyAlert?.active && (
        <div className="bg-red-600 text-white border-3 border-black rounded-2xl p-4 sm:p-5 shadow-neo-lg animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white text-red-600 rounded-xl flex items-center justify-center text-2xl font-black border-2 border-black shrink-0 shadow-neo-sm">
              🚨
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-black text-[#86efac] text-[10px] font-black uppercase px-2 py-0.5 rounded border border-white/20">
                  AIS-140 ON-BUS PHYSICAL PANIC BUTTON ACTIVATED
                </span>
                <span className="text-xs text-red-100 font-mono font-bold">
                  Time: {myBus.emergencyAlert.time}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Emergency Alert: {myBus.emergencyAlert.category}
              </h3>
              <p className="text-xs text-red-100 leading-snug">
                Student commuter pressed the physical pillar SOS button on this bus. Stop vehicle safely at roadside, attend to student commuters, and notify depot.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => driverDismissEmergencyAlert(myBus.id)}
            className="neo-btn px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl border-2 border-black shadow-neo shrink-0 cursor-pointer"
          >
            ✓ Acknowledge & Reset SOS
          </button>
        </div>
      )}

      {/* Action Notification Toast */}
      {actionFeedback && (
        <div className="p-3 bg-[#86efac] border-2 border-black rounded-xl font-bold text-xs text-slate-950 flex items-center justify-between shadow-neo-sm animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
            <span>{actionFeedback}</span>
          </div>
          <span className="text-[10px] text-slate-700">Sync: {liveClockTime}</span>
        </div>
      )}

      {/* ================= PROMINENT OPTION: START THE TRIP ================= */}
      <div
        className={`p-5 rounded-2xl border-3 border-black shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          myBus.isTripActive && !isAtSchool ? 'bg-emerald-50 border-emerald-700' : 'bg-[#ecfdf5]'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-black text-[#86efac] flex items-center justify-center flex-shrink-0 text-2xl font-bold border-2 border-black shadow-neo-sm">
            {myBus.isTripActive && !isAtSchool ? '🚍' : '🚀'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-black ${
                  myBus.isTripActive && !isAtSchool
                    ? 'bg-black text-[#86efac]'
                    : 'bg-black text-white'
                }`}
              >
                {myBus.isTripActive && !isAtSchool ? '🟢 TRIP ACTIVE • ON ROAD' : 'TRIP CONTROLLER • READY TO DEPART'}
              </span>
              <span className="text-xs text-emerald-900 font-bold hidden sm:inline">
                Feeder Route {myBus.routeNumber}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-950 mt-0.5">
              {myBus.isTripActive && !isAtSchool
                ? `Feeder Trip In Progress (Started at ${myBus.tripStartTime || liveClockTime})`
                : isAtSchool
                ? `Previous Trip Completed at School Gate`
                : `Start Feeder Bus Trip from ${myBus.originVillage || 'Morappur'}`}
            </h3>
            <p className="text-xs text-slate-700">
              {myBus.isTripActive && !isAtSchool
                ? `GPS telemetry is live. Currently at ${myBus.stops[myBus.currentStopIndex]?.name || 'Origin'}. Click "Advance Stop" as you progress.`
                : `Initializes route from Stop 1 (${myBus.stops[0]?.name || 'Morappur Bus Stand'}), broadcasts live GPS coordinates to parents, and opens digital pass QR scanning for students waiting at stops.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={handleStartTrip}
            className="w-full md:w-auto neo-btn py-3 px-6 bg-[#86efac] hover:bg-[#6ee7b7] text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-black rounded-xl shadow-neo cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-slate-950" />
            <span>
              {myBus.isTripActive && !isAtSchool
                ? '[ ↺ Restart Trip from Stop 1 ]'
                : isAtSchool
                ? '[ 🚀 Start New Feeder Trip ➔ ]'
                : '[ 🚀 Start the Feeder Trip ➔ ]'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Bus Live Telemetry Card */}
      <div className="bg-white border-2 border-black rounded-2xl shadow-neo overflow-hidden p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              ASSIGNED SERVICE
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {myBus.originVillage} ➔ {myBus.destinationSchool}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded font-bold border-2 border-black ${
                isAtSchool
                  ? 'bg-blue-200 text-blue-950'
                  : 'bg-[#86efac] text-slate-950'
              }`}
            >
              Status: {myBus.status}
            </span>
          </div>
        </div>

        {/* 3 Driver Action Buttons: Start Trip, Advance Stop, Arrive at School */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Start / Restart Trip */}
          <button
            type="button"
            onClick={handleStartTrip}
            className={`p-5 rounded-2xl border-2 border-black shadow-neo text-left flex flex-col justify-between transition-all cursor-pointer ${
              myBus.isTripActive && !isAtSchool
                ? 'bg-emerald-50 text-slate-900 hover:bg-emerald-100 hover:-translate-y-0.5'
                : 'bg-[#86efac] text-slate-950 hover:bg-[#6ee7b7] hover:-translate-y-0.5'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                  ACTION 01 • TRIP DEPARTURE
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border border-black ${
                    myBus.isTripActive && !isAtSchool ? 'bg-emerald-700 text-white' : 'bg-black text-[#86efac]'
                  }`}
                >
                  {myBus.isTripActive && !isAtSchool ? 'ACTIVE' : 'DEPART'}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold mt-1">
                {myBus.isTripActive && !isAtSchool ? '↺ Restart Trip' : '🚀 Start the Trip'}
              </div>
              <p className="text-xs opacity-90 mt-1">
                {myBus.isTripActive && !isAtSchool
                  ? `Trip active since ${myBus.tripStartTime || liveClockTime}. Click to restart from origin.`
                  : `Depart Stop 1 (${myBus.stops[0]?.name || 'Origin'}) and begin live telemetry.`}
              </p>
            </div>
            <span className="text-[11px] font-bold mt-4 pt-2 border-t border-black/20 block">
              {myBus.isTripActive && !isAtSchool
                ? '[ Click to Reset to Stop 1 ]'
                : '[ Click to Start Feeder Trip ➔ ]'}
            </span>
          </button>

          {/* Action 2: Advance to Next Stop */}
          <button
            type="button"
            onClick={handleAdvance}
            disabled={isAtSchool}
            className={`p-5 rounded-2xl border-2 border-black shadow-neo text-left flex flex-col justify-between transition-all ${
              isAtSchool
                ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                : 'bg-black text-white hover:bg-slate-800 hover:-translate-y-0.5 cursor-pointer'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                  ACTION 02 • ON-ROAD
                </span>
                <span className="text-[9px] font-bold bg-white text-slate-900 px-2 py-0.5 rounded border border-black">
                  GPS ADVANCE
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold mt-1">
                ➔ Advance Next Stop
              </div>
              <p className="text-xs opacity-90 mt-1">
                {nextStop ? (
                  <>Next: <strong>{nextStop.name}</strong> ({nextStop.time})</>
                ) : (
                  'At Final Destination School'
                )}
              </p>
            </div>
            <span className="text-[11px] font-bold mt-4 pt-2 border-t border-white/20 block">
              [ Arriving at {nextStop?.name || 'School Gate'} ]
            </span>
          </button>

          {/* Action 3: Safe Arrival at School Gate (TRIGGER #1: Reached School SMS) */}
          <button
            type="button"
            onClick={handleArriveSchool}
            className="p-5 rounded-2xl border-2 border-black shadow-neo text-left flex flex-col justify-between bg-[#10b981] text-white hover:bg-[#059669] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                  ACTION 03 • DESTINATION
                </span>
                <span className="text-[9px] font-bold bg-black text-[#86efac] px-2 py-0.5 rounded border border-white/20">
                  CELLULAR SMS
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold mt-1">
                ✓ Mark Arrived at School
              </div>
              <p className="text-xs opacity-90 mt-1">
                Transmits official safe arrival SMS over cellular towers to all registered route parents and updates attendance.
              </p>
            </div>
            <span className="text-[11px] font-bold mt-4 pt-2 border-t border-white/20 block">
              [ 🚀 Send School Arrival SMS ]
            </span>
          </button>
        </div>

        {/* Route Stops Sequence View */}
        <div className="p-4 bg-slate-50 border-2 border-black rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Stops Checklist on Route:</span>
            <span className="text-slate-500 text-[11px]">{myBus.progress}% Complete</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {myBus.stops.map((stop, idx) => {
              const isCurrent = idx === myBus.currentStopIndex;
              const isPassed = stop.passed;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border-2 border-black text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-amber-200 text-slate-950 shadow-neo-sm'
                      : isPassed
                      ? 'bg-[#86efac] text-slate-950'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span>Stop {idx + 1}</span>
                    <span>{isPassed ? '✓' : isCurrent ? 'BUS' : '○'}</span>
                  </div>
                  <div className="text-[11px] line-clamp-1">{stop.name}</div>
                  <div className="text-[10px] opacity-75 mt-1">{stop.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cabin Live GPS Route Map */}
        <div className="space-y-2 pt-2 border-t border-black/10">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Cabin Route Map (GPS Navigation):</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Syncs with parent mobile and depot in real time
            </span>
          </div>
          <LiveBusMap
            selectedBusId={myBus.id}
            height="320px"
            showControls={false}
          />
        </div>

        {/* Speedometer & Crowd Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-black/10">
          {/* Speed Controls */}
          <div className="space-y-2 p-3 bg-slate-50 border border-black rounded-lg text-xs">
            <span className="font-bold text-slate-800 block">
              Set Bus Speed (Live GPS Telemetry):
            </span>
            <div className="flex gap-2">
              {[25, 38, 45].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`flex-1 py-1.5 rounded border border-black font-bold text-xs ${
                    myBus.speed === spd ? 'bg-black text-white' : 'bg-white hover:bg-slate-100'
                  }`}
                >
                  {spd} km/h
                </button>
              ))}
            </div>
          </div>

          {/* Crowd Status Controls */}
          <div className="space-y-2 p-3 bg-slate-50 border border-black rounded-lg text-xs">
            <span className="font-bold text-slate-800 block">
              Crowd / Seat Status:
            </span>
            <div className="flex gap-1.5">
              {['Seats Available', 'Moderate', 'Standing Only'].map((c) => (
                <button
                  key={c}
                  onClick={() => handleCrowdChange(c)}
                  className={`flex-1 py-1.5 px-1 text-[11px] rounded border border-black font-bold truncate ${
                    myBus.crowdLevel === c ? 'bg-black text-white' : 'bg-white hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= STUDENT COMMUTER BOARDING CHECKLIST & QR SCANNER ================= */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-black gap-3">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Student Commuter Boarding & Attendance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan student pass QR code or tap button. Automatically transmits real-time cellular SMS to parent.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Prominent QR Code Scanner Action Button */}
            <button
              type="button"
              onClick={() => {
                setQrScanFeedback(null);
                setIsQrScannerOpen(true);
              }}
              className="neo-btn px-4 py-2 bg-[#86efac] hover:bg-[#6ee7b7] text-slate-950 font-bold text-xs flex items-center gap-2 border-2 border-black rounded-xl shadow-neo-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-black" />
              <span>[ 📷 Scan Digital Pass QR ]</span>
            </button>

            <span className="text-xs font-bold px-2.5 py-1.5 rounded bg-slate-100 border border-black">
              {isAtSchool
                ? `${myStudents.filter((s) => s.isBoarded).length} Arrived • ${myStudents.filter((s) => !s.isBoarded).length} Missed`
                : `${myStudents.filter((s) => s.isBoarded).length} / ${myStudents.length} On Board`}
            </span>
          </div>
        </div>

        {/* Student Rows */}
        <div className="space-y-2.5">
          {myStudents.map((student) => {
            const hasReachedSchool =
              isAtSchool ||
              student.status === 'Safely Arrived at School Gate' ||
              Boolean(student.arrivedSchoolTime) ||
              myBus.statusType === 'arrived' ||
              myBus.progress >= 100 ||
              myBus.currentStopIndex >= (myBus.stops?.length || 1) - 1;

            const isArrivedSafe = hasReachedSchool && student.isBoarded;
            const isMissed = (hasReachedSchool || student.isMissed) && !student.isBoarded;

            return (
              <div
                key={student.id}
                className={`p-3.5 rounded-xl border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                  isArrivedSafe
                    ? 'bg-emerald-50/70 border-black'
                    : isMissed
                    ? 'bg-red-50/80 border-red-800'
                    : student.isBoarded
                    ? 'bg-emerald-50/70 border-black'
                    : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-xs ${
                      isArrivedSafe
                        ? 'bg-[#10b981] text-white'
                        : isMissed
                        ? 'bg-red-600 text-white'
                        : student.isBoarded
                        ? 'bg-[#10b981] text-white'
                        : 'bg-white text-slate-600'
                    }`}
                  >
                    {isArrivedSafe ? '✓' : isMissed ? '✕' : student.isBoarded ? '✓' : '□'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{student.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">({student.id})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {student.classGrade} • Stop: <strong>{student.stopName}</strong> • Parent: {student.parentPhone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded border border-black ${
                      isArrivedSafe
                        ? 'bg-[#86efac] text-slate-950'
                        : isMissed
                        ? 'bg-red-200 text-red-950 border-red-800'
                        : student.isBoarded
                        ? 'bg-[#86efac] text-slate-950'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {isArrivedSafe
                      ? `✓ Inside School Campus (${student.arrivedSchoolTime || myBus.actualArrivalTime || myBus.schoolArrival || liveClockTime})`
                      : isMissed
                      ? `⚠️ Bus Missed (Alert Sent to Parent)`
                      : student.isBoarded
                      ? `Boarded at ${student.boardedTime || '08:16 AM'}`
                      : 'Waiting at Stop'}
                  </span>

                  <button
                    onClick={() => handleStudentBoarding(student.id, student.name, student.parentPhone, student.isBoarded)}
                    className={`neo-btn px-3 py-1.5 text-xs font-bold cursor-pointer ${
                      isArrivedSafe
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : isMissed
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : student.isBoarded
                        ? 'bg-white text-slate-700 hover:bg-slate-100'
                        : 'bg-black text-white hover:bg-slate-800'
                    }`}
                    title={
                      student.isBoarded
                        ? 'Undo boarding status'
                        : `Sends cellular SMS to parent (+91 ${student.parentPhone}) via SMSMobileAPI`
                    }
                  >
                    {isArrivedSafe
                      ? 'Reset Status'
                      : isMissed
                      ? 'Late Board ➔'
                      : student.isBoarded
                      ? 'Undo'
                      : 'Mark Boarded (Send SMS) ➔'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Delay / Incident Broadcast */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Quick Delay & Incident Broadcast to Depot & Parents</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleReportDelay('Railway Gate Closed - 5m Delay')}
            className="neo-btn px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-black cursor-pointer"
          >
            + Railway Gate Closed (5m Delay)
          </button>
          <button
            onClick={() => handleReportDelay('Heavy Highway Traffic near Toll - 8m Delay')}
            className="neo-btn px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-black cursor-pointer"
          >
            + Heavy Highway Traffic (8m Delay)
          </button>
          <button
            onClick={() => handleReportDelay('Minor Puncture / Tire Issue - Waiting Spares')}
            className="neo-btn px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-950 text-xs font-bold border border-black cursor-pointer"
          >
            + Minor Tire Issue (Depot Alert)
          </button>
        </div>
      </div>

      {/* ================= MODAL: DIGITAL PASS QR SCANNER FOR DRIVER ================= */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white border-4 border-black rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-neo-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-black p-4 sm:p-5 bg-white shrink-0">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-black text-[#86efac] text-[10px] font-bold mb-1">
                  <Camera className="w-3.5 h-3.5 text-[#86efac] animate-pulse" />
                  <span>TNSTC DIGITAL PASS QR ATTENDANCE SCANNER</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight lowercase">
                  scan student digital pass
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Point camera at student's pass or tap their pass chip below for instant boarding attendance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsQrScannerOpen(false)}
                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-slate-100 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {/* Camera Scanner Viewfinder */}
              <div className="relative w-full h-56 bg-slate-950 rounded-2xl border-3 border-black overflow-hidden flex items-center justify-center shadow-neo-sm">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Status Overlay Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-[#86efac]/50 backdrop-blur-sm text-[10px] font-bold text-[#86efac]">
                    <span className="w-2 h-2 rounded-full bg-[#86efac] animate-ping"></span>
                    <span>LIVE SCANNING ACTIVE</span>
                  </div>
                  {isProcessingCode && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold border border-black shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-spin"></span>
                      <span>Verifying Pass...</span>
                    </div>
                  )}
                </div>

                {/* Viewfinder Target Frame */}
                <div className="absolute inset-6 border-2 border-white/40 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2">
                  <div className="w-full flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-[#86efac]"></span>
                    <span className="w-4 h-4 border-t-2 border-r-2 border-[#86efac]"></span>
                  </div>

                  {/* Animated Laser Line */}
                  <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>

                  <div className="w-full flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-[#86efac]"></span>
                    <span className="w-4 h-4 border-b-2 border-r-2 border-[#86efac]"></span>
                  </div>
                </div>

                {!cameraActive && (
                  <div className="text-center p-4 text-white space-y-1 z-10">
                    <QrCode className="w-10 h-10 text-[#86efac] mx-auto animate-pulse" />
                    <span className="text-xs font-bold block">QR Scanner Ready</span>
                    <span className="text-[10px] text-slate-400 block">
                      Camera stream or 1-tap pass recognition active
                    </span>
                  </div>
                )}
              </div>

              {/* Scan Feedback Status Banner */}
              {qrScanFeedback && (
                <div
                  className={`p-3.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    qrScanFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-800 shadow-neo-sm'
                      : 'bg-red-50 text-red-950 border-red-700 shadow-neo-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {qrScanFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-700 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <p className="font-bold text-sm leading-snug">{qrScanFeedback.text}</p>
                        {qrScanFeedback.student && (
                          <p className="text-[11px] font-normal text-slate-700">
                            Student: <strong>{qrScanFeedback.student.name}</strong> • Stop: {qrScanFeedback.student.stopName} • Parent: +91 {qrScanFeedback.student.parentPhone}
                          </p>
                        )}
                        {qrScanFeedback.type === 'error' && (
                          <p className="text-[10px] font-normal text-red-800 flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block"></span>
                            Camera is still scanning live! Point camera at a valid TNSTC student pass QR to mark attendance.
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQrScanFeedback(null);
                        lastScannedCodeRef.current = '';
                      }}
                      className="text-[10px] px-2.5 py-1 bg-white hover:bg-slate-100 border border-black rounded-lg font-mono font-bold text-slate-800 shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* 1-Tap Quick Scan Buttons for All Students on Route */}
              <div className="space-y-2 pt-1 border-t border-black/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick-Scan Student Digital Passes (1-Tap):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Simulates QR Camera Scan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {myStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isProcessingCode}
                      onClick={() => handleScanPayload(s.id)}
                      className={`p-2.5 rounded-xl border-2 border-black text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        s.isBoarded
                          ? 'bg-[#86efac]/50 hover:bg-[#86efac] text-slate-950'
                          : 'bg-white hover:bg-slate-100 text-slate-900 shadow-neo-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{s.name}</span>
                          <span className="text-[10px] text-slate-500">({s.id})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal block">
                          Stop: {s.stopName}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border border-black font-bold ${
                          s.isBoarded ? 'bg-[#86efac] text-slate-950' : 'bg-black text-white'
                        }`}
                      >
                        {s.isBoarded ? '✓ Boarded' : 'Scan QR ➔'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Barcode Gun / Manual Pass ID Input */}
              <form onSubmit={handleManualSubmit} className="space-y-1.5 pt-1 border-t border-black/10">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Scan / Type Student Pass ID (Barcode Input):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Enter or scan pass code (e.g. STU-101)"
                    className="flex-1 text-xs font-mono font-bold p-2.5 border-2 border-black rounded-xl bg-slate-50 outline-none focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="neo-btn px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    Verify Pass
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-black bg-slate-50 shrink-0 flex items-center justify-between text-[11px] text-slate-500">
              <span>DLT Template G.O. Ms. No. 42 • Realtime SMSMobileAPI</span>
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(false)}
                className="font-bold text-slate-700 hover:text-black underline cursor-pointer"
              >
                Done / Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
