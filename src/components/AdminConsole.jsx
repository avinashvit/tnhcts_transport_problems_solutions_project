import React, { useState } from 'react';
import { useLiveDatabase } from '../context/LiveDatabaseContext';
import LiveBusMap from './LiveBusMap';
import {
  Shield,
  Bus,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Smartphone,
  Check,
  RotateCcw,
  FileText,
  Navigation,
  User,
  School,
  Sparkles,
  PlusCircle,
  Trash2,
  Search,
} from 'lucide-react';
import OfficialPetitionModal from './OfficialPetitionModal';

export default function AdminConsole() {
  const {
    currentUser,
    buses,
    drivers,
    students,
    smsLog,
    grievances,
    assignDriverToBus,
    createStudent,
    deleteStudent,
    updateStudent,
    updateDriver,
    resetDatabaseToDefaults,
    updateGrievanceStatus,
    lastSyncTime,
  } = useLiveDatabase();

  const [selectedPetitionIssue, setSelectedPetitionIssue] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // students (default), assignments, fleet, map, grievances, sms
  const [assignmentSelection, setAssignmentSelection] = useState({});
  const [assignmentNotice, setAssignmentNotice] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  // New Student Creation Form State
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    id: `EMIS-${Math.floor(4000 + Math.random() * 5000)}`,
    classGrade: '10th Standard A',
    schoolName: 'Government Higher Secondary School (GHSS), Dharmapuri',
    busId: 'BUS-14A',
    stopName: 'Morappur Bus Stand',
    parentPhone: '98421 XXXXX',
  });
  const [studentCreationNotice, setStudentCreationNotice] = useState(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const totalStudents = students.length;
  const onBoardCount = students.filter((s) => s.isBoarded).length;

  const handleBusSelectionChange = (newBusId) => {
    const selectedBus = buses.find((b) => b.id === newBusId);
    if (!selectedBus) return;
    setNewStudentForm((prev) => ({
      ...prev,
      busId: newBusId,
      schoolName: selectedBus.destinationSchool,
      stopName: selectedBus.stops[0]?.name || '',
    }));
  };

  const handleCreateStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudentForm.name.trim()) {
      alert('Please enter student name.');
      return;
    }
    const created = createStudent(newStudentForm);
    setStudentCreationNotice(
      `✓ Student Role Created: ${created.name} (${created.id}) enrolled to ${created.schoolName.split(',')[0]} on ${created.routeNumber}! Login: ID "${created.id}" • Password "student123"`
    );
    // Reset form with a fresh EMIS ID
    setNewStudentForm({
      name: '',
      id: `EMIS-${Math.floor(4000 + Math.random() * 5000)}`,
      classGrade: '10th Standard A',
      schoolName: 'Government Higher Secondary School (GHSS), Dharmapuri',
      busId: 'BUS-14A',
      stopName: 'Morappur Bus Stand',
      parentPhone: '98421 XXXXX',
    });
    setTimeout(() => setStudentCreationNotice(null), 6000);
  };

  const handleAssignDriver = (busId) => {
    const driverId = assignmentSelection[busId];
    if (!driverId) {
      alert('Please select a driver from the dropdown to assign to this route.');
      return;
    }
    const success = assignDriverToBus(driverId, busId);
    if (success) {
      const drv = drivers?.find((d) => d.id === driverId);
      const bus = buses?.find((b) => b.id === busId);
      setAssignmentNotice(
        `✓ Official Order: Driver ${drv?.name} successfully assigned to ${bus?.routeNumber}! All consoles, maps, and parent mobile trackers updated.`
      );
      setTimeout(() => setAssignmentNotice(null), 6000);
    }
  };

  return (
    <div className="space-y-6 font-mono max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TAMIL NADU STATE TRANSPORT CORPORATION (TNSTC) • COMMAND DESK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight lowercase">
            depot & school authority console
          </h1>
          <p className="text-xs text-slate-600">
            Welcome, <strong>{currentUser?.name || 'District Transport Officer'}</strong>. Monitoring live student feeder fleet, driver progress, and parent safety SMS.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all student data and logs to clean slate (4 student slots & clean drivers)?')) {
                resetDatabaseToDefaults();
              }
            }}
            className="neo-btn px-3 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs border-2 border-black rounded-xl cursor-pointer shadow-neo-sm"
          >
            🧹 Reset to Clean Slate (4 Students)
          </button>
          <div className="flex items-center gap-2 bg-slate-50 p-2 border-2 border-black rounded-xl text-xs flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Sync Active: <strong>{lastSyncTime}</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-neo flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Active Buses
          </span>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            {buses.length}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold mt-1">
            100% GPS Connected
          </span>
        </div>

        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-neo flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Enrolled Students
          </span>
          <div className="text-3xl font-bold text-blue-700 mt-1">
            {totalStudents}
          </div>
          <span className="text-[10px] text-slate-600 font-bold mt-1">
            {onBoardCount} on-board • 1 School / 1 Route Locked
          </span>
        </div>

        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-neo flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Pre-Defined Drivers
          </span>
          <div className="text-3xl font-bold text-emerald-700 mt-1">
            {drivers?.length || 6}
          </div>
          <span className="text-[10px] text-slate-600 font-bold mt-1">
            {drivers?.filter((d) => d.assignedBusId).length || 4} On Corridors • {drivers?.filter((d) => !d.assignedBusId).length || 2} Standby
          </span>
        </div>

        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-neo flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Active Grievances
          </span>
          <div className="text-3xl font-bold text-red-600 mt-1">
            {grievances.filter((g) => g.status !== 'Resolved').length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Under Depot Review
          </span>
        </div>
      </div>

      {/* View Switcher Tabs - Student & Driver Management Up Front */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all border-2 border-black flex items-center gap-1.5 ${
            activeTab === 'students'
              ? 'bg-[#86efac] text-slate-950 shadow-neo-sm ring-2 ring-black'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <School className="w-3.5 h-3.5" />
          <span>🎓 Create & Manage Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all border-2 border-black flex items-center gap-1.5 ${
            activeTab === 'assignments'
              ? 'bg-amber-300 text-slate-950 shadow-neo-sm ring-2 ring-black'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>👨‍✈️ Pre-Defined Drivers & Bus Routes</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all border-2 border-black ${
            activeTab === 'fleet'
              ? 'bg-black text-white shadow-neo-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          🚌 Live Bus Fleet Monitor ({buses.length})
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all border-2 border-black flex items-center gap-1.5 ${
            activeTab === 'map'
              ? 'bg-emerald-400 text-slate-950 shadow-neo-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>🗺️ Tamil Nadu Fleet GPS Map (Live)</span>
        </button>

        <button
          onClick={() => setActiveTab('grievances')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all border-2 border-black ${
            activeTab === 'grievances'
              ? 'bg-black text-white shadow-neo-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          ⚠️ Grievances Register ({grievances.length})
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`px-4 py-2 rounded text-xs font-bold transition-all border-2 border-black ${
            activeTab === 'sms'
              ? 'bg-black text-white shadow-neo-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          📲 Parent Mobile SMS Broadcast Log ({smsLog.length})
        </button>
      </div>

      {/* Student Creation Notification Toast */}
      {studentCreationNotice && (
        <div className="p-3.5 bg-emerald-100 border-2 border-black rounded-xl text-xs font-bold text-slate-950 flex items-center justify-between shadow-neo-sm animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 flex-shrink-0" />
            <span>{studentCreationNotice}</span>
          </div>
          <span className="text-[10px] text-slate-700">Sync: {lastSyncTime}</span>
        </div>
      )}

      {/* Assignment Success Notification Toast */}
      {assignmentNotice && (
        <div className="p-3.5 bg-amber-200 border-2 border-black rounded-xl text-xs font-bold text-slate-950 flex items-center justify-between shadow-neo-sm animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 flex-shrink-0" />
            <span>{assignmentNotice}</span>
          </div>
          <span className="text-[10px] text-slate-700">Sync: {lastSyncTime}</span>
        </div>
      )}

      {/* TAB 1: FLEET MONITOR */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            // Real-time synchronization: As drivers tap on their mobile cabins, progress updates here immediately.
          </div>

          <div className="space-y-4">
            {buses.map((bus) => {
              const currentStopName = bus.stops[bus.currentStopIndex]?.name || 'Origin';
              const nextStopName = bus.stops[bus.currentStopIndex + 1]?.name || 'School Gate';

              return (
                <div
                  key={bus.id}
                  className="bg-white border-2 border-black rounded-2xl shadow-neo p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/10 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-black text-white">
                        {bus.routeNumber.split(' ')[0]}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {bus.originVillage} ➔ {bus.destinationSchool}
                        </h3>
                        <span className="text-[11px] text-slate-500">
                          Reg: <strong>{bus.busRegNo}</strong> • Driver: {bus.driverName} ({bus.driverPhone})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded border border-black font-bold ${
                          bus.statusType === 'arrived'
                            ? 'bg-[#86efac] text-slate-950'
                            : bus.statusType === 'delayed'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {bus.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress & Speed Line */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-black rounded">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        Current Stop:
                      </span>
                      <strong className="text-slate-900 block mt-0.5 truncate">
                        {currentStopName}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-black rounded">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        Next Approaching:
                      </span>
                      <strong className="text-blue-800 block mt-0.5 truncate">
                        {nextStopName}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-black rounded">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        Telemetry Speed:
                      </span>
                      <strong className="text-slate-900 block mt-0.5">
                        {bus.speed} km/h
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-black rounded">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        Crowd Level:
                      </span>
                      <strong className="text-emerald-800 block mt-0.5 truncate">
                        {bus.crowdLevel}
                      </strong>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Trip Progress</span>
                      <span>{bus.progress}% Complete</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 border border-black rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black transition-all duration-500"
                        style={{ width: `${bus.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: LIVE TAMIL NADU FLEET GPS MAP */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  TNSTC CENTRAL DEPOT • STATEWIDE GEOGRAPHIC RADAR
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Tamil Nadu School Feeder Fleet Monitoring
              </h2>
              <p className="text-xs text-slate-600">
                Click any bus marker or stop on the map to inspect live driver telemetry, speed, students on board, and punctuality.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-black px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-950 flex-shrink-0">
              <span>● 4 Corridors Synchronized</span>
            </div>
          </div>

          <LiveBusMap
            selectedBusId="all"
            height="580px"
            showControls={true}
          />
        </div>
      )}

      {/* TAB: CREATE & MANAGE STUDENT ROLES (ADMIN EXCLUSIVE) */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  ADMIN REGISTRATION PORTAL • EMIS STUDENT TRANSPORT ENROLLMENT
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Create & Manage Student Commuter Roles
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                Admin holds exclusive rights to create student accounts. Every student created is strictly bound to <strong>1 Government School</strong> and <strong>1 Pre-Defined Feeder Route</strong> (G.O. Ms. No. 42). Created students appear immediately on the login portal.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-black px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-950 flex-shrink-0 shadow-neo-sm">
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Admin Role Creation Gateway</span>
            </div>
          </div>

          {/* Form: Enroll New Student Commuter */}
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-neo space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>Enroll New Student Commuter Form</span>
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 border border-black px-2 py-0.5 rounded">
                1 Student = 1 School & 1 Route
              </span>
            </div>

            <form onSubmit={handleCreateStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* 1. Student Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block uppercase text-[10px]">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.name}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, name: e.target.value })
                    }
                    placeholder="e.g. M. Kaviya / A. Saravanan"
                    className="w-full font-bold bg-slate-50 border-2 border-black rounded-lg p-2.5 outline-none focus:bg-white focus:border-emerald-600 shadow-neo-sm"
                  />
                </div>

                {/* 2. EMIS ID */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block uppercase text-[10px]">
                    EMIS Registration ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.id}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, id: e.target.value })
                    }
                    placeholder="e.g. EMIS-4825"
                    className="w-full font-bold bg-slate-50 border-2 border-black rounded-lg p-2.5 outline-none focus:bg-white shadow-neo-sm font-mono"
                  />
                </div>

                {/* 3. Class & Standard */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block uppercase text-[10px]">
                    Class & Standard *
                  </label>
                  <select
                    value={newStudentForm.classGrade}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, classGrade: e.target.value })
                    }
                    className="w-full font-bold bg-slate-50 border-2 border-black rounded-lg p-2.5 outline-none focus:bg-white shadow-neo-sm cursor-pointer"
                  >
                    <option value="6th Standard">6th Standard</option>
                    <option value="7th Standard">7th Standard</option>
                    <option value="8th Standard A">8th Standard A</option>
                    <option value="9th Standard A">9th Standard A</option>
                    <option value="9th Standard B">9th Standard B</option>
                    <option value="10th Standard A">10th Standard A (SSLC)</option>
                    <option value="10th Standard B">10th Standard B (SSLC)</option>
                    <option value="10th Standard C">10th Standard C (SSLC)</option>
                    <option value="11th Standard Bio">11th Standard (Biology Group)</option>
                    <option value="11th Standard CS">11th Standard (Computer Science)</option>
                    <option value="12th Standard Maths">12th Standard (Maths Biology)</option>
                    <option value="12th Standard Arts">12th Standard (Arts & Commerce)</option>
                  </select>
                </div>

                {/* 4. Assign 1 Pre-defined Feeder Route */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block uppercase text-[10px]">
                    1 Assigned Pre-Defined Feeder Route *
                  </label>
                  <select
                    value={newStudentForm.busId}
                    onChange={(e) => handleBusSelectionChange(e.target.value)}
                    className="w-full font-bold bg-white border-2 border-black rounded-lg p-2.5 outline-none shadow-neo-sm cursor-pointer focus:bg-amber-50"
                  >
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.routeNumber} [Driver: {b.driverName}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Assign 1 School */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block uppercase text-[10px]">
                    1 Assigned Government School *
                  </label>
                  <select
                    value={newStudentForm.schoolName}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, schoolName: e.target.value })
                    }
                    className="w-full font-bold bg-white border-2 border-black rounded-lg p-2.5 outline-none shadow-neo-sm cursor-pointer"
                  >
                    <option value="Government Higher Secondary School (GHSS), Dharmapuri">
                      GHSS Dharmapuri
                    </option>
                    <option value="Government Model School, Deevattipatti">
                      Govt Model School Deevattipatti
                    </option>
                    <option value="Government Girls Higher Secondary School, Pennagaram">
                      Govt Girls HSS Pennagaram
                    </option>
                    <option value="Government Model School, Shanmuganathapuram">
                      Govt Model School Shanmuganathapuram
                    </option>
                  </select>
                </div>

                {/* 6. Designated Pickup Village Stop */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block uppercase text-[10px]">
                    Designated Village Pickup Stop *
                  </label>
                  <select
                    value={newStudentForm.stopName}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, stopName: e.target.value })
                    }
                    className="w-full font-bold bg-white border-2 border-black rounded-lg p-2.5 outline-none shadow-neo-sm cursor-pointer"
                  >
                    {buses
                      .find((b) => b.id === newStudentForm.busId)
                      ?.stops.map((st, i) => (
                        <option key={i} value={st.name}>
                          {st.name} {st.isSchool ? '(School Gate Drop)' : `(Pickup @ ${st.time})`}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 7. Parent Mobile Phone */}
                <div className="space-y-1 md:col-span-2 lg:col-span-3">
                  <label className="font-bold text-slate-700 block uppercase text-[10px]">
                    Parent Mobile Number (For Live SMS Alerts on Boarding/Arrival) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudentForm.parentPhone}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, parentPhone: e.target.value })
                    }
                    placeholder="e.g. 98421 78901"
                    className="w-full font-bold bg-slate-50 border-2 border-black rounded-lg p-2.5 outline-none focus:bg-white shadow-neo-sm font-mono max-w-md"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-3 border-t-2 border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Enrolling creates an active student credential usable immediately on the login portal (Default Password: <strong className="text-slate-800">student123</strong>).
                </span>
                <button
                  type="submit"
                  className="neo-btn py-2.5 px-6 bg-[#86efac] hover:bg-[#6ee7b7] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-neo-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>[ ✓ Create & Register Student Role ➔ ]</span>
                </button>
              </div>
            </form>
          </div>

          {/* Directory of Enrolled Students */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-neo space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-700" />
                  <span>Enrolled Student Commuters ({students.length} Registered)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Every commuter profile is verified with 1 school and 1 route. Admin can manage or remove roles.
                </p>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Search by student name or EMIS..."
                  className="text-xs bg-slate-50 border border-black rounded pl-8 pr-3 py-1.5 outline-none focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-black text-[11px] text-slate-700 uppercase">
                    <th className="p-2.5">EMIS ID</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5">Class</th>
                    <th className="p-2.5">1 Assigned School</th>
                    <th className="p-2.5">1 Designated Route</th>
                    <th className="p-2.5">Pickup Stop</th>
                    <th className="p-2.5">Parent Mobile</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {students
                    .filter((s) => {
                      if (!studentSearchQuery) return true;
                      const q = studentSearchQuery.toLowerCase();
                      return (
                        s.name.toLowerCase().includes(q) ||
                        s.id.toLowerCase().includes(q) ||
                        s.schoolName.toLowerCase().includes(q)
                      );
                    })
                    .map((stu) => {
                      const busInfo = buses.find((b) => b.id === stu.busId);
                      return (
                        <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-bold">{stu.id}</td>
                          <td className="p-2.5 font-bold text-slate-900">{stu.name}</td>
                          <td className="p-2.5 text-slate-600">{stu.classGrade}</td>
                          <td className="p-2.5 font-bold text-blue-900 max-w-xs truncate" title={stu.schoolName}>
                            {stu.schoolName}
                          </td>
                          <td className="p-2.5 font-bold text-emerald-800">
                            {stu.routeNumber}{' '}
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({busInfo?.driverName || 'Pre-Defined'})
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-700">{stu.stopName}</td>
                          <td className="p-2.5 font-mono text-slate-600">{stu.parentPhone}</td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingStudent(stu)}
                                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 px-2.5 py-1 rounded cursor-pointer"
                                title="Edit Student Name & Parent Mobile"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Are you sure you want to remove student commuter role for ${stu.name} (${stu.id})?`
                                    )
                                  ) {
                                    deleteStudent(stu.id);
                                  }
                                }}
                                className="text-[11px] font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-300 px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                                title="Delete Student Role"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DRIVER & ROUTE ASSIGNMENT DESK (PRE-DEFINED DRIVERS) */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  OFFICIAL DISPATCHER DESK • TNSTC DRIVER-TO-ROUTE ALLOCATION
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Driver Allocation & Route Assignment Controller
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                As the <strong>District Transport Officer</strong>, you assign and reassign certified drivers to Tamil Nadu government school feeder corridors. Assignments take effect immediately across all on-road driver consoles and parent live trackers.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-amber-100 border-2 border-black px-3 py-1.5 rounded-lg text-xs font-bold text-amber-950 flex-shrink-0 shadow-neo-sm">
              <Shield className="w-4 h-4 text-black" />
              <span>Admin Allocation Authority</span>
            </div>
          </div>

          {/* Section 1: Route-to-Driver Assignment Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-emerald-700" />
                <span>Active Bus Routes & Driver Assignment Matrix</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                {buses.length} Feeder Routes Under Your Jurisdiction
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buses.map((bus) => {
                const assignedDriver = drivers?.find(
                  (d) => d.id === bus.driverId || d.assignedBusId === bus.id
                );
                const currentSelectedDriverId =
                  assignmentSelection[bus.id] || assignedDriver?.id || '';

                return (
                  <div
                    key={bus.id}
                    className="bg-white border-2 border-black rounded-xl p-5 shadow-neo space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Route Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-black/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-black text-white text-xs font-bold font-mono">
                              {bus.routeNumber.split(' ')[0]}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {bus.routeNumber}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 font-bold mt-1">
                            {bus.originVillage} ➔ {bus.destinationSchool.split(',')[0]}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Vehicle: <strong>{bus.busRegNo}</strong> • {bus.depot}
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-black whitespace-nowrap">
                          {bus.statusType === 'arrived' ? 'Arrived' : 'In Transit'}
                        </span>
                      </div>

                      {/* Current Assigned Driver Information */}
                      <div className="mt-3 p-3 bg-slate-50 border border-black rounded-lg space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                          <span>Currently Assigned Driver:</span>
                          <span className="text-emerald-700 font-bold">● Active on Cabin</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                            <User className="w-4 h-4 text-blue-700" />
                            <span>{bus.driverName}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {bus.driverPhone}
                          </span>
                        </div>

                        {assignedDriver && (
                          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-black/10">
                            <span>License: {assignedDriver.licenseNo}</span>
                            <span>Exp: {assignedDriver.experience}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reassign Driver Interactive Form */}
                    <div className="pt-3 border-t-2 border-black/10 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        Reassign Driver to This Bus Route:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={currentSelectedDriverId}
                          onChange={(e) =>
                            setAssignmentSelection((prev) => ({
                              ...prev,
                              [bus.id]: e.target.value,
                            }))
                          }
                          className="flex-1 text-xs font-bold bg-white border-2 border-black rounded px-2.5 py-1.5 outline-none shadow-neo-sm focus:bg-amber-50 cursor-pointer"
                        >
                          <option value="">-- Select Driver to Assign --</option>
                          {drivers?.map((drv) => {
                            const isAssignedHere = drv.assignedBusId === bus.id;
                            const isAssignedElsewhere =
                              drv.assignedBusId && drv.assignedBusId !== bus.id;
                            return (
                              <option key={drv.id} value={drv.id}>
                                {drv.name} ({drv.id}) {isAssignedHere ? '★ (Currently Assigned)' : isAssignedElsewhere ? `[On ${drv.assignedRouteNumber.split(' ')[0]}]` : '[Standby Available]'}
                              </option>
                            );
                          })}
                        </select>

                        <button
                          onClick={() => handleAssignDriver(bus.id)}
                          className="neo-btn text-xs font-bold py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-1 whitespace-nowrap shadow-neo-sm"
                        >
                          <span>Confirm Assignment</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: All Registered Drivers Fleet Roster */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-neo space-y-3">
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-700" />
                  <span>Depot Driver Roster & Status</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  All certified government school feeder bus drivers registered under TNSTC depot pool.
                </p>
              </div>
              <span className="text-xs font-bold bg-slate-100 border border-black px-2.5 py-1 rounded">
                Total Drivers: {drivers?.length || 6}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-black text-[11px] text-slate-700 uppercase">
                    <th className="p-2.5">Driver ID</th>
                    <th className="p-2.5">Driver Name</th>
                    <th className="p-2.5">License & Exp</th>
                    <th className="p-2.5">Contact</th>
                    <th className="p-2.5">Currently Assigned Route</th>
                    <th className="p-2.5">Depot</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {drivers?.map((drv) => {
                    const isStandby = !drv.assignedBusId;
                    return (
                      <tr key={drv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold">{drv.id}</td>
                        <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center border border-black">
                            {drv.photoBadge || 'DR'}
                          </span>
                          <span>{drv.name}</span>
                        </td>
                        <td className="p-2.5 text-slate-600">
                          <div>{drv.licenseNo}</div>
                          <span className="text-[10px] text-slate-400">{drv.experience}</span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-700">{drv.phone}</td>
                        <td className="p-2.5 font-bold">
                          {isStandby ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                              Standby / Ready
                            </span>
                          ) : (
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                              {drv.assignedRouteNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-600">{drv.depot.split(' ')[0]}</td>
                        <td className="p-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isStandby
                                ? 'bg-amber-100 text-amber-950 border-amber-700'
                                : 'bg-emerald-100 text-emerald-950 border-emerald-700'
                            }`}
                          >
                            ● {drv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Student Feeder Allocation Compliance Roster */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-neo space-y-3">
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-purple-700" />
                  <span>Student Route & School Compliance Roster (1 Student = 1 School & 1 Route)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Enforces strict single-school, single-route linkage per government commuter under G.O. Ms. No. 42.
                </p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-950 border border-black px-2.5 py-1 rounded">
                ✓ {students.length} Students Compliant
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-black text-[11px] text-slate-700 uppercase">
                    <th className="p-2.5">EMIS ID</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5">Class/Grade</th>
                    <th className="p-2.5">1 Assigned School</th>
                    <th className="p-2.5">1 Assigned Feeder Route</th>
                    <th className="p-2.5">Designated Stop</th>
                    <th className="p-2.5">Parent Mobile</th>
                    <th className="p-2.5">Boarding Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold">{stu.id}</td>
                      <td className="p-2.5 font-bold text-slate-900">{stu.name}</td>
                      <td className="p-2.5 text-slate-600">{stu.classGrade}</td>
                      <td className="p-2.5 font-bold text-blue-900 max-w-xs truncate" title={stu.schoolName}>
                        {stu.schoolName}
                      </td>
                      <td className="p-2.5 font-bold text-emerald-800">
                        {stu.routeNumber}
                      </td>
                      <td className="p-2.5 text-slate-700">{stu.stopName}</td>
                      <td className="p-2.5 font-mono text-slate-600">{stu.parentPhone}</td>
                      <td className="p-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            stu.isBoarded
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-700'
                              : stu.isMissed
                              ? 'bg-red-100 text-red-950 border-red-700'
                              : 'bg-slate-100 text-slate-700 border-black'
                          }`}
                        >
                          {stu.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRIEVANCES REDRESSAL DESK */}
      {activeTab === 'grievances' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            // Grievances reported by students & parents. Admin can update status and dispatch depot actions.
          </div>

          <div className="space-y-4">
            {grievances.map((g) => (
              <div
                key={g.id}
                className="bg-white border-2 border-black rounded-2xl shadow-neo p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/10 gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-black text-white">
                        #{g.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        Reported: {g.reportedDate}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-black font-bold">
                        {g.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {g.village} ➔ {g.schoolName} ({g.district} District)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded font-bold border border-black ${
                        g.status === 'Resolved'
                          ? 'bg-[#86efac] text-slate-950'
                          : g.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {g.status}
                    </span>

                    <button
                      onClick={() =>
                        updateGrievanceStatus(
                          g.id,
                          g.status === 'Resolved' ? 'In Progress' : 'Resolved',
                          'Action verified by TNSTC Depot Traffic Inspector.'
                        )
                      }
                      className="neo-btn text-xs px-2.5 py-1 bg-white hover:bg-black hover:text-white font-bold"
                    >
                      {g.status === 'Resolved' ? 'Re-open' : 'Mark Resolved ✓'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 border border-black rounded-lg">
                  "{g.description}"
                </p>

                <div className="p-3 bg-purple-50/50 border border-black rounded-lg text-xs space-y-1">
                  <div className="font-bold text-slate-900">Official Depot Action Remarks:</div>
                  <p className="text-slate-700 italic">"{g.officialNotes}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PARENT SMS BROADCAST LOG */}
      {activeTab === 'sms' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            // Real-time audit log of SMS notifications sent to student parents' mobile phones.
          </div>

          <div className="space-y-2.5">
            {smsLog.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-900 text-white rounded-xl border-2 border-black text-xs font-mono flex items-start justify-between gap-4 shadow-neo-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        log.type === 'irregular_behavior'
                          ? 'bg-red-600 text-white animate-pulse'
                          : log.type === 'arrived'
                          ? 'bg-blue-400 text-slate-950'
                          : 'bg-[#10b981] text-black'
                      }`}
                    >
                      {log.type === 'irregular_behavior'
                        ? '🚨 SAFETY REPORT'
                        : log.type === 'arrived'
                        ? '🏫 SCHOOL ARRIVAL'
                        : '🟢 BOARDED SMS'}
                    </span>
                    <span className="text-[#86efac] font-bold text-[11px]">
                      {log.busId}
                    </span>
                    {log.phone && (
                      <span className="text-[10px] text-slate-400">
                        To: +91 {log.phone}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {log.message}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for official legal petition if opened */}
      {selectedPetitionIssue && (
        <OfficialPetitionModal
          issue={selectedPetitionIssue}
          onClose={() => setSelectedPetitionIssue(null)}
        />
      )}

      {/* Modal for editing student details (Name, Friend Phone, Class, Stop) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl max-w-md w-full p-6 shadow-neo space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  COMMUTER PROFILE EDITOR
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  Edit Student: {editingStudent.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-800">Student Name *</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  placeholder="e.g. Rahul S."
                  className="w-full p-2.5 border-2 border-black rounded-xl bg-slate-50 font-bold outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-800">
                  Friend / Parent Mobile Phone (For Real SMS Alerts) *
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-2 bg-slate-100 border-2 border-black rounded-xl font-bold font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={editingStudent.parentPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    placeholder="e.g. 73059 40480"
                    className="flex-1 p-2.5 border-2 border-black rounded-xl bg-slate-50 font-mono font-bold outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1 text-slate-800">Class / Grade</label>
                  <input
                    type="text"
                    value={editingStudent.classGrade}
                    onChange={(e) => setEditingStudent({ ...editingStudent, classGrade: e.target.value })}
                    placeholder="10th Std A"
                    className="w-full p-2 border-2 border-black rounded-xl bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-800">Pickup Stop</label>
                  <input
                    type="text"
                    value={editingStudent.stopName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, stopName: e.target.value })}
                    placeholder="Stop Name"
                    className="w-full p-2 border-2 border-black rounded-xl bg-slate-50 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-black underline cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateStudent(editingStudent.id, {
                    name: editingStudent.name,
                    parentPhone: editingStudent.parentPhone,
                    classGrade: editingStudent.classGrade,
                    stopName: editingStudent.stopName,
                  });
                  setEditingStudent(null);
                }}
                className="neo-btn px-4 py-2 bg-[#86efac] hover:bg-[#6ee7b7] text-slate-950 font-bold text-xs border-2 border-black rounded-xl shadow-neo-sm cursor-pointer"
              >
                ✓ Save & Update Commuter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
