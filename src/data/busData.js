// Real-world Tamil Nadu Government School Feeder Bus Routes (TNSTC)
export const TN_GOVT_BUS_ROUTES = [
  {
    id: 'BUS-14A',
    routeNumber: '14A (Green Board)',
    district: 'Dharmapuri',
    originVillage: 'Morappur West',
    destinationSchool: 'Government Higher Secondary School (GHSS), Dharmapuri',
    busRegNo: 'TN-29-N-3421',
    depot: 'Dharmapuri Central Depot',
    driverName: 'S. Murugesan',
    conductorName: 'K. Rajavelu',
    driverPhone: '94432 10987',
    depotHotline: '04342-260100',
    morningPickup: '08:15 AM',
    schoolArrival: '08:48 AM',
    eveningDismissalPickup: '04:35 PM',
    eveningDrop: '05:08 PM',
    speed: 38, // km/h
    crowdLevel: 'Seats Available for Students',
    status: 'In Transit • Punctual',
    statusColor: 'emerald',
    currentStopIndex: 2,
    progress: 55,
    stops: [
      {
        name: 'Morappur Bus Stand',
        time: '08:15 AM',
        passed: true,
        isSchool: false,
        coords: [12.0528, 78.3982],
        desc: 'Origin rural junction. Morning assembly point for 25 students.',
      },
      {
        name: 'Kadayampatti Colony Stop',
        time: '08:24 AM',
        passed: true,
        isSchool: false,
        coords: [12.0831, 78.3340],
        desc: 'Feeder stop for SC/ST welfare residential colony.',
      },
      {
        name: 'Matlampatti High School Junction',
        time: '08:34 AM',
        passed: false,
        isCurrent: true,
        isSchool: false,
        coords: [12.1150, 78.2610],
        desc: 'Intermediate intersection. 12 students boarding.',
      },
      {
        name: 'Thoppur Toll Cross',
        time: '08:41 AM',
        passed: false,
        isSchool: false,
        coords: [12.1220, 78.2050],
        desc: 'Highway link connector stop.',
      },
      {
        name: 'GHSS Dharmapuri School Gate',
        time: '08:48 AM',
        passed: false,
        isSchool: true,
        coords: [12.1315, 78.1585],
        desc: 'Main gate of GHSS Dharmapuri. Morning prayer at 08:55 AM.',
      },
    ],
    corridorPath: [
      [12.0528, 78.3982],
      [12.0650, 78.3650],
      [12.0831, 78.3340],
      [12.1020, 78.2950],
      [12.1150, 78.2610],
      [12.1220, 78.2050],
      [12.1280, 78.1750],
      [12.1315, 78.1585],
    ],
    studentPassengers: [
      { id: 'EMIS-4821', name: 'M. Kaviya', classGrade: '10th Standard A', parentPhone: '98421 XXXXX', boardedAt: '08:16 AM', stopName: 'Morappur Bus Stand' },
      { id: 'EMIS-4822', name: 'R. Vignesh', classGrade: '9th Standard B', parentPhone: '97890 XXXXX', boardedAt: '08:17 AM', stopName: 'Morappur Bus Stand' },
      { id: 'EMIS-4823', name: 'S. Dhanalakshmi', classGrade: '12th Standard C', parentPhone: '96550 XXXXX', boardedAt: '08:25 AM', stopName: 'Kadayampatti Colony Stop' },
      { id: 'EMIS-4824', name: 'K. Surya', classGrade: '11th Standard Bio', parentPhone: '94431 XXXXX', boardedAt: null, stopName: 'Matlampatti High School Junction' },
    ],
    smsLog: [
      { time: '08:16 AM', text: 'TNSTC ALERT: Your ward M. Kaviya boarded Bus 14A at Morappur Stop. Status: Punctual.' },
      { time: '08:33 AM', text: 'TNSTC ALERT: Bus 14A is approaching Matlampatti Stop. Speed: 38 km/h. ETA to School: 14 mins.' },
    ],
  },
  {
    id: 'BUS-07B',
    routeNumber: '7B (Feeder Service)',
    district: 'Salem',
    originVillage: 'Kadayampatti West',
    destinationSchool: 'Government Model School, Deevattipatti',
    busRegNo: 'TN-30-N-2190',
    depot: 'Omalur Depot (Salem Division)',
    driverName: 'P. Arumugam',
    conductorName: 'V. Senthilkumar',
    driverPhone: '94435 87654',
    depotHotline: '0427-2415100',
    morningPickup: '08:20 AM',
    schoolArrival: '08:45 AM',
    eveningDismissalPickup: '04:30 PM',
    eveningDrop: '04:55 PM',
    speed: 42,
    crowdLevel: 'Moderate • Student Priority',
    status: 'In Transit • On Time',
    statusColor: 'emerald',
    currentStopIndex: 1,
    progress: 35,
    stops: [
      {
        name: 'Kadayampatti West Panchayat Office',
        time: '08:20 AM',
        passed: true,
        isSchool: false,
        coords: [11.8340, 78.0780],
        desc: 'Village centre departure node.',
      },
      {
        name: 'Danishpet Railway Crossing',
        time: '08:31 AM',
        passed: false,
        isCurrent: true,
        isSchool: false,
        coords: [11.8680, 78.1120],
        desc: 'Railway gate crossover point.',
      },
      {
        name: 'Kamalapuram Branch Road',
        time: '08:39 AM',
        passed: false,
        isSchool: false,
        coords: [11.8420, 78.0650],
        desc: 'Connecting feeder rural students.',
      },
      {
        name: 'Govt Model School Deevattipatti',
        time: '08:45 AM',
        passed: false,
        isSchool: true,
        coords: [11.8150, 78.1020],
        desc: 'Government Model Higher Secondary School campus.',
      },
    ],
    corridorPath: [
      [11.8340, 78.0780],
      [11.8510, 78.0950],
      [11.8680, 78.1120],
      [11.8550, 78.0850],
      [11.8420, 78.0650],
      [11.8280, 78.0820],
      [11.8150, 78.1020],
    ],
    studentPassengers: [
      { id: 'EMIS-3101', name: 'A. Sathish', classGrade: '11th Standard Bio', parentPhone: '98411 XXXXX', boardedAt: '08:21 AM', stopName: 'Kadayampatti West Panchayat Office' },
      { id: 'EMIS-3102', name: 'P. Priyadharshini', classGrade: '10th Standard C', parentPhone: '97880 XXXXX', boardedAt: '08:22 AM', stopName: 'Kadayampatti West Panchayat Office' },
    ],
    smsLog: [
      { time: '08:21 AM', text: 'TNSTC ALERT: Bus 7B departed Kadayampatti West. 45 students on board. Safety verified.' },
    ],
  },
  {
    id: 'BUS-21C',
    routeNumber: '21C (Rural Feeder)',
    district: 'Dharmapuri',
    originVillage: 'Pennagaram Colony',
    destinationSchool: 'Government Girls Higher Secondary School, Pennagaram',
    busRegNo: 'TN-29-N-4512',
    depot: 'Pennagaram Depot',
    driverName: 'M. Selvam',
    conductorName: 'G. Natarajan',
    driverPhone: '94420 45678',
    depotHotline: '04342-255200',
    morningPickup: '08:10 AM',
    schoolArrival: '08:40 AM',
    eveningDismissalPickup: '04:25 PM',
    eveningDrop: '04:55 PM',
    speed: 35,
    crowdLevel: 'Girl Students Priority Escort',
    status: 'Approaching School Gate',
    statusColor: 'emerald',
    currentStopIndex: 2,
    progress: 85,
    stops: [
      {
        name: 'Pennagaram Rural Colony',
        time: '08:10 AM',
        passed: true,
        isSchool: false,
        coords: [12.1220, 77.8850],
        desc: 'Welfare colony pickup stop.',
      },
      {
        name: 'Kuttaiyur Forest Cross',
        time: '08:20 AM',
        passed: true,
        isSchool: false,
        coords: [12.1290, 77.9080],
        desc: 'Forest fringe community stop.',
      },
      {
        name: 'Boganapalli Primary Health Centre',
        time: '08:30 AM',
        passed: true,
        isSchool: false,
        coords: [12.1340, 77.9250],
        desc: 'Primary health center junction.',
      },
      {
        name: 'Govt Girls HSS Pennagaram',
        time: '08:40 AM',
        passed: false,
        isCurrent: true,
        isSchool: true,
        coords: [12.1380, 77.9400],
        desc: 'Government Girls HSS main campus entrance.',
      },
    ],
    corridorPath: [
      [12.1220, 77.8850],
      [12.1250, 77.8960],
      [12.1290, 77.9080],
      [12.1315, 77.9170],
      [12.1340, 77.9250],
      [12.1360, 77.9330],
      [12.1380, 77.9400],
    ],
    studentPassengers: [
      { id: 'EMIS-5510', name: 'S. Ananya', classGrade: '8th Standard A', parentPhone: '99440 XXXXX', boardedAt: '08:11 AM', stopName: 'Pennagaram Rural Colony' },
      { id: 'EMIS-5511', name: 'K. Meenakshi', classGrade: '12th Standard Arts', parentPhone: '98425 XXXXX', boardedAt: '08:12 AM', stopName: 'Pennagaram Rural Colony' },
    ],
    smsLog: [
      { time: '08:12 AM', text: 'TNSTC ALERT: Student boarded Bus 21C. Escorted service for Girls School.' },
      { time: '08:35 AM', text: 'TNSTC ALERT: Bus is 1.2 km from Govt Girls HSS Pennagaram. Estimated arrival in 4 mins.' },
    ],
  },
  {
    id: 'BUS-09D',
    routeNumber: '9D (Highway Link)',
    district: 'Dindigul',
    originVillage: 'Siluvathur Colony',
    destinationSchool: 'Government Model School, Shanmuganathapuram',
    busRegNo: 'TN-57-N-1823',
    depot: 'Dindigul Moffussil Depot',
    driverName: 'C. Palanisamy',
    conductorName: 'R. Velusamy',
    driverPhone: '94438 67890',
    depotHotline: '0451-2422100',
    morningPickup: '08:25 AM',
    schoolArrival: '08:52 AM',
    eveningDismissalPickup: '04:40 PM',
    eveningDrop: '05:07 PM',
    speed: 30,
    crowdLevel: 'Standing Only • Depot Reinforcement Requested',
    status: 'Delayed 6 Mins due to Traffic',
    statusColor: 'amber',
    currentStopIndex: 1,
    progress: 40,
    stops: [
      {
        name: 'Siluvathur Village Centre',
        time: '08:25 AM',
        passed: true,
        isSchool: false,
        coords: [10.3250, 78.0950],
        desc: 'Siluvathur bus shelter.',
      },
      {
        name: 'Reddiarchatram Junction',
        time: '08:36 AM',
        passed: false,
        isCurrent: true,
        isSchool: false,
        coords: [10.4280, 77.8920],
        desc: 'Major four-way junction.',
      },
      {
        name: 'Murugabavanam Bypass',
        time: '08:45 AM',
        passed: false,
        isSchool: false,
        coords: [10.3750, 77.9710],
        desc: 'Highway diversion intersection.',
      },
      {
        name: 'Govt Model School Shanmuganathapuram',
        time: '08:52 AM',
        passed: false,
        isSchool: true,
        coords: [10.3620, 77.9850],
        desc: 'Government Model School entrance.',
      },
    ],
    corridorPath: [
      [10.3250, 78.0950],
      [10.3550, 78.0350],
      [10.4280, 77.8920],
      [10.4010, 77.9350],
      [10.3750, 77.9710],
      [10.3620, 77.9850],
    ],
    studentPassengers: [
      { id: 'EMIS-6201', name: 'T. Karthik', classGrade: '10th Standard B', parentPhone: '97870 XXXXX', boardedAt: '08:26 AM', stopName: 'Siluvathur Village Centre' },
    ],
    smsLog: [
      { time: '08:27 AM', text: 'TNSTC ALERT: Bus 9D departed Siluvathur. Moderate rush observed.' },
      { time: '08:38 AM', text: 'TNSTC ALERT: 6-minute delay near Reddiarchatram. School Headmaster notified.' },
    ],
  },
];

