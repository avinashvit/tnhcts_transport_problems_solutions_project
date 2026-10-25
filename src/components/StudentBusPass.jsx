import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Award,
  QrCode,
  Printer,
  CheckCircle2,
  ShieldCheck,
  User,
  Bus,
  School,
  Maximize2,
  Clock,
  Sparkles,
  Phone,
  Radio,
  X,
} from 'lucide-react';
import { useLiveDatabase } from '../context/LiveDatabaseContext';

export default function StudentBusPass() {
  const { currentUser, students, buses, liveClockTime } = useLiveDatabase();

  // If logged in as student, prioritize current student; else default to first student slot
  const defaultStudent =
    students?.find((s) => s.id === currentUser?.id) ||
    students?.[0] || {
      id: 'STU-101',
      name: 'Student 1',
      classGrade: '10th Standard A',
      schoolName: 'Government Higher Secondary School',
      busId: 'BUS-14A',
      routeNumber: '14A (School Route)',
      stopName: 'Morappur Bus Stand',
      parentPhone: '73059 40480',
      isBoarded: false,
      status: 'Waiting at Stop',
    };

  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudent.id);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isLargeQrOpen, setIsLargeQrOpen] = useState(false);

  // Sync if currentUser changes
  useEffect(() => {
    if (currentUser?.id && currentUser.id.startsWith('STU')) {
      setSelectedStudentId(currentUser.id);
    }
  }, [currentUser?.id]);

  const activeStudent =
    students?.find((s) => s.id === selectedStudentId) || defaultStudent;

  const assignedBus =
    buses?.find((b) => b.id === activeStudent.busId) || buses?.[0] || {
      routeNumber: '14A (School Route)',
      busRegNo: 'TN-29-N-1842',
      driverName: 'Driver 1',
      destinationSchool: 'Government Higher Secondary School',
    };

  const isBusAtSchool =
    assignedBus.statusType === 'arrived' ||
    assignedBus.progress >= 100 ||
    assignedBus.currentStopIndex >= (assignedBus.stops?.length || 1) - 1 ||
    Boolean(assignedBus.schoolArrival);

  const isStudentArrived =
    (isBusAtSchool || activeStudent.status === 'Safely Arrived at School Gate' || Boolean(activeStudent.arrivedSchoolTime)) &&
    activeStudent.isBoarded;

  const isStudentMissed =
    (isBusAtSchool || activeStudent.isMissed) &&
    !activeStudent.isBoarded;

  // Generate real, standard scannable QR code
  useEffect(() => {
    const passPayload = JSON.stringify({
      id: activeStudent.id,
      name: activeStudent.name,
      busId: activeStudent.busId,
      stop: activeStudent.stopName,
      phone: activeStudent.parentPhone,
      type: 'TNSTC_STUDENT_PASS',
      valid: '2026-2027',
    });

    QRCode.toDataURL(passPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [activeStudent]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TAMIL NADU SCHOOL EDUCATION & TNSTC • DIGITAL BUS PASS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 lowercase tracking-tight mt-0.5">
            digital free student bus pass
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Instant scannable QR commuter pass under Tamil Nadu G.O. Ms. No. 42 (100% Free Travel Scheme).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Student Slot Selector (for prototype/multi-student viewing) */}
          {students && students.length > 1 && (
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs font-bold bg-white border-2 border-black rounded-xl px-2.5 py-2 outline-none shadow-neo-sm text-slate-900 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="neo-btn px-4 py-2 bg-black text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#86efac]" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* Real-time Synchronized Attendance Status Bar */}
      <div
        className={`p-4 rounded-2xl border-2 border-black shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isStudentArrived
            ? 'bg-blue-50 border-blue-600'
            : isStudentMissed
            ? 'bg-red-50 border-red-600'
            : activeStudent.isBoarded
            ? 'bg-emerald-50 border-emerald-600'
            : 'bg-amber-50 border-amber-500'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-bold text-lg shadow-neo-sm ${
              isStudentArrived
                ? 'bg-blue-600 text-white'
                : isStudentMissed
                ? 'bg-red-600 text-white'
                : activeStudent.isBoarded
                ? 'bg-[#10b981] text-white'
                : 'bg-amber-400 text-slate-950'
            }`}
          >
            {isStudentArrived
              ? '🏫'
              : isStudentMissed
              ? '✕'
              : activeStudent.isBoarded
              ? '✓'
              : '⏱'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                LIVE ATTENDANCE TELEMETRY
              </span>
              <span className="text-xs text-slate-600 font-bold">
                Live Clock: <strong>{liveClockTime}</strong>
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {isStudentArrived ? (
                <span className="text-blue-900 font-bold">
                  ✓ Safely Arrived at School Campus Gate ({activeStudent.arrivedSchoolTime || assignedBus.actualArrivalTime || assignedBus.schoolArrival || liveClockTime})
                </span>
              ) : isStudentMissed ? (
                <span className="text-red-900 font-bold">
                  ⚠️ Bus Missed / Not Boarded: Bus completed route to School Gate. Student was not boarded at {activeStudent.stopName}.
                </span>
              ) : activeStudent.isBoarded ? (
                <span className="text-emerald-900">
                  ✓ On Board Bus {assignedBus.routeNumber.split(' ')[0]} (Boarded at {activeStudent.boardedTime})
                </span>
              ) : (
                <span className="text-amber-900">
                  ⏱ Waiting at {activeStudent.stopName} • Ready for Driver QR Scan
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLargeQrOpen(true)}
          className="neo-btn px-3 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 border border-black rounded-lg shadow-neo-sm cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5 text-black" />
          <span>[ 📱 Enlarge QR for Driver Scanning ]</span>
        </button>
      </div>

      {/* Official Tamil Nadu Smart Student Bus Pass Card */}
      <div className="max-w-xl mx-auto bg-white border-3 border-black rounded-3xl shadow-neo-lg overflow-hidden">
        {/* Pass Top Ribbon */}
        <div className="bg-black text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-bold text-lg shadow-neo-sm">
              🏛️
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase block">
                GOVERNMENT OF TAMIL NADU
              </span>
              <span className="text-[10px] text-slate-400 block">
                TAMIL NADU STATE TRANSPORT CORPORATION (TNSTC)
              </span>
            </div>
          </div>

          <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded bg-[#86efac] text-slate-950 font-bold border border-black">
            PASS 2026-27
          </span>
        </div>

        {/* Pass Body */}
        <div className="p-5 sm:p-7 space-y-5 bg-[#fffdfa]">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Student Photo & ID Badge */}
            <div className="w-28 h-32 border-2 border-black rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-center p-2 flex-shrink-0 shadow-neo-sm mx-auto sm:mx-0">
              <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg border-2 border-black mb-1">
                {activeStudent.id.slice(-3)}
              </div>
              <span className="text-[10px] font-bold text-slate-900 font-mono block">
                {activeStudent.id}
              </span>
              <span className="text-[8px] font-bold text-emerald-800 uppercase bg-[#86efac] px-1.5 py-0.2 rounded mt-0.5">
                VERIFIED
              </span>
            </div>

            {/* Student Particulars */}
            <div className="flex-1 space-y-2 text-xs w-full">
              <div className="border-b border-black/10 pb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Student Commuter Name:
                </span>
                <strong className="text-lg text-slate-900 block font-bold font-mono">
                  {activeStudent.name}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Class / Grade:</span>
                  <strong className="text-slate-800">{activeStudent.classGrade}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Parent Mobile:</span>
                  <strong className="text-blue-900 font-mono font-bold">+91 {activeStudent.parentPhone}</strong>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Government School:
                </span>
                <strong className="text-slate-900 text-xs block leading-tight">
                  {activeStudent.schoolName}
                </strong>
              </div>
            </div>
          </div>

          {/* Assigned Feeder Bus Corridor & Pickup Stop */}
          <div className="p-3.5 bg-slate-50 border-2 border-black rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
              <span>Authorized Feeder Corridor:</span>
              <span className="text-emerald-800 font-bold bg-[#86efac] px-2 py-0.5 rounded border border-black">
                100% FREE TRAVEL
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-blue-700" />
              <span>{assignedBus.routeNumber} ({assignedBus.busRegNo || 'TNSTC'})</span>
            </div>
            <div className="text-[11px] text-slate-600 pt-1 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Pickup Stop: <strong className="text-slate-900">{activeStudent.stopName}</strong></span>
              <span>➔ Destination: <strong className="text-slate-900">School Gate</strong></span>
            </div>
          </div>

          {/* Scannable Digital QR Code & Driver Scanning Instruction */}
          <div className="p-4 bg-white border-2 border-black rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                onClick={() => setIsLargeQrOpen(true)}
                className="w-24 h-24 border-2 border-black rounded-xl p-1 bg-white flex items-center justify-center shadow-neo-sm cursor-pointer hover:scale-105 transition-transform"
                title="Click to Enlarge QR Code for Scanning"
              >
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Student Digital Pass QR" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-14 h-14 text-slate-400 animate-pulse" />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-[#86efac] px-2 py-0.5 rounded border border-black inline-block">
                  SCANNABLE ATTENDANCE QR
                </span>
                <h4 className="font-bold text-slate-900 text-xs">
                  Driver / Conductor QR Pass
                </h4>
                <p className="text-[11px] text-slate-600 max-w-xs leading-tight">
                  Present this QR to the bus driver. Once scanned, your attendance is recorded and your parent receives an instant cellular SMS.
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-black/10 sm:pl-4 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
              <div className="w-16 h-8 border border-black border-dashed rounded flex items-center justify-center text-[9px] text-slate-400 font-bold">
                [ CEO SEAL ]
              </div>
              <span className="text-[9px] text-slate-500 font-bold block mt-1">
                TN School Edn Dept
              </span>
            </div>
          </div>
        </div>

        {/* Protection Notice */}
        <div className="p-3 bg-emerald-50 border-t-2 border-black text-[11px] text-emerald-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Statutory Rule (G.O. Ms. No. 42):</strong> Government school students in uniform or possessing this digital QR bus pass travel completely free on all TNSTC ordinary services.
          </p>
        </div>
      </div>

      {/* Zero-Phone Student Protocol Callout */}
      <div className="p-4 bg-blue-50 border-2 border-black rounded-2xl shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xl border-2 border-black shadow-neo-sm shrink-0">
            📱
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-200 px-2 py-0.5 rounded border border-blue-400 inline-block">
              ZERO-PHONE STUDENT COMMUTE PROTOCOL
            </span>
            <p className="font-bold text-slate-900 text-xs">
              Students do NOT need to carry a mobile phone.
            </p>
            <p className="text-[11px] text-slate-600 max-w-2xl leading-snug">
              Print or laminate this pass once. The bus driver scans the physical QR card to mark attendance and send live SMS to the parent. During travel, students are protected by the physical AIS-140 red panic button on the bus wall.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="neo-btn px-4 py-2 bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-[#86efac]" />
          <span>Print Physical Pass</span>
        </button>
      </div>

      {/* ================= MODAL: ENLARGED QR CODE FOR INSTANT SCANNING ================= */}
      {isLargeQrOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl max-w-md w-full p-6 shadow-neo-lg text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase bg-black text-[#86efac] px-2 py-0.5 rounded">
                  OFFICIAL ATTENDANCE QR
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {activeStudent.name} ({activeStudent.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLargeQrOpen(false)}
                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-slate-100 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white border-3 border-black rounded-2xl inline-block shadow-neo mx-auto">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Enlarged Student QR Pass"
                  className="w-64 h-64 object-contain mx-auto"
                />
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-mono">
              <p className="font-bold text-slate-900">
                Hold up to Driver Cabin Camera / Scanner
              </p>
              <p className="text-[11px]">
                Valid for Route {assignedBus.routeNumber} • Boarding: {activeStudent.stopName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLargeQrOpen(false)}
              className="w-full neo-btn py-2.5 px-4 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Close QR View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
