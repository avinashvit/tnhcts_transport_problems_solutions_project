import React, { useState } from 'react';
import { useLiveDatabase, SEED_STUDENTS, SEED_DRIVERS, SINGLE_ADMIN } from '../context/LiveDatabaseContext';
import {
  Bus,
  Smartphone,
  Shield,
  User,
  ArrowRight,
  CheckCircle2,
  Lock,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function RoleLoginPage() {
  const { login, resetDatabaseToDefaults, drivers, students, buses } = useLiveDatabase();

  const studentList = students && students.length > 0 ? students : SEED_STUDENTS;
  const driverList = drivers && drivers.length > 0 ? drivers : SEED_DRIVERS;

  // Active Login Role Tab: 'student_parent' | 'driver' | 'admin'
  const [activeRoleTab, setActiveRoleTab] = useState('student_parent');

  // Form input states - empty by default (no quick pre-fill)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState(null);

  // Switch role tab cleanly without pre-filling credentials
  const handleTabChange = (roleKey) => {
    setActiveRoleTab(roleKey);
    setErrorMessage(null);
    setLoginSuccessNotice(null);
    setIdentifier('');
    setPassword('');
  };


  // Authentication submission
  const handleSubmitLogin = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanId = identifier.trim();
    const cleanPwd = password.trim();

    if (!cleanId) {
      setIsLoading(false);
      setErrorMessage('Please enter your Login ID or registered phone number.');
      return;
    }

    setTimeout(() => {
      // 1. STUDENT & PARENT AUTHENTICATION
      if (activeRoleTab === 'student_parent') {
        const foundStudent = studentList.find(
          (s) =>
            s.id.toLowerCase() === cleanId.toLowerCase() ||
            s.parentPhone.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
            s.name.toLowerCase() === cleanId.toLowerCase()
        );

        if (!foundStudent) {
          setIsLoading(false);
          setErrorMessage(
            `No commuter found matching "${cleanId}". Students must be registered by the Admin from the Admin Dashboard first.`
          );
          return;
        }

        if (cleanPwd && cleanPwd !== 'student123' && cleanPwd !== '1234' && cleanPwd !== foundStudent.password) {
          setIsLoading(false);
          setErrorMessage('Incorrect password. Default student portal PIN is: student123');
          return;
        }

        setLoginSuccessNotice(`Authenticated as ${foundStudent.name} (${foundStudent.id})! Loading Parent Mobile Tracker...`);
        setTimeout(() => {
          login('student_parent', {
            name: foundStudent.name,
            id: foundStudent.id,
            title: `${foundStudent.name} • ${foundStudent.classGrade}`,
            busId: foundStudent.busId,
            schoolName: foundStudent.schoolName,
            routeNumber: foundStudent.routeNumber,
            stopName: foundStudent.stopName,
            phone: foundStudent.parentPhone,
            district: 'Tamil Nadu',
          });
        }, 300);
        return;
      }

      // 2. BUS DRIVER AUTHENTICATION
      if (activeRoleTab === 'driver') {
        const foundDriver = driverList.find(
          (d) =>
            d.id.toLowerCase() === cleanId.toLowerCase() ||
            (d.licenseNo && d.licenseNo.toLowerCase() === cleanId.toLowerCase()) ||
            d.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
            d.name.toLowerCase().includes(cleanId.toLowerCase())
        );

        if (!foundDriver) {
          setIsLoading(false);
          setErrorMessage(
            `Driver ID or License "${cleanId}" not recognized in TNSTC depot pool. Drivers for routes are pre-defined by the system.`
          );
          return;
        }

        if (cleanPwd && cleanPwd !== 'driver123' && cleanPwd !== '1234' && cleanPwd !== foundDriver.id.toLowerCase()) {
          setIsLoading(false);
          setErrorMessage('Incorrect driver PIN. Default crew login PIN is: driver123');
          return;
        }

        const assignedBus = buses?.find((b) => b.id === foundDriver.assignedBusId);
        setLoginSuccessNotice(`Driver Verified: ${foundDriver.name} (${foundDriver.id}). Loading Driver Cabin...`);
        setTimeout(() => {
          login('driver', {
            name: foundDriver.name,
            id: foundDriver.id,
            title: foundDriver.assignedBusId
              ? `Driver (${assignedBus?.routeNumber || foundDriver.assignedRouteNumber})`
              : 'Standby Driver',
            busId: foundDriver.assignedBusId || 'BUS-14A',
            phone: foundDriver.phone,
            district: foundDriver.depot,
          });
        }, 300);
        return;
      }

      // 3. CENTRAL ADMIN AUTHENTICATION
      if (activeRoleTab === 'admin') {
        const isValidAdminId =
          cleanId.toLowerCase() === SINGLE_ADMIN.id.toLowerCase() ||
          cleanId.toLowerCase() === 'admin' ||
          cleanId.toLowerCase() === 'admin@tnstc.gov.in' ||
          cleanId.toLowerCase().includes('rajendran');

        if (!isValidAdminId) {
          setIsLoading(false);
          setErrorMessage(
            `Invalid Administrator ID. Centralized statewide access is reserved for "${SINGLE_ADMIN.id}".`
          );
          return;
        }

        if (cleanPwd && cleanPwd !== 'admin123' && cleanPwd !== 'tnstc2026' && cleanPwd !== 'admin') {
          setIsLoading(false);
          setErrorMessage('Incorrect Admin passkey. Official master password is: admin123');
          return;
        }

        setLoginSuccessNotice(`Authorized DTO Access: ${SINGLE_ADMIN.name}. Entering Admin Console...`);
        setTimeout(() => {
          login('admin', {
            name: SINGLE_ADMIN.name,
            id: SINGLE_ADMIN.id,
            title: SINGLE_ADMIN.title,
            department: SINGLE_ADMIN.department,
            phone: SINGLE_ADMIN.phone,
            district: SINGLE_ADMIN.district,
          });
        }, 300);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between font-mono p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="w-full max-w-xl mx-auto text-center space-y-2.5 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black text-[#86efac] rounded-full text-xs font-bold border border-black shadow-neo-sm">
          <Database className="w-3.5 h-3.5 text-[#86efac] animate-pulse" />
          <span>TAMIL NADU TNSTC • CENTRALIZED AUTHENTICATION GATEWAY</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight lowercase text-slate-900">
          schoolroute.tn <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded ml-1">SSO LOGIN</span>
        </h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Synchronized authentication system for Government School Commuters, State Bus Drivers, and Depot Administration.
        </p>
      </div>

      {/* Centered Clean Login Card (Preview column removed) */}
      <div className="w-full max-w-xl mx-auto my-6">
        <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-neo space-y-6">
          
          {/* 3-Role Tab Switcher */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Select Your Access Role:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 border-2 border-black rounded-2xl">
              <button
                type="button"
                onClick={() => handleTabChange('student_parent')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  activeRoleTab === 'student_parent'
                    ? 'bg-[#86efac] text-slate-950 border-2 border-black shadow-neo-sm font-bold'
                    : 'text-slate-600 hover:text-black hover:bg-slate-200/60'
                }`}
              >
                <Smartphone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Student/Parent</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('driver')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  activeRoleTab === 'driver'
                    ? 'bg-[#93c5fd] text-slate-950 border-2 border-black shadow-neo-sm font-bold'
                    : 'text-slate-600 hover:text-black hover:bg-slate-200/60'
                }`}
              >
                <Bus className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Bus Driver</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? 'bg-amber-300 text-slate-950 border-2 border-black shadow-neo-sm font-bold'
                    : 'text-slate-600 hover:text-black hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Central Admin</span>
              </button>
            </div>
          </div>

          {/* Active Role Subheader */}
          <div className="p-4 rounded-2xl border-2 border-black bg-slate-50 flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {activeRoleTab === 'student_parent' && '[ ROLE 01 • STUDENT & PARENT MOBILE ]'}
                {activeRoleTab === 'driver' && '[ ROLE 02 • MULTIPLE ON-ROAD DRIVERS ]'}
                {activeRoleTab === 'admin' && '[ ROLE 03 • SINGLE CENTRAL DISPATCHER ]'}
              </span>
              <h2 className="text-lg font-bold text-slate-900 lowercase tracking-tight mt-0.5">
                {activeRoleTab === 'student_parent' && 'student commuter sign-in'}
                {activeRoleTab === 'driver' && 'driver cabin login'}
                {activeRoleTab === 'admin' && 'depot admin authentication'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {activeRoleTab === 'student_parent' &&
                  'Enter your EMIS ID or Parent Mobile. Track your assigned feeder bus live on the GPS map.'}
                {activeRoleTab === 'driver' &&
                  'Authenticate as a certified driver to broadcast live GPS telemetry and passenger boardings.'}
                {activeRoleTab === 'admin' &&
                  'Central District Transport Officer access to enroll students and allocate drivers to routes.'}
              </p>
            </div>

            <div
              className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0 shadow-neo-sm ${
                activeRoleTab === 'student_parent'
                  ? 'bg-[#86efac]'
                  : activeRoleTab === 'driver'
                  ? 'bg-[#93c5fd]'
                  : 'bg-amber-300'
              }`}
            >
              {activeRoleTab === 'student_parent' && <Smartphone className="w-5 h-5 text-slate-950" />}
              {activeRoleTab === 'driver' && <Bus className="w-5 h-5 text-slate-950" />}
              {activeRoleTab === 'admin' && <Shield className="w-5 h-5 text-slate-950" />}
            </div>
          </div>

          {/* Error & Success Feedback */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border-2 border-red-600 rounded-xl text-xs font-bold text-red-900 flex items-start gap-2.5 shadow-neo-sm">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loginSuccessNotice && (
            <div className="p-3.5 bg-emerald-100 border-2 border-emerald-600 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-2.5 shadow-neo-sm animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 flex-shrink-0" />
              <span>{loginSuccessNotice}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmitLogin} className="space-y-4">
            {/* Field 1: Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>
                  {activeRoleTab === 'student_parent' && 'Student EMIS ID or Parent Mobile *'}
                  {activeRoleTab === 'driver' && 'Driver Staff ID or License Number *'}
                  {activeRoleTab === 'admin' && 'Admin Officer ID or Official Email *'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {activeRoleTab === 'student_parent' && 'e.g. EMIS-4821 or 98421 78901'}
                  {activeRoleTab === 'driver' && 'e.g. DRV-101'}
                  {activeRoleTab === 'admin' && 'ADMIN-TNSTC-HQ'}
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  {activeRoleTab === 'student_parent' && <User className="w-4 h-4" />}
                  {activeRoleTab === 'driver' && <Bus className="w-4 h-4" />}
                  {activeRoleTab === 'admin' && <Shield className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeRoleTab === 'student_parent'
                      ? 'Enter Student ID (e.g. STU-101) or mobile'
                      : activeRoleTab === 'driver'
                      ? 'Enter Driver ID (e.g. DRV-101)'
                      : 'Enter Admin ID (ADMIN-TNSTC-HQ)'
                  }
                  className="w-full text-xs font-bold bg-slate-50 border-2 border-black rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black shadow-neo-sm"
                />
              </div>
            </div>

            {/* Field 2: Password / PIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Password or Security PIN *</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secret password or PIN"
                  className="w-full text-xs font-bold bg-slate-50 border-2 border-black rounded-xl pl-10 pr-11 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black shadow-neo-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help Link */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-black text-black focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-bold">Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  alert(
                    activeRoleTab === 'student_parent'
                      ? 'Student accounts are created by the Admin from the Admin Dashboard. Default PIN: student123.'
                      : activeRoleTab === 'driver'
                      ? 'Pre-defined drivers are pre-registered under the TNSTC depot pool. Default PIN: driver123.'
                      : 'Single central District Transport Officer credentials are ADMIN-TNSTC-HQ with PIN: admin123.'
                  )
                }
                className="text-[11px] font-bold text-slate-500 hover:text-black underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need help?</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full neo-btn py-3 px-6 font-bold text-xs flex items-center justify-center gap-2 border-2 border-black rounded-xl shadow-neo transition-all cursor-pointer ${
                isLoading
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : activeRoleTab === 'student_parent'
                  ? 'bg-[#86efac] hover:bg-[#6ee7b7] text-slate-950'
                  : activeRoleTab === 'driver'
                  ? 'bg-[#93c5fd] hover:bg-[#7db9fc] text-slate-950'
                  : 'bg-black hover:bg-slate-800 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>
                    {activeRoleTab === 'student_parent' && '[ Secure Sign In as Student Commuter ➔ ]'}
                    {activeRoleTab === 'driver' && '[ Secure Sign In as Bus Driver ➔ ]'}
                    {activeRoleTab === 'admin' && '[ Secure Sign In as District Admin ➔ ]'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto pt-3 text-center text-[11px] text-slate-500 space-y-1">
        <div>
          Official Tamil Nadu State Transport Corporation (TNSTC) & Education Department Integrated SSO.
        </div>
      </footer>
    </div>
  );
}