// Helper to calculate the live bus GPS coordinates dynamically
export function getBusLiveCoords(bus) {
  if (!bus || !bus.stops || bus.stops.length === 0) {
    return [12.0528, 78.3982];
  }

  // If bus has reached the final stop (school)
  const isFinished =
    bus.currentStopIndex >= bus.stops.length - 1 ||
    bus.progress >= 100 ||
    bus.statusType === 'arrived';

  if (isFinished) {
    const lastStop = bus.stops[bus.stops.length - 1];
    return lastStop.coords || [12.1315, 78.1585];
  }

  const currIdx = Math.max(0, Math.min(bus.stops.length - 2, bus.currentStopIndex || 0));
  const currStop = bus.stops[currIdx];
  const nextStop = bus.stops[currIdx + 1];

  if (!currStop.coords || !nextStop.coords) {
    return [12.0528, 78.3982];
  }

  // Calculate interpolation factor along this segment
  // Usually the bus has departed currStop and is en route to nextStop (around 65% of segment)
  const segmentRatio = 0.65;
  const lat = currStop.coords[0] + (nextStop.coords[0] - currStop.coords[0]) * segmentRatio;
  const lng = currStop.coords[1] + (nextStop.coords[1] - currStop.coords[1]) * segmentRatio;

  return [Number(lat.toFixed(6)), Number(lng.toFixed(6))];
}
