import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLiveDatabase } from '../context/LiveDatabaseContext';
import { getBusLiveCoords } from '../data/busData';
import {
  Bus,
  MapPin,
  Navigation,
  School,
  LocateFixed,
  Maximize2,
  Clock,
  Phone,
  ShieldCheck,
  Users,
  Eye,
  Layers,
  Radio,
  Sparkles,
} from 'lucide-react';

export default function LiveBusMap({
  selectedBusId: externalSelectedBusId,
  onSelectBus,
  height = '520px',
  showControls = true,
  compact = false,
}) {
  const { buses, students, lastSyncTime } = useLiveDatabase();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    polylines: null,
    stops: null,
    buses: null,
    schools: null,
  });

  // Selected route: either specific bus ID or 'all'
  const [internalSelectedBusId, setInternalSelectedBusId] = useState(
    externalSelectedBusId || (buses[0]?.id || 'BUS-14A')
  );

  const activeBusId = externalSelectedBusId || internalSelectedBusId;
  const isAllBusesMode = activeBusId === 'all';

  // Toggleable layers
  const [showStopsLayer, setShowStopsLayer] = useState(true);
  const [showPolylineLayer, setShowPolylineLayer] = useState(true);
  const [autoCenterOnSync, setAutoCenterOnSync] = useState(false);

  // Active single bus object (if not 'all')
  const currentBus = buses.find((b) => b.id === activeBusId) || buses[0];

  // Synchronize internal selection with external prop
  useEffect(() => {
    if (externalSelectedBusId) {
      setInternalSelectedBusId(externalSelectedBusId);
    }
  }, [externalSelectedBusId]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center on Central Tamil Nadu
    const map = L.map(mapContainerRef.current, {
      center: [11.8, 78.2],
      zoom: 10,
      zoomControl: false, // Custom placed zoom controls
      scrollWheelZoom: true,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | TNSTC Live GPS',
      maxZoom: 19,
      minZoom: 6,
    }).addTo(map);

    // Zoom control with neo-brutalist placement
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create Layer Groups
    const polylines = L.layerGroup().addTo(map);
    const stops = L.layerGroup().addTo(map);
    const schools = L.layerGroup().addTo(map);
    const busMarkers = L.layerGroup().addTo(map);

    layersRef.current = { polylines, stops, schools, buses: busMarkers };
    mapInstanceRef.current = map;

    // Handle container resize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Draw Routes, Stops, Bus Locations & Details
  useEffect(() => {
    const map = mapInstanceRef.current;
    const { polylines, stops, schools, buses: busMarkers } = layersRef.current;
    if (!map || !polylines || !stops || !schools || !busMarkers) return;

    // Clear all layers before re-rendering
    polylines.clearLayers();
    stops.clearLayers();
    schools.clearLayers();
    busMarkers.clearLayers();

    const busesToRender = isAllBusesMode
      ? buses
      : [currentBus].filter(Boolean);

    const allBoundsCoords = [];

    busesToRender.forEach((bus) => {
      const liveCoords = getBusLiveCoords(bus);
      allBoundsCoords.push(liveCoords);

      // A. DRAW ROUTE CORRIDOR (POLYLINE)
      if (showPolylineLayer && bus.corridorPath && bus.corridorPath.length > 0) {
        bus.corridorPath.forEach((pt) => allBoundsCoords.push(pt));

        // Outer black border line
        L.polyline(bus.corridorPath, {
          color: '#09090b',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(polylines);

        // Inner styled line (vibrant emerald for normal, amber for delayed)
        const innerColor = bus.statusType === 'delayed' ? '#f59e0b' : '#10b981';
        L.polyline(bus.corridorPath, {
          color: innerColor,
          weight: 3.5,
          opacity: 1,
          dashArray: '6, 6',
          lineCap: 'round',
        }).addTo(polylines);

        // Highlight traversed segment up to current stop
        const currentStopIdx = bus.currentStopIndex || 0;
        if (bus.stops && bus.stops.length > 0) {
          const passedStopsCoords = bus.stops
            .slice(0, currentStopIdx + 1)
            .map((s) => s.coords)
            .filter(Boolean);

          if (passedStopsCoords.length >= 2) {
            L.polyline(passedStopsCoords, {
              color: '#047857',
              weight: 4.5,
              opacity: 1,
            }).addTo(polylines);
          }
        }
      }

      // B. DRAW STOPS MARKERS
      if (showStopsLayer && bus.stops && bus.stops.length > 0) {
        bus.stops.forEach((stop, idx) => {
          if (!stop.coords) return;
          allBoundsCoords.push(stop.coords);

          const isOrigin = idx === 0;
          const isDestination = stop.isSchool || idx === bus.stops.length - 1;
          const isPassed = stop.passed;
          const isCurrent = idx === bus.currentStopIndex;

          // Find students boarding at this stop
          const stopStudents = students.filter(
            (s) => s.busId === bus.id && (s.stopName === stop.name || idx === 0)
          );

          if (isDestination) {
            // ============ SCHOOL DESTINATION MARKER ============
            const schoolIcon = L.divIcon({
              className: 'custom-leaflet-school',
              iconSize: [44, 44],
              iconAnchor: [22, 42],
              popupAnchor: [0, -42],
              html: `
                <div style="cursor: pointer; text-align: center;">
                  <div style="width: 40px; height: 40px; background: #fbbf24; border: 2.5px solid #000; border-radius: 12px; box-shadow: 3px 3px 0px #000; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                    🏫
                  </div>
                  <div style="background: #000; color: #fff; font-size: 9px; font-weight: bold; font-family: monospace; padding: 1px 5px; border-radius: 4px; margin-top: 2px; white-space: nowrap; border: 1px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    ${stop.name.length > 20 ? stop.name.substring(0, 18) + '...' : stop.name}
                  </div>
                </div>
              `,
            });

            const schoolPopupContent = `
              <div style="font-family: monospace; min-width: 250px;">
                <div style="background: #fbbf24; border: 2px solid #000; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #78350f;">★ DESTINATION SCHOOL</span>
                  <div style="font-size: 13px; font-weight: bold; color: #000; margin-top: 2px;">${stop.name}</div>
                  <div style="font-size: 11px; color: #451a03; margin-top: 2px;">District: ${bus.district}</div>
                </div>
                <div style="border: 1.5px solid #000; padding: 8px; border-radius: 6px; background: #f8fafc; font-size: 11px; margin-bottom: 6px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #64748b;">Target Morning Bell:</span>
                    <strong style="color: #000;">${bus.schoolArrival}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #64748b;">Connecting Feeder:</span>
                    <strong style="color: #047857;">${bus.routeNumber}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #64748b;">Arrival Status:</span>
                    <strong style="color: ${bus.statusType === 'arrived' ? '#047857' : '#0284c7'};">
                      ${bus.statusType === 'arrived' ? '✓ Bus Safe Inside Gate' : 'Approaching'}
                    </strong>
                  </div>
                </div>
                <div style="font-size: 10px; color: #475569; background: #ecfdf5; border: 1px solid #059669; padding: 6px; border-radius: 4px;">
                  ✓ Free Bus Travel Scheme (G.O. Ms. No. 42) verified by Headmaster.
                </div>
              </div>
            `;

            L.marker(stop.coords, { icon: schoolIcon })
              .bindPopup(schoolPopupContent, { maxWidth: 300 })
              .addTo(schools);
          } else if (isOrigin) {
            // ============ ORIGIN VILLAGE MARKER ============
            const originIcon = L.divIcon({
              className: 'custom-leaflet-marker',
              iconSize: [36, 36],
              iconAnchor: [18, 34],
              popupAnchor: [0, -34],
              html: `
                <div style="cursor: pointer; text-align: center;">
                  <div style="width: 32px; height: 32px; background: #3b82f6; border: 2px solid #000; border-radius: 8px; box-shadow: 2.5px 2.5px 0px #000; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff;">
                    🏡
                  </div>
                  <div style="background: #fff; color: #000; font-size: 9px; font-weight: bold; font-family: monospace; padding: 1px 4px; border-radius: 3px; margin-top: 2px; white-space: nowrap; border: 1.5px solid #000;">
                    ${stop.name.split(' ')[0]}
                  </div>
                </div>
              `,
            });

            const originPopup = `
              <div style="font-family: monospace; min-width: 240px;">
                <div style="background: #dbeafe; border: 1.5px solid #000; padding: 6px 8px; border-radius: 6px; margin-bottom: 6px;">
                  <span style="font-size: 9px; font-weight: bold; color: #1e40af; text-transform: uppercase;">Origin Feeder Stop (Stop 01)</span>
                  <div style="font-size: 12px; font-weight: bold; color: #000;">${stop.name}</div>
                </div>
                <div style="font-size: 11px; margin-bottom: 4px;">
                  <strong>Departure Time:</strong> ${stop.time} (${stop.passed ? '✓ Departed' : 'Scheduled'})
                </div>
                <div style="font-size: 10px; color: #475569; margin-top: 4px;">
                  Primary village pickup node for ${stopStudents.length || 3} registered students.
                </div>
              </div>
            `;

            L.marker(stop.coords, { icon: originIcon })
              .bindPopup(originPopup, { maxWidth: 280 })
              .addTo(stops);
          } else {
            // ============ INTERMEDIATE EN-ROUTE STOPS ============
            let bg = '#ffffff';
            let borderColor = '#000000';
            let textColor = '#000000';
            let innerText = `0${idx + 1}`;

            if (isPassed) {
              bg = '#10b981';
              borderColor = '#000000';
              textColor = '#ffffff';
              innerText = '✓';
            } else if (isCurrent) {
              bg = '#fef08a';
              borderColor = '#000000';
              textColor = '#000000';
              innerText = '📍';
            }

            const stopIcon = L.divIcon({
              className: 'custom-leaflet-marker',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14],
              html: `
                <div style="cursor: pointer; text-align: center;">
                  <div style="width: 26px; height: 26px; background: ${bg}; border: 2px solid ${borderColor}; border-radius: 50%; box-shadow: 2px 2px 0px #000; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: ${textColor};">
                    ${innerText}
                  </div>
                  ${
                    isCurrent
                      ? `<div style="background: #000; color: #fde047; font-size: 8px; font-weight: bold; font-family: monospace; padding: 1px 4px; border-radius: 3px; position: absolute; top: -16px; left: 50%; transform: translateX(-50%); white-space: nowrap; border: 1px solid #fff;">NEXT</div>`
                      : ''
                  }
                </div>
              `,
            });

            const stopPopup = `
              <div style="font-family: monospace; min-width: 240px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-size: 9px; font-weight: bold; background: #000; color: #fff; padding: 1px 5px; border-radius: 3px;">STOP 0${idx + 1}</span>
                  <span style="font-size: 10px; font-weight: bold; color: ${isPassed ? '#059669' : isCurrent ? '#d97706' : '#64748b'};">
                    ${isPassed ? '✓ Passed' : isCurrent ? '● Approaching Now' : 'Upcoming'}
                  </span>
                </div>
                <div style="font-size: 12px; font-weight: bold; color: #000; margin-bottom: 4px;">${stop.name}</div>
                <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
                  Scheduled Pickup: <strong>${stop.time}</strong>
                </div>
                ${
                  stop.desc
                    ? `<div style="font-size: 10px; color: #64748b; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; margin-bottom: 6px;">${stop.desc}</div>`
                    : ''
                }
                <div style="border-top: 1px dashed #cbd5e1; padding-top: 5px; font-size: 10px;">
                  <strong>Students at this stop:</strong> ${stopStudents.length > 0 ? stopStudents.map((s) => s.name).join(', ') : 'Open feeder boarding'}
                </div>
              </div>
            `;

            L.marker(stop.coords, { icon: stopIcon })
              .bindPopup(stopPopup, { maxWidth: 280 })
              .addTo(stops);
          }
        });
      }

      // C. DRAW LIVE BUS VEHICLE MARKER
      const busIconColor = bus.statusType === 'delayed' ? '#f59e0b' : '#10b981';
      const busNumberShort = bus.routeNumber.split(' ')[0];

      const busIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        iconSize: [52, 52],
        iconAnchor: [26, 26],
        popupAnchor: [0, -26],
        html: `
          <div style="cursor: pointer; position: relative; text-align: center;">
            <!-- Outer Pulsing Halo -->
            <div style="position: absolute; top: 0; left: 0; width: 48px; height: 48px; background: ${busIconColor}; border-radius: 14px; opacity: 0.35; animation: pulse 1.5s infinite;"></div>
            
            <!-- Vehicle Badge -->
            <div style="position: relative; width: 44px; height: 44px; background: ${busIconColor}; border: 2.5px solid #000; border-radius: 12px; box-shadow: 3.5px 3.5px 0px #000; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #fff;">
              🚌
            </div>

            <!-- Route Tag -->
            <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: #000; color: #fff; font-size: 9px; font-weight: bold; font-family: monospace; padding: 1px 6px; border-radius: 4px; white-space: nowrap; border: 1.5px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
              ${busNumberShort} • ${bus.speed || 38}km/h
            </div>
          </div>
        `,
      });

      const busStudents = students.filter((s) => s.busId === bus.id);
      const boardedCount = busStudents.filter((s) => s.isBoarded).length;

      const busPopupContent = `
        <div style="font-family: monospace; min-width: 270px; padding: 2px;">
          <!-- Header -->
          <div style="background: #10b981; color: #fff; border: 2px solid #000; padding: 8px 10px; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; background: #000; color: #fff; padding: 1px 6px; border-radius: 3px;">
                ● LIVE GPS TELEMETRY
              </span>
              <span style="font-size: 11px; font-weight: bold;">${bus.busRegNo}</span>
            </div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 4px; color: #000;">
              ${bus.routeNumber}
            </div>
            <div style="font-size: 10px; opacity: 0.9; color: #064e3b;">
              ${bus.depot} • ${bus.district}
            </div>
          </div>

          <!-- Status & Corridor -->
          <div style="border: 1.5px solid #000; padding: 8px; border-radius: 6px; background: #f8fafc; font-size: 11px; margin-bottom: 6px; space-y-2;">
            <div style="margin-bottom: 5px;">
              <span style="color: #64748b; font-size: 10px; display: block; text-transform: uppercase;">Corridor:</span>
              <strong style="color: #000;">${bus.originVillage} ➔ ${bus.destinationSchool.split(',')[0]}</strong>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
              <div style="background: #fff; border: 1px solid #000; padding: 4px 6px; border-radius: 4px;">
                <span style="font-size: 9px; color: #64748b; display: block;">SPEED</span>
                <strong style="font-size: 13px; color: #000;">${bus.speed || 38} km/h</strong>
              </div>
              <div style="background: #fff; border: 1px solid #000; padding: 4px 6px; border-radius: 4px;">
                <span style="font-size: 9px; color: #64748b; display: block;">STUDENTS</span>
                <strong style="font-size: 13px; color: #059669;">${boardedCount} / ${busStudents.length || 3}</strong>
              </div>
            </div>

            <div style="margin-bottom: 4px;">
              <span style="color: #64748b; font-size: 10px;">Status:</span>
              <strong style="color: ${bus.statusType === 'delayed' ? '#b45309' : '#047857'}; margin-left: 4px;">
                ${bus.status}
              </strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 10px;">Target Arrival:</span>
              <strong style="color: #000; margin-left: 4px;">${bus.schoolArrival}</strong>
            </div>
          </div>

          <!-- Crew Contacts -->
          <div style="font-size: 10px; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px;">
            <div>Driver: <strong>${bus.driverName}</strong> (Ph: ${bus.driverPhone})</div>
            <div>Conductor: <strong>${bus.conductorName}</strong> | Depot: ${bus.depotHotline}</div>
          </div>

          <div style="text-align: center; font-size: 9px; color: #059669; font-weight: bold;">
            ✓ Real-time Sync with Driver Console & Parent Mobile
          </div>
        </div>
      `;

      L.marker(liveCoords, { icon: busIcon, zIndexOffset: 1000 })
        .bindPopup(busPopupContent, { maxWidth: 320 })
        .addTo(busMarkers);
    });

    // Auto-fit or Center on Map
    if (allBoundsCoords.length > 0) {
      if (isAllBusesMode) {
        // Fit all buses across Tamil Nadu
        map.fitBounds(allBoundsCoords, { padding: [50, 50], maxZoom: 13 });
      } else {
        // Center on the active bus route corridor
        map.fitBounds(allBoundsCoords, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [
    activeBusId,
    isAllBusesMode,
    buses,
    students,
    showStopsLayer,
    showPolylineLayer,
    lastSyncTime,
  ]);

  // Center specifically on the active bus marker
  const handleCenterOnBus = () => {
    if (!mapInstanceRef.current || !currentBus) return;
    const coords = getBusLiveCoords(currentBus);
    mapInstanceRef.current.setView(coords, 14, { animate: true });
  };

  // Fit entire corridor in view
  const handleFitCorridor = () => {
    if (!mapInstanceRef.current || !currentBus || !currentBus.stops) return;
    const coords = currentBus.stops.map((s) => s.coords).filter(Boolean);
    if (coords.length > 0) {
      mapInstanceRef.current.fitBounds(coords, { padding: [50, 50], animate: true });
    }
  };

  return (
    <div className="bg-white border-2 border-black rounded-2xl shadow-neo overflow-hidden flex flex-col font-mono">
      {/* Map Header & Multi-Route Toolbar */}
      {showControls && (
        <div className="bg-white border-b-2 border-black p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-20">
          {/* Left: Route Selector & Live Indicator */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-emerald-100 border border-black px-2.5 py-1 rounded shadow-neo-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950">
                LIVE GPS MAP
              </span>
            </div>

            {/* Route Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">Route:</span>
              <select
                value={activeBusId}
                onChange={(e) => {
                  const val = e.target.value;
                  setInternalSelectedBusId(val);
                  if (onSelectBus) onSelectBus(val);
                }}
                className="text-xs font-bold bg-white border-2 border-black rounded px-2.5 py-1.5 outline-none shadow-neo-sm focus:bg-amber-50 cursor-pointer"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.routeNumber} • {b.originVillage} ➔ {b.district}
                  </option>
                ))}
                <option value="all">★ Show All 4 Buses Across Tamil Nadu</option>
              </select>
            </div>
          </div>

          {/* Right: Map Controls & Layer Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Layer Toggles */}
            <button
              onClick={() => setShowStopsLayer(!showStopsLayer)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded border border-black flex items-center gap-1 transition-all ${
                showStopsLayer
                  ? 'bg-slate-900 text-white shadow-neo-sm'
                  : 'bg-white text-slate-600 opacity-60'
              }`}
              title="Toggle Stops and Timings on Map"
            >
              <MapPin className="w-3 h-3" />
              <span>Stops</span>
            </button>

            <button
              onClick={() => setShowPolylineLayer(!showPolylineLayer)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded border border-black flex items-center gap-1 transition-all ${
                showPolylineLayer
                  ? 'bg-slate-900 text-white shadow-neo-sm'
                  : 'bg-white text-slate-600 opacity-60'
              }`}
              title="Toggle Route Road Corridor"
            >
              <Navigation className="w-3 h-3" />
              <span>Path</span>
            </button>

            {/* Navigation Action Buttons */}
            {!isAllBusesMode && (
              <>
                <button
                  onClick={handleCenterOnBus}
                  className="text-[11px] font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-2.5 py-1 rounded border-2 border-black shadow-neo-sm flex items-center gap-1 transition-transform active:translate-y-0.5"
                  title="Refocus map on live bus location"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>Center Bus</span>
                </button>

                <button
                  onClick={handleFitCorridor}
                  className="text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-900 px-2 py-1 rounded border border-black shadow-neo-sm flex items-center gap-1"
                  title="Fit whole route inside map view"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Fit Route</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Telemetry Info Pill on Map (Bottom-Left) */}
        {!isAllBusesMode && currentBus && (
          <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm border-2 border-black rounded-xl p-3 shadow-neo max-w-xs sm:max-w-sm hidden sm:block">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase pb-1 border-b border-black/10">
              <span className="flex items-center gap-1 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{currentBus.routeNumber.split(' ')[0]} Telemetry</span>
              </span>
              <span>{currentBus.busRegNo}</span>
            </div>

            <div className="mt-2 text-xs font-bold text-slate-900">
              {currentBus.status}
            </div>

            <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-600">
              <span>Speed: <strong>{currentBus.speed} km/h</strong></span>
              <span>•</span>
              <span>
                Next: <strong>{currentBus.stops[currentBus.currentStopIndex + 1]?.name || 'School Gate'}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Map Legend Overlay (Top-Right) */}
        <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm border-2 border-black rounded-lg p-2.5 shadow-neo text-[10px] space-y-1.5 hidden md:block">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[9px] border-b border-black/20 pb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px] border border-black">
              🚌
            </span>
            <span>Live Govt Bus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-400 text-black flex items-center justify-center text-[10px] border border-black">
              🏫
            </span>
            <span>Govt School Gate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold border border-black">
              ✓
            </span>
            <span>Passed Village Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-yellow-300 text-black flex items-center justify-center text-[9px] font-bold border border-black">
              📍
            </span>
            <span>Next / Approaching</span>
          </div>
        </div>
      </div>

      {/* Clean Bottom Corridor Summary Strip */}
      {!isAllBusesMode && currentBus && (
        <div className="bg-slate-50 border-t-2 border-black p-3 px-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Corridor:</strong> {currentBus.originVillage} ➔ {currentBus.destinationSchool}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold">
            <span className="text-emerald-800">
              Driver: {currentBus.driverName} ({currentBus.driverPhone})
            </span>
            <span>Depot: {currentBus.depot}</span>
          </div>
        </div>
      )}
    </div>
  );
}
