import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { TN_GOVT_BUS_ROUTES } from '../data/busData';
import { sendLiveCellularSms, sendSmsMobileApi, sendFast2SmsLive, triggerDeviceWebPush } from '../utils/smsGateway';

const LiveDatabaseContext = createContext(null);
const DB_STORAGE_KEY = 'schoolroute_tn_live_database_clean_v7';
const AUTH_STORAGE_KEY = 'schoolroute_tn_active_role_clean_v7';

// Automatically purge all old artificial cached data on load
if (typeof window !== 'undefined') {
  try {
    [
      'schoolroute_tn_live_database_clean_v6',
      'schoolroute_tn_active_role_clean_v6',
      'schoolroute_tn_live_database_v1',
      'schoolroute_tn_live_database_v2',
      'schoolroute_tn_live_database_v3',
      'schoolroute_tn_live_database_v4',
      'schoolroute_tn_live_database_v5',
      'schoolroute_tn_active_role_v1',
      'schoolroute_tn_active_role_v2',
      'schoolroute_tn_active_role_v3',
      'schoolroute_tn_active_role_v4',
      'schoolroute_tn_active_role_v5',
      'TNSTC_LIVE_DATABASE_V1',
      'TNSTC_LIVE_DATABASE_V2',
      'TNSTC_LIVE_DATABASE_V3',
      'TNSTC_LIVE_DATABASE_V4',
    ].forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

// ================= 1. REGISTERED DRIVERS ROSTER (CLEAN PRE-DEFINED DRIVERS) =================
export const SEED_DRIVERS = [
  {
    id: 'DRV-101',
    name: 'Driver 1',
    phone: '94432 10987',
    experience: '12 Years (Official Route Driver)',
    licenseNo: 'TN-DRV-101',
    assignedBusId: 'BUS-14A',
    assignedRouteNumber: '14A (School Route)',
    depot: 'Central Feeder Depot',
    status: 'Active on Duty',
    rating: '5.0 ★',
    tripsCompleted: 850,
    photoBadge: 'D1',
  },
  {
    id: 'DRV-102',
    name: 'Driver 2 (Standby)',
    phone: '94435 87654',
    experience: '8 Years (Certified Driver)',
    licenseNo: 'TN-DRV-102',
    assignedBusId: null,
    assignedRouteNumber: 'Unassigned (Standby)',
    depot: 'Central Feeder Depot',
    status: 'Standby / Ready',
    rating: '5.0 ★',
    tripsCompleted: 420,
    photoBadge: 'D2',
  },
];

// ================= 2. REGISTERED STUDENTS (EXACTLY 4 CLEAN STUDENT COMMUTER SLOTS) =================
export const SEED_STUDENTS = [
  {
    id: 'STU-101',
    name: 'Student 1',
    classGrade: '10th Standard A',
    schoolName: 'Government Higher Secondary School',
    busId: 'BUS-14A',
    routeNumber: '14A (School Route)',
    stopName: 'Morappur Bus Stand',
    parentPhone: '73059 40480',
    isBoarded: false,
    boardedTime: null,
    status: 'Waiting at Stop',
  },
  {
    id: 'STU-102',
    name: 'Student 2',
    classGrade: '10th Standard B',
    schoolName: 'Government Higher Secondary School',
    busId: 'BUS-14A',
    routeNumber: '14A (School Route)',
    stopName: 'Kadayampatti Stop',
    parentPhone: '73059 40480',
    isBoarded: false,
    boardedTime: null,
    status: 'Waiting at Stop',
  },
  {
    id: 'STU-103',
    name: 'Student 3',
    classGrade: '11th Standard',
    schoolName: 'Government Higher Secondary School',
    busId: 'BUS-14A',
    routeNumber: '14A (School Route)',
    stopName: 'Matlampatti Junction',
    parentPhone: '73059 40480',
    isBoarded: false,
    boardedTime: null,
    status: 'Waiting at Stop',
  },
  {
    id: 'STU-104',
    name: 'Student 4',
    classGrade: '12th Standard',
    schoolName: 'Government Higher Secondary School',
    busId: 'BUS-14A',
    routeNumber: '14A (School Route)',
    stopName: 'Thoppur Cross',
    parentPhone: '73059 40480',
    isBoarded: false,
    boardedTime: null,
    status: 'Waiting at Stop',
  },
];

// ================= 3. ONLY ONE OFFICIAL ADMIN =================
export const SINGLE_ADMIN = {
  id: 'ADMIN-TNSTC-HQ',
  name: 'District Transport Officer (DTO)',
  title: 'State Educational Transport Nodal Officer',
  department: 'Tamil Nadu State Transport Corporation (TNSTC) & School Education Dept',
  phone: '04342-260100',
  district: 'Statewide Oversight (Dharmapuri, Salem, Dindigul)',
  role: 'admin',
};

// Seed Buses linked with assigned drivers
const SEED_BUSES = TN_GOVT_BUS_ROUTES.map((bus) => {
  const assigned = SEED_DRIVERS.find((d) => d.assignedBusId === bus.id);
  return {
    ...bus,
    driverId: assigned ? assigned.id : 'DRV-101',
    driverName: assigned ? assigned.name : bus.driverName,
    driverPhone: assigned ? assigned.phone : bus.driverPhone,
  };
});

// Zero artificial logs & grievances - Clean slate
const SEED_SMS = [];
const SEED_GRIEVANCES = [];

// Synthesize a pleasant two-tone mobile SMS notification chime (Web Audio API)
export const playSmsChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    // Two-tone mobile SMS notification chime (880Hz then 1175Hz)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (err) {}
};

export function LiveDatabaseProvider({ children }) {
  // Current Logged-in User Session (null = show login page)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Track the most recent incoming SMS alert for instant mobile push simulation
  const [latestSmsNotification, setLatestSmsNotification] = useState(null);

  // Master Synchronized Database State
  const [db, setDb] = useState(() => {
    try {
      const saved = localStorage.getItem(DB_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.buses && parsed.students && parsed.drivers) {
          // Reconcile student status if their bus has already arrived at school
          const reconciledStudents = parsed.students.map((stu) => {
            const assignedBus = parsed.buses.find((b) => b.id === stu.busId);
            const busHasArrived =
              assignedBus &&
              (assignedBus.statusType === 'arrived' ||
                assignedBus.progress >= 100 ||
                assignedBus.currentStopIndex >= (assignedBus.stops?.length || 1) - 1);
            if (busHasArrived) {
              return {
                ...stu,
                isBoarded: true,
                status: 'Safely Arrived at School Gate',
                arrivedSchoolTime: stu.arrivedSchoolTime || assignedBus.actualArrivalTime || assignedBus.schoolArrival || 'Safe Drop-Off',
              };
            }
            return stu;
          });
          return {
            ...parsed,
            students: reconciledStudents,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      buses: SEED_BUSES,
      drivers: SEED_DRIVERS,
      students: SEED_STUDENTS,
      smsLog: SEED_SMS,
      grievances: SEED_GRIEVANCES,
      lastSyncTime: new Date().toLocaleTimeString(),
    };
  });

  // Synchronized live clock updated every second across the app
  const [liveClockTime, setLiveClockTime] = useState(() =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClockTime(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cross-tab broadcast channel for instant multi-window synchronization
  const broadcastChannelRef = useRef(null);

  useEffect(() => {
    try {
      const channel = new BroadcastChannel('schoolroute_live_db_sync');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'DB_UPDATE') {
          setDb(event.data.payload);
          if (event.data.sms) {
            setLatestSmsNotification(event.data.sms);
            playSmsChime();
          }
        }
      };

      const handleStorage = (e) => {
        if (e.key === DB_STORAGE_KEY && e.newValue) {
          try {
            setDb(JSON.parse(e.newValue));
          } catch (err) {}
        }
      };
      window.addEventListener('storage', handleStorage);

      return () => {
        channel.close();
        window.removeEventListener('storage', handleStorage);
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }
  }, []);

  // Save to localStorage & broadcast whenever DB changes
  const saveAndBroadcastDb = (newDb, smsAlert = null) => {
    const updated = {
      ...newDb,
      lastSyncTime: new Date().toLocaleTimeString(),
    };
    setDb(updated);
    if (smsAlert) {
      setLatestSmsNotification(smsAlert);
      playSmsChime();
    }
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(updated));
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'DB_UPDATE',
          payload: updated,
          sms: smsAlert,
        });
      }
    } catch (e) {
      console.error('Failed to sync DB:', e);
    }
  };

  // Save active user session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // ================= ROLE LOGIN & LOGOUT =================
  const login = (role, userDetails) => {
    const user = {
      role, // 'student_parent', 'driver', 'admin'
      name: userDetails.name,
      id: userDetails.id,
      title: userDetails.title,
      busId: userDetails.busId || 'BUS-14A',
      schoolName: userDetails.schoolName || 'Government Higher Secondary School (GHSS), Dharmapuri',
      routeNumber: userDetails.routeNumber || '14A (Green Board)',
      stopName: userDetails.stopName || 'Morappur Bus Stand',
      phone: userDetails.phone || '98421 XXXXX',
      photo: userDetails.photo || null,
      district: userDetails.district || 'Dharmapuri',
    };
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // ================= ADMIN FEATURE: ASSIGN DRIVER TO BUS ROUTE =================
  const assignDriverToBus = (driverId, busId) => {
    const targetDriver = db.drivers.find((d) => d.id === driverId);
    const targetBus = db.buses.find((b) => b.id === busId);
    if (!targetDriver || !targetBus) return false;

    // 1. Update drivers roster
    const updatedDrivers = db.drivers.map((d) => {
      // The driver being assigned
      if (d.id === driverId) {
        return {
          ...d,
          assignedBusId: busId,
          assignedRouteNumber: targetBus.routeNumber,
          status: 'Active on Duty',
        };
      }
      // Any driver previously assigned to this bus is now relieved to Standby
      if (d.assignedBusId === busId && d.id !== driverId) {
        return {
          ...d,
          assignedBusId: null,
          assignedRouteNumber: 'Unassigned (Standby)',
          status: 'Standby / Ready for Assignment',
        };
      }
      return d;
    });

    // 2. Update the bus route record with the new driver details
    const updatedBuses = db.buses.map((b) => {
      if (b.id === busId) {
        return {
          ...b,
          driverId: targetDriver.id,
          driverName: targetDriver.name,
          driverPhone: targetDriver.phone,
        };
      }
      return b;
    });

    // 3. Save database state
    saveAndBroadcastDb({
      ...db,
      drivers: updatedDrivers,
      buses: updatedBuses,
    });

    // If the currently logged-in user is this driver, keep session synced
    if (currentUser && currentUser.id === targetDriver.id) {
      setCurrentUser((prev) => ({
        ...prev,
        busId,
        title: `TNSTC Govt Bus Driver (${targetBus.routeNumber})`,
      }));
    }

    return true;
  };

  // ================= ADMIN FEATURE: ASSIGN STUDENT TO ROUTE & SCHOOL =================
  const assignStudentToRoute = (studentId, busId, stopName, schoolName) => {
    const targetBus = db.buses.find((b) => b.id === busId);
    if (!targetBus) return false;

    const updatedStudents = db.students.map((stu) => {
      if (stu.id === studentId) {
        return {
          ...stu,
          busId,
          routeNumber: targetBus.routeNumber,
          stopName: stopName || stu.stopName,
          schoolName: schoolName || stu.schoolName,
        };
      }
      return stu;
    });

    saveAndBroadcastDb({
      ...db,
      students: updatedStudents,
    });

    return true;
  };

  // ================= ADMIN FEATURE: CREATE / REGISTER NEW STUDENT COMMUTER ROLE =================
  const createStudent = ({ name, id, classGrade, schoolName, busId, stopName, parentPhone }) => {
    const targetBus = db.buses.find((b) => b.id === busId) || db.buses[0];
    const emisId = id && id.trim() ? id.trim() : `EMIS-${Math.floor(4000 + Math.random() * 5000)}`;
    const studentName = name && name.trim() ? name.trim() : 'New Student';
    const assignedSchool = schoolName || targetBus.destinationSchool;
    const assignedRoute = targetBus.routeNumber;
    const pickupStop = stopName || (targetBus.stops[0] ? targetBus.stops[0].name : 'Village Stop');
    const phone = parentPhone && parentPhone.trim() ? parentPhone.trim() : '98421 XXXXX';

    const newStudent = {
      id: emisId,
      name: studentName,
      classGrade: classGrade || '10th Standard A',
      schoolName: assignedSchool,
      busId: targetBus.id,
      routeNumber: assignedRoute,
      stopName: pickupStop,
      parentPhone: phone,
      isBoarded: false,
      boardedTime: null,
      status: 'Waiting at Stop',
      createdAt: new Date().toLocaleDateString('en-IN'),
    };

    saveAndBroadcastDb({
      ...db,
      students: [newStudent, ...db.students],
    });

    return newStudent;
  };

  const deleteStudent = (studentId) => {
    const updated = db.students.filter((s) => s.id !== studentId);
    saveAndBroadcastDb({
      ...db,
      students: updated,
    });
    return true;
  };

  const updateStudent = (studentId, updatedFields) => {
    const updated = db.students.map((s) => (s.id === studentId ? { ...s, ...updatedFields } : s));
    saveAndBroadcastDb({ ...db, students: updated });
    return true;
  };

  const updateDriver = (driverId, updatedFields) => {
    const updated = db.drivers.map((d) => (d.id === driverId ? { ...d, ...updatedFields } : d));
    saveAndBroadcastDb({ ...db, drivers: updated });
    return true;
  };

  // ================= DRIVER LIVE CONTROLS (SYNCHRONIZES TO PARENTS & ADMIN) =================
  // 0. Start Feeder Trip from Origin (Initializes GPS route from Stop 1, sets speed, resets student boarding for trip)
  const driverStartTrip = (busId) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const updatedBuses = db.buses.map((bus) => {
      if (bus.id === busId) {
        const originStop = bus.stops[0];
        const newStops = bus.stops.map((s, idx) => {
          if (idx === 0) return { ...s, passed: false, isCurrent: true, isNext: false, time: nowTime };
          if (idx === 1) return { ...s, passed: false, isCurrent: false, isNext: true };
          return { ...s, passed: false, isCurrent: false, isNext: false };
        });

        return {
          ...bus,
          currentStopIndex: 0,
          progress: 5,
          speed: 32,
          isTripActive: true,
          tripStartTime: nowTime,
          status: `Trip Started • En Route from ${originStop?.name || 'Origin'} (${nowTime})`,
          statusType: 'normal',
          stops: newStops,
        };
      }
      return bus;
    });

    // Reset student boarding states for fresh trip: ready at stops for QR scan boarding!
    const updatedStudents = db.students.map((stu) => {
      if (stu.busId === busId) {
        return {
          ...stu,
          isBoarded: false,
          boardedTime: null,
          arrivedSchoolTime: null,
          status: 'Waiting at Stop',
          scanMethod: null,
        };
      }
      return stu;
    });

    saveAndBroadcastDb({
      ...db,
      buses: updatedBuses,
      students: updatedStudents,
    });
  };

  // 1. Advance bus to next stop (Live GPS update only - NO SMS generated per requirement)
  const driverAdvanceStop = (busId) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const targetBus = db.buses.find((b) => b.id === busId);
    if (!targetBus) return;

    const nextIdx = Math.min(targetBus.stops.length - 1, targetBus.currentStopIndex + 1);
    const isDestination = targetBus.stops[nextIdx]?.isSchool || nextIdx >= targetBus.stops.length - 1;

    // If advancing reaches the final school destination, trigger official school arrival sequence!
    if (isDestination) {
      driverArriveAtSchool(busId);
      return;
    }

    const newStops = targetBus.stops.map((s, idx) => {
      if (idx <= nextIdx) return { ...s, passed: true, isNext: false };
      if (idx === nextIdx + 1) return { ...s, isNext: true };
      return { ...s, passed: false, isNext: false };
    });

    const stopName = newStops[nextIdx].name;
    const newProgress = Math.round(((nextIdx + 1) / newStops.length) * 100);

    const updatedBuses = db.buses.map((bus) => {
      if (bus.id === busId) {
        return {
          ...bus,
          currentStopIndex: nextIdx,
          progress: newProgress,
          status: `Departed ${stopName} (${nowTime})`,
          statusType: 'normal',
          stops: newStops,
        };
      }
      return bus;
    });

    saveAndBroadcastDb({
      ...db,
      buses: updatedBuses,
    });
  };

  // 2. Mark bus arrival at school gate (TRIGGER #1: Reached School Safe Drop-off & Missed Bus Alerts)
  const driverArriveAtSchool = (busId) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    let busNum = '';

    const updatedBuses = db.buses.map((bus) => {
      if (bus.id === busId) {
        busNum = bus.routeNumber.split(' ')[0];
        return {
          ...bus,
          progress: 100,
          currentStopIndex: bus.stops.length - 1,
          schoolArrival: nowTime, // Synchronize arrival time across system
          actualArrivalTime: nowTime,
          status: `Arrived at School Gate (${nowTime}) • Safe Drop-Off`,
          statusType: 'arrived',
          stops: bus.stops.map((s, idx) => ({
            ...s,
            passed: true,
            isNext: false,
            time: idx === bus.stops.length - 1 ? nowTime : s.time,
            actualTime: idx === bus.stops.length - 1 ? nowTime : s.actualTime || s.time,
          })),
        };
      }
      return bus;
    });

    // Process students on this bus:
    // 1. Boarded students -> Safely Arrived at School Gate, arrivedSchoolTime, Safe Arrival SMS
    // 2. Unboarded students -> Bus Missed / Not Boarded, isMissed: true, Bus Missed SMS alert
    const newSmsList = [];

    const updatedStudents = db.students.map((stu) => {
      if (stu.busId === busId) {
        if (stu.isBoarded) {
          return {
            ...stu,
            isBoarded: true,
            isMissed: false,
            boardedTime: stu.boardedTime || nowTime,
            arrivedSchoolTime: stu.arrivedSchoolTime || nowTime,
            status: 'Safely Arrived at School Gate',
          };
        } else {
          return {
            ...stu,
            isBoarded: false,
            isMissed: true,
            boardedTime: null,
            arrivedSchoolTime: null,
            status: 'Bus Missed / Not Boarded',
          };
        }
      }
      return stu;
    });

    const busStudents = updatedStudents.filter((s) => s.busId === busId);
    const boardedStudents = busStudents.filter((s) => s.isBoarded);
    const unboardedStudents = busStudents.filter((s) => !s.isBoarded);

    // 1. Dispatch Safe Arrival SMS to parents of BOARDED students ONLY
    boardedStudents.forEach((stu) => {
      const safeArrivalMsg = `TN-GOVT-EDU OFFICIAL: Bus ${busNum} safely reached Government School Gate at ${nowTime}. Your ward ${stu.name} (${stu.classGrade}) has safely entered campus. Free Govt Bus.`;

      const safeSms = {
        id: `SMS-${Date.now()}-${stu.id}`,
        busId,
        studentId: stu.id,
        phone: stu.parentPhone,
        time: nowTime,
        message: safeArrivalMsg,
        type: 'arrived',
        recipientName: stu.name,
      };

      newSmsList.push(safeSms);
      if (stu.parentPhone) {
        sendLiveCellularSms({ phoneNumber: stu.parentPhone, message: safeArrivalMsg });
      }
    });

    // 2. Dispatch "Bus Missed" Alert SMS to parents of UNBOARDED students ONLY
    unboardedStudents.forEach((stu) => {
      const missedMsg = `TN-GOVT-EDU ALERT: Bus ${busNum} completed route and reached School Gate at ${nowTime}. Your ward ${stu.name} (${stu.classGrade}) was NOT boarded at ${stu.stopName} (BUS MISSED). Please verify with ward.`;

      const missedSms = {
        id: `SMS-${Date.now()}-${stu.id}-MISSED`,
        busId,
        studentId: stu.id,
        phone: stu.parentPhone,
        time: nowTime,
        message: missedMsg,
        type: 'bus_missed',
        recipientName: stu.name,
      };

      newSmsList.push(missedSms);
      if (stu.parentPhone) {
        sendLiveCellularSms({ phoneNumber: stu.parentPhone, message: missedMsg });
      }
    });

    // Trigger device lockscreen push notification summarizing arrival and missed counts
    const pushSummary = `Bus ${busNum} Reached School (${nowTime}): ${boardedStudents.length} safely entered campus • ${unboardedStudents.length} missed bus alerts sent.`;
    triggerDeviceWebPush('TN-GOVT-EDU: School Gate Reached', pushSummary);

    saveAndBroadcastDb(
      {
        ...db,
        buses: updatedBuses,
        students: updatedStudents,
        smsLog: [...newSmsList, ...db.smsLog],
      },
      newSmsList[0] || null
    );
  };

  // 3. Driver updates speed or crowd level (Telemetry only - NO SMS generated per requirement)
  const driverUpdateStatus = (busId, { speed, crowdLevel, status, isDelayed }) => {
    const updatedBuses = db.buses.map((bus) => {
      if (bus.id === busId) {
        return {
          ...bus,
          speed: speed !== undefined ? speed : bus.speed,
          crowdLevel: crowdLevel || bus.crowdLevel,
          status: status || bus.status,
          statusType: isDelayed ? 'delayed' : bus.statusType,
        };
      }
      return bus;
    });

    // Routine telemetry only updates bus status. No SMS dispatched here per user constraint.
    saveAndBroadcastDb({
      ...db,
      buses: updatedBuses,
    });
  };

  // 4. Driver marks student as boarded (TRIGGER #2: Student Boarded the Bus SMS)
  const driverToggleStudentBoarding = (studentId) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    let targetedStudent = null;

    const updatedStudents = db.students.map((stu) => {
      if (stu.id === studentId) {
        const nextState = !stu.isBoarded;
        targetedStudent = {
          ...stu,
          isBoarded: nextState,
          boardedTime: nextState ? nowTime : null,
          status: nextState ? 'On Board' : 'Waiting at Stop',
        };
        return targetedStudent;
      }
      return stu;
    });

    if (targetedStudent && targetedStudent.isBoarded) {
      const busNum = (targetedStudent.routeNumber || '').split(' ')[0] || '14A';
      const boardingMessage = `TN-GOVT-EDU: Your ward ${targetedStudent.name} (${targetedStudent.classGrade}) has safely boarded Bus ${busNum} at ${targetedStudent.stopName} (${nowTime}). Free Govt Bus.`;

      const boardingSms = {
        id: `SMS-${Date.now()}`,
        busId: targetedStudent.busId,
        studentId: targetedStudent.id,
        phone: targetedStudent.parentPhone,
        time: nowTime,
        message: boardingMessage,
        type: 'boarded',
        recipientName: targetedStudent.name,
      };

      // 1. Dispatch cellular SMS via SMSMobileAPI / Fast2SMS to parent mobile
      sendLiveCellularSms({ phoneNumber: targetedStudent.parentPhone, message: boardingMessage });

      // 2. Trigger device lockscreen push notification
      triggerDeviceWebPush('TN-GOVT-EDU: Bus Boarded', boardingMessage);

      saveAndBroadcastDb(
        {
          ...db,
          students: updatedStudents,
          smsLog: [boardingSms, ...db.smsLog],
        },
        boardingSms
      );
    } else {
      // Un-marking boarded (undo) does NOT dispatch SMS
      saveAndBroadcastDb({
        ...db,
        students: updatedStudents,
      });
    }
  };

  // 4b. Driver scans student digital pass QR code for attendance & boarding
  const driverScanStudentQrPass = async (rawCodeOrStudentId) => {
    let studentId = rawCodeOrStudentId;
    let extractedName = null;
    let extractedPhone = null;

    if (typeof rawCodeOrStudentId === 'string') {
      const trimmed = rawCodeOrStudentId.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('{') && trimmed.includes('"id"'))) {
        try {
          const parsed = JSON.parse(trimmed);
          studentId = parsed.id || parsed.studentId || studentId;
          extractedName = parsed.name || null;
          extractedPhone = parsed.phone || null;
        } catch (e) {}
      }
    }

    const cleanId = String(studentId).trim().toUpperCase();
    const cleanNumbersOnly = cleanId.replace(/\D/g, '');

    const student = db.students.find((s) => {
      const sId = (s.id || '').toUpperCase();
      const sNum = (s.id || '').replace(/\D/g, '');
      const sName = (s.name || '').toUpperCase();
      const sEmis = (s.emisNumber || '').toUpperCase();

      if (sId === cleanId) return true;
      if (cleanNumbersOnly && sNum && cleanNumbersOnly === sNum) return true;
      if (sEmis && (sEmis === cleanId || cleanId.includes(sEmis))) return true;
      if (cleanId.length >= 3 && sName === cleanId) return true;
      if (extractedName && sName === String(extractedName).trim().toUpperCase()) return true;
      return false;
    });

    if (!student) {
      const displayStr =
        typeof rawCodeOrStudentId === 'string' && rawCodeOrStudentId.length > 35
          ? `${rawCodeOrStudentId.slice(0, 32)}...`
          : String(rawCodeOrStudentId);
      return {
        success: false,
        message: `Pass "${displayStr}" not recognized in TNSTC student roster.`,
      };
    }

    if (student.isBoarded) {
      return {
        success: true,
        alreadyBoarded: true,
        student,
        message: `${student.name} (${student.id}) is already recorded on board at ${student.boardedTime || 'earlier today'}.`,
      };
    }

    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const busNum = (student.routeNumber || '').split(' ')[0] || '14A';

    const updatedStudents = db.students.map((s) => {
      if (s.id === student.id) {
        return {
          ...s,
          isBoarded: true,
          boardedTime: nowTime,
          status: 'On Board (Digital Pass QR Scanned)',
          scanMethod: 'QR_PASS',
        };
      }
      return s;
    });

    const boardingMessage = `TN-GOVT-EDU: Your ward ${student.name} (${student.classGrade}) has safely boarded Bus ${busNum} at ${student.stopName} (${nowTime}). Digital Pass QR verified. Free Govt Bus.`;

    const boardingSms = {
      id: `SMS-${Date.now()}`,
      busId: student.busId,
      studentId: student.id,
      phone: student.parentPhone,
      time: nowTime,
      message: boardingMessage,
      type: 'boarded',
      recipientName: student.name,
    };

    // 1. Dispatch cellular SMS via SMSMobileAPI to parent mobile
    sendLiveCellularSms({ phoneNumber: student.parentPhone, message: boardingMessage });

    // 2. Trigger device lockscreen push notification
    triggerDeviceWebPush('TN-GOVT-EDU: Digital Pass Scanned', boardingMessage);

    saveAndBroadcastDb(
      {
        ...db,
        students: updatedStudents,
        smsLog: [boardingSms, ...db.smsLog],
      },
      boardingSms
    );

    return {
      success: true,
      alreadyBoarded: false,
      student: { ...student, isBoarded: true, boardedTime: nowTime },
      message: `Pass Verified! ${student.name} boarded. Live SMS dispatched to +91 ${student.parentPhone}.`,
    };
  };

  // 5. TRIGGER #3: On-Bus Physical Panic Button (AIS-140) / Conductor SOS - Instant SMS to Parent & Depot Alert
  const studentReportIrregularBehavior = async ({
    busId,
    studentId,
    studentName,
    parentPhone,
    issueType,
    details,
  }) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const targetBus = db.buses.find((b) => b.id === busId) || db.buses[0];
    const busNum = targetBus.routeNumber.split(' ')[0];
    const name = studentName || currentUser?.name || 'Student Commuter';
    const phone = parentPhone || currentUser?.phone || '73059 40480';
    const category = issueType || 'Irregular Transit / Safety Concern';
    const detailPart = details && details.trim() ? ` Note: ${details.trim()}` : '';

    const message = `TN-GOVT-EDU URGENT: On-bus physical SOS panic button (AIS-140) pressed on Bus ${busNum} (${nowTime}) regarding ${category}.${detailPart} Driver cabin & TNSTC Depot alerted. Helpline: 1098 / 04342-260100.`;

    const irregularSms = {
      id: `SMS-${Date.now()}`,
      busId: targetBus.id,
      studentId: studentId || currentUser?.id,
      phone,
      time: nowTime,
      message,
      type: 'irregular_behavior',
      category,
      details: details || '',
      source: 'ON_BUS_PHYSICAL_PANIC_BUTTON_AIS_140',
    };

    // 1. Dispatch real cellular SMS via SMSMobileAPI (primary) with Fast2SMS fallback
    let apiResult = null;
    try {
      apiResult = await sendLiveCellularSms({ phoneNumber: phone, message, sendWa: 1 });
    } catch (apiErr) {
      console.warn('Live cellular SMS dispatch error:', apiErr);
    }

    // 2. Trigger device lockscreen push notification
    try {
      triggerDeviceWebPush('🚨 TN-GOVT-EDU: On-Bus Panic Button Activated', message);
    } catch (e) {}

    // 3. Automatically record official grievance for depot admin
    const newGrievance = {
      id: `TNSTC-ALERT-${Date.now().toString().slice(-4)}`,
      village: targetBus.originVillage,
      schoolName: targetBus.destinationSchool,
      district: targetBus.district || 'Dharmapuri',
      category: `Urgent Student Safety: ${category}`,
      affectedCount: 1,
      description: `Reported via On-Bus Physical Panic Button (AIS-140) on Bus ${busNum}. Ward: ${name} (Parent: ${phone}). Details: ${details || 'Physical SOS pillar button pressed.'}`,
      status: 'URGENT ATTENTION',
      reportedDate: new Date().toLocaleDateString('en-IN'),
      officialNotes: `Dispatched live SMS to parent ${phone}. Flashing siren activated in driver cabin and flagged on depot monitor.`,
    };

    // 4. Update the bus state to activate the on-bus emergency alert in the driver console & depot map
    const updatedBuses = db.buses.map((bus) => {
      if (bus.id === targetBus.id) {
        return {
          ...bus,
          emergencyAlert: {
            active: true,
            time: nowTime,
            category,
            details: details || '',
            studentName: name,
            parentPhone: phone,
          },
        };
      }
      return bus;
    });

    saveAndBroadcastDb(
      {
        ...db,
        buses: updatedBuses,
        smsLog: [irregularSms, ...db.smsLog],
        grievances: [newGrievance, ...db.grievances],
      },
      irregularSms
    );

    return { success: true, sms: irregularSms, message, apiResult };
  };

  // 5b. Driver or Conductor acknowledges & resolves active on-bus emergency SOS
  const driverDismissEmergencyAlert = (busId) => {
    const updatedBuses = db.buses.map((bus) => {
      if (bus.id === busId) {
        return {
          ...bus,
          emergencyAlert: null,
        };
      }
      return bus;
    });
    saveAndBroadcastDb({
      ...db,
      buses: updatedBuses,
    });
  };

  // 6. Direct Manual / Test Parent SMS trigger (for interactive verification)
  const dispatchParentSms = ({ busId, studentId, phone, message, type = 'boarding' }) => {
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const newSms = {
      id: `SMS-${Date.now()}`,
      busId: busId || 'BUS-14A',
      studentId: studentId || null,
      phone: phone || '98421 78901',
      time: nowTime,
      message,
      type,
    };
    saveAndBroadcastDb(
      {
        ...db,
        smsLog: [newSms, ...db.smsLog],
      },
      newSms
    );
    return newSms;
  };

  // ================= GRIEVANCES REGISTER =================
  const submitGrievance = (grievanceData) => {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const newGrievance = {
      id: `TNSTC-G-${Math.floor(100 + Math.random() * 900)}`,
      village: grievanceData.village,
      schoolName: grievanceData.schoolName,
      district: grievanceData.district || 'Dharmapuri',
      category: grievanceData.category,
      affectedCount: Number(grievanceData.affectedCount) || 30,
      description: grievanceData.description,
      status: 'Reported',
      reportedDate: today,
      officialNotes: 'Grievance submitted by commuter. Assigned to Depot Manager for inspection.',
    };

    saveAndBroadcastDb({
      ...db,
      grievances: [newGrievance, ...db.grievances],
    });
    return newGrievance;
  };

  const updateGrievanceStatus = (id, newStatus, officialNotes) => {
    const updated = db.grievances.map((g) => {
      if (g.id === id) {
        return {
          ...g,
          status: newStatus,
          officialNotes: officialNotes || g.officialNotes,
        };
      }
      return g;
    });

    saveAndBroadcastDb({
      ...db,
      grievances: updated,
    });
  };

  const resetDatabaseToDefaults = () => {
    const fresh = {
      buses: SEED_BUSES,
      drivers: SEED_DRIVERS,
      students: SEED_STUDENTS,
      smsLog: SEED_SMS,
      grievances: SEED_GRIEVANCES,
      lastSyncTime: new Date().toLocaleTimeString(),
    };
    saveAndBroadcastDb(fresh);
  };

  return (
    <LiveDatabaseContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        login,
        logout,
        db,
        buses: db.buses,
        drivers: db.drivers,
        students: db.students,
        smsLog: db.smsLog,
        grievances: db.grievances,
        lastSyncTime: db.lastSyncTime,
        liveClockTime,
        singleAdmin: SINGLE_ADMIN,
        assignDriverToBus,
        assignStudentToRoute,
        createStudent,
        deleteStudent,
        updateStudent,
        updateDriver,
        driverStartTrip,
        driverAdvanceStop,
        driverArriveAtSchool,
        driverUpdateStatus,
        driverToggleStudentBoarding,
        driverScanStudentQrPass,
        studentReportIrregularBehavior,
        driverDismissEmergencyAlert,
        playSmsChime,
        submitGrievance,
        updateGrievanceStatus,
        resetDatabaseToDefaults,
        latestSmsNotification,
        setLatestSmsNotification,
        dispatchParentSms,
      }}
    >
      {children}
    </LiveDatabaseContext.Provider>
  );
}

export function useLiveDatabase() {
  const context = useContext(LiveDatabaseContext);
  if (!context) {
    throw new Error('useLiveDatabase must be used within a LiveDatabaseProvider');
  }
  return context;
}
