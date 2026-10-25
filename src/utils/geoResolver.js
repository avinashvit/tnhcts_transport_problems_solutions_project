import { TN_DISTRICT_COORDS } from '../data/sampleIssues';

// Known hubs, taluks, and towns across Tamil Nadu districts
export const TN_TOWNS = {
  // Nilgiris
  ooty: [11.4102, 76.6950],
  udhagamandalam: [11.4102, 76.6950],
  coonoor: [11.3530, 76.7959],
  kotagiri: [11.4239, 76.8665],
  gudalur: [11.5074, 76.4971],
  wellington: [11.3688, 76.7865],
  kundah: [11.2650, 76.6600],
  pandalur: [11.4800, 76.3800],

  // Dharmapuri
  dharmapuri: [12.1211, 78.1583],
  pennagaram: [12.1333, 77.9000],
  morappur: [12.1480, 78.4080],
  harur: [12.0667, 78.5000],
  palacode: [12.3000, 78.0833],
  periyampatti: [12.1150, 78.3650],
  karimangalam: [12.3000, 78.2000],
  nallampalli: [12.0500, 78.1167],
  marandahalli: [12.4000, 78.0000],

  // Salem
  salem: [11.6643, 78.1460],
  omalur: [11.7450, 78.0420],
  attur: [11.5950, 78.6000],
  mettur: [11.7967, 77.8000],
  yercaud: [11.7753, 78.2093],
  sankari: [11.4833, 77.8667],
  semmandapatti: [11.7760, 78.0210],
  edappadi: [11.5833, 77.8500],
  valapady: [11.6500, 78.4167],

  // Tiruvannamalai
  tiruvannamalai: [12.2253, 79.0747],
  chengam: [12.3080, 78.8050],
  melpadur: [12.2850, 78.7620],
  polur: [12.5000, 79.1333],
  arani: [12.6667, 79.2833],
  cheyyar: [12.6583, 79.5417],
  vandavasi: [12.5000, 79.6167],
  kalasapakkam: [12.4167, 79.1167],
  vadamathur: [12.2400, 79.0200],

  // Dindigul
  dindigul: [10.3673, 77.9803],
  palani: [10.4500, 77.5167],
  kodaikanal: [10.2381, 77.4892],
  natham: [10.2167, 78.2333],
  oddanchatram: [10.4833, 77.7500],
  nilakkottai: [10.1667, 77.8667],
  reddiarchatram: [10.3200, 77.9400],
  vedasandur: [10.5333, 77.9500],

  // Coimbatore
  coimbatore: [11.0168, 76.9558],
  pollachi: [10.6609, 77.0048],
  mettupalayam: [11.3000, 76.9333],
  sulur: [11.0267, 77.1264],
  valparai: [10.3262, 76.9554],
  annur: [11.2333, 77.1333],
  thondamuthur: [10.9833, 76.8333],

  // Madurai
  madurai: [9.9252, 78.1198],
  melur: [10.0320, 78.3380],
  usilampatti: [9.9667, 77.7833],
  thirumangalam: [9.8222, 77.9861],
  vadipatti: [10.0833, 77.9667],
  kottampatti: [10.1650, 78.3900],
  sholavandan: [10.0167, 78.0000],

  // Tenkasi
  tenkasi: [8.9594, 77.3161],
  kadayanallur: [9.0750, 77.3450],
  sankarankovil: [9.1700, 77.5300],
  shenkottai: [8.9833, 77.2500],
  alangulam: [8.8667, 77.5000],
  karisalkudieruppu: [9.0520, 77.3100],

  // Krishnagiri
  krishnagiri: [12.5186, 78.2138],
  hosur: [12.7409, 77.8253],
  bargur: [12.5480, 78.3580],
  denkanikottai: [12.5333, 77.7833],
  pochampalli: [12.3333, 78.3667],
  mittapalli: [12.5180, 78.3300],

  // Chennai
  chennai: [13.0827, 80.2707],
  tambaram: [12.9249, 80.1000],
  guindy: [13.0067, 80.2025],
  avadi: [13.1147, 80.1018],
  ambattur: [13.0978, 80.1611],
  velachery: [12.9750, 80.2200],

  // Tiruchirappalli
  tiruchirappalli: [10.7905, 78.7047],
  trichy: [10.7905, 78.7047],
  srirangam: [10.8622, 78.6908],
  thuraiyur: [11.1444, 78.5956],
  manapparai: [10.6083, 78.4167],
  lalgudi: [10.8667, 78.8167],

  // Tirunelveli
  tirunelveli: [8.7139, 77.7567],
  palayamkottai: [8.7167, 77.7333],
  ambasamudram: [8.7000, 77.4500],
  nanguneri: [8.4833, 77.6667],

  // Kanyakumari
  nagercoil: [8.1833, 77.4119],
  kanyakumari: [8.0883, 77.5385],
  padmanabhapuram: [8.2500, 77.3333],
  marthandam: [8.3000, 77.2167],

  // Thanjavur
  thanjavur: [10.7870, 79.1378],
  kumbakonam: [10.9602, 79.3845],
  pattukkottai: [10.4333, 79.3167],

  // Erode
  erode: [11.3410, 77.7172],
  gobichettipalayam: [11.4500, 77.4333],
  bhavani: [11.4500, 77.6833],
  sathyamangalam: [11.5000, 77.2333],

  // Vellore
  vellore: [12.9165, 79.1325],
  katpadi: [12.9833, 79.1333],
  gudiyatham: [12.9467, 78.8700],
};

/**
 * Clean a place string for matching
 */
function normalizePlace(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Generate a consistent pseudo-random coordinate offset from a string
 */
function hashToOffset(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const norm1 = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.04;
  const norm2 = ((Math.abs(hash >> 3) % 1000) / 1000 - 0.5) * 0.04;
  return [Number(norm1.toFixed(4)), Number(norm2.toFixed(4))];
}

/**
 * Resolve accurate coordinates for village and school given district and names
 */
export function resolveLocationCoords(district, villageName, schoolName) {
  const normVillage = normalizePlace(villageName);
  const normDistrict = normalizePlace(district);

  // 1. Check if the village name contains any known town in Tamil Nadu
  let matchedCoords = null;
  for (const [key, coords] of Object.entries(TN_TOWNS)) {
    if (normVillage.includes(key) || key.includes(normVillage)) {
      matchedCoords = coords;
      break;
    }
  }

  // 2. If not matched by village, check district baseline
  const districtBaseline = TN_DISTRICT_COORDS[district] || [11.127, 78.656];

  let villageBase;
  if (matchedCoords) {
    villageBase = matchedCoords;
  } else {
    // Add small deterministic jitter within district borders
    const [dLat, dLng] = hashToOffset(normVillage || 'village');
    villageBase = [
      Number((districtBaseline[0] + dLat).toFixed(4)),
      Number((districtBaseline[1] + dLng).toFixed(4)),
    ];
  }

  // 3. School is positioned along the corridor (approx 1.5 - 2.5 km away)
  const [sLatOffset, sLngOffset] = hashToOffset(schoolName || 'school');
  const schoolCoords = [
    Number((villageBase[0] + (Math.abs(sLatOffset) + 0.015)).toFixed(4)),
    Number((villageBase[1] + (Math.abs(sLngOffset) + 0.015)).toFixed(4)),
  ];

  return {
    villageCoords: villageBase,
    schoolCoords: schoolCoords,
  };
}
