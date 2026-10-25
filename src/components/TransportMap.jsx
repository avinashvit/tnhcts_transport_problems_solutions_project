import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CATEGORIES } from '../data/sampleIssues';
import { MapPin, Navigation, School, ExternalLink, RefreshCw, Sparkles, LocateFixed, CheckCircle2 } from 'lucide-react';

export default function TransportMap({ issues, onSelectIssue, highlightedId = null }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersMapRef = useRef(new Map()); // id -> { marker, coords }

  const [activeFilter, setActiveFilter] = useState('all'); // all, high, new
  const [selectedRouteId, setSelectedRouteId] = useState(highlightedId || '');
  const [showResolvedArchive, setShowResolvedArchive] = useState(false);

  // Active issues only (User requirement: "after resolved remove the pins from the map")
  const activeIssues = issues.filter((i) => i.status !== 'Resolved');
  const resolvedIssues = issues.filter((i) => i.status === 'Resolved');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Central Tamil Nadu
    const map = L.map(mapContainerRef.current, {
      center: [11.127, 78.656],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Force Leaflet to re-calculate dimensions after CSS rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

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

  // Update Markers and Routes whenever issues, activeFilter, or showResolvedArchive changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersMapRef.current.clear();

    // User requirement: after resolved remove the pins from the map
    const filtered = issues.filter((issue) => {
      // By default: Resolved issues have their pins REMOVED from the map
      if (issue.status === 'Resolved' && !showResolvedArchive) {
        return false;
      }

      if (activeFilter === 'high') return issue.priority === 'High';
      if (activeFilter === 'new') return issue.isNew || issue.status === 'Reported';
      return true;
    });

    const bounds = [];
    let targetFocusCoords = null;
    let targetMarkerToOpen = null;

    filtered.forEach((issue) => {
      if (!issue.villageCoords || !issue.schoolCoords) return;

      const [vLat, vLng] = issue.villageCoords;
      const [sLat, sLng] = issue.schoolCoords;

      bounds.push([vLat, vLng]);
      bounds.push([sLat, sLng]);

      const catInfo = CATEGORIES[issue.category] || CATEGORIES.other;
      const isResolved = issue.status === 'Resolved';
      const isHighPriority = issue.priority === 'High';
      const isNew = Boolean(issue.isNew);

      // Pin color based on status and priority
      const pinColor = isNew
        ? '#dc2626'
        : isResolved
        ? '#16a34a'
        : isHighPriority
        ? '#b91c1c'
        : '#d97706';

      // Custom HTML Marker for Village
      const villageIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${
              isNew
                ? `<span style="
                    position: absolute;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: rgba(220, 38, 38, 0.4);
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></span>`
                : ''
            }
            <div style="
              background-color: ${pinColor};
              width: ${isNew ? '32px' : '28px'};
              height: ${isNew ? '32px' : '28px'};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 3px 8px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: ${isNew ? '12px' : '11px'};
              font-weight: 800;
              cursor: pointer;
              z-index: ${isNew ? '100' : '10'};
            " title="${issue.village}">
              <span>${issue.affectedStudents}</span>
            </div>
            ${
              isNew
                ? `<span style="
                    position: absolute;
                    top: -12px;
                    background: #14532d;
                    color: white;
                    font-size: 9px;
                    font-weight: bold;
                    padding: 1px 4px;
                    border-radius: 3px;
                    border: 1px solid white;
                    white-space: nowrap;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  ">NEW</span>`
                : ''
            }
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // School Destination Marker (Green school icon)
      const schoolIcon = L.divIcon({
        className: 'custom-leaflet-school',
        html: `
          <div style="
            background-color: #14532d;
            width: 26px;
            height: 26px;
            border-radius: 6px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
            cursor: pointer;
          " title="${issue.schoolName}">
            🏫
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      // Corridor connector line
      L.polyline([[vLat, vLng], [sLat, sLng]], {
        color: isNew ? '#dc2626' : isResolved ? '#16a34a' : isHighPriority ? '#ef4444' : '#f59e0b',
        weight: isNew ? 4 : 3,
        opacity: isNew ? 0.9 : 0.75,
        dashArray: isResolved ? 'none' : '5, 8',
      }).addTo(layer);

      // Village marker with interactive popup
      const vMarker = L.marker([vLat, vLng], { icon: villageIcon }).addTo(layer);

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; min-width: 240px;">
          ${
            isNew
              ? `<div style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; margin-bottom: 6px; display: inline-block;">
                  ✨ NEWLY REPORTED FROM STUDENT PORTAL
                </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #1e293b; font-size: 14px;">${issue.village}</span>
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${
              issue.priority === 'High' ? '#fee2e2; color: #991b1b' : '#fef3c7; color: #92400e'
            }; font-weight: 600;">${issue.priority} Priority</span>
          </div>
          <div style="color: #64748b; font-size: 12px; margin-bottom: 6px;">
            District: <strong>${issue.district}</strong> • Ref: <strong>${issue.id}</strong>
          </div>
          <div style="margin-bottom: 6px;">
            <span style="color: #475569;">Government School:</span><br/>
            <strong>${issue.schoolName}</strong>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px; margin: 6px 0;">
            <div style="font-size: 11px; color: #64748b;">Problem Category</div>
            <div style="font-weight: 600; color: #0f172a;">${catInfo.label}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Affected Students: <strong style="color: #0f172a;">${issue.affectedStudents} commuters</strong></div>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Status: <span style="font-weight: 600; color: ${
              issue.status === 'Resolved' ? '#166534' : issue.status === 'In Progress' ? '#1e40af' : '#b45309'
            }">${issue.status}</span>
          </div>
        </div>
      `;

      vMarker.bindPopup(popupHtml);
      vMarker.on('click', () => {
        if (onSelectIssue) onSelectIssue(issue);
      });

      markersMapRef.current.set(issue.id, { marker: vMarker, coords: [vLat, vLng] });

      // School marker
      const sMarker = L.marker([sLat, sLng], { icon: schoolIcon }).addTo(layer);
      sMarker.bindPopup(`
        <div style="font-size: 13px;">
          <strong style="color: #14532d;">${issue.schoolName}</strong>
          <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Serving feeder students from ${issue.village} (${issue.district} District)</div>
        </div>
      `);

      // If this is the newly added issue or selected route, focus on it
      if (issue.id === selectedRouteId || (isNew && !selectedRouteId)) {
        targetFocusCoords = [vLat, vLng];
        targetMarkerToOpen = vMarker;
      }
    });

    // Make sure map dimensions are calculated
    map.invalidateSize();

    // If specific route is targeted, fly to it; otherwise fit all bounds
    if (targetFocusCoords && targetMarkerToOpen) {
      map.flyTo(targetFocusCoords, 11, { duration: 0.9 });
      setTimeout(() => {
        targetMarkerToOpen.openPopup();
      }, 350);
    } else if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 9 });
      } catch (e) {
        // Fallback
      }
    }
  }, [issues, activeFilter, selectedRouteId, showResolvedArchive]);

  const handleFocusRoute = (issueId) => {
    setSelectedRouteId(issueId);
    const item = markersMapRef.current.get(issueId);
    if (item && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(item.coords, 11, { duration: 0.8 });
      setTimeout(() => {
        item.marker.openPopup();
      }, 400);
    }
  };

  const resetView = () => {
    setSelectedRouteId('');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([11.127, 78.656], 7);
    }
  };

  // Only unresolved/active corridors are listed in the dropdown and bottom strip
  const displayCorridors = showResolvedArchive ? issues : activeIssues;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      {/* Map Header with controls */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-800" />
            <h3 className="font-semibold text-slate-800 text-base">Tamil Nadu School Route Transit Map</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
              {activeIssues.length} Active Bottlenecks Pinned
            </span>
            {resolvedIssues.length > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {resolvedIssues.length} Resolved (Pins Removed)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time map showing active student transport barriers. <strong>Pins are automatically removed once marked 'Resolved'.</strong>
          </p>
        </div>

        {/* Filter controls and route selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Route Jumper Dropdown (only active un-resolved routes) */}
          <div className="flex items-center gap-1.5 text-xs">
            <LocateFixed className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedRouteId}
              onChange={(e) => handleFocusRoute(e.target.value)}
              className="text-xs p-1.5 rounded border border-slate-300 bg-white text-slate-800 font-medium focus:border-emerald-700 outline-none max-w-[210px]"
            >
              <option value="">-- Active Corridors ({displayCorridors.length}) --</option>
              {displayCorridors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.isNew ? '✨ [NEW] ' : ''}
                  {i.village} ({i.district})
                </option>
              ))}
            </select>
          </div>

          <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-xs shadow-sm">
            <button
              onClick={() => {
                setActiveFilter('all');
                setSelectedRouteId('');
              }}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === 'all' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Active ({activeIssues.length})
            </button>
            <button
              onClick={() => {
                setActiveFilter('new');
                setSelectedRouteId('');
              }}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === 'new' ? 'bg-red-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Reports
            </button>
            <button
              onClick={() => {
                setActiveFilter('high');
                setSelectedRouteId('');
              }}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === 'high' ? 'bg-red-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Priority
            </button>
          </div>

          {/* Optional archive toggle for resolved pins */}
          {resolvedIssues.length > 0 && (
            <button
              onClick={() => setShowResolvedArchive(!showResolvedArchive)}
              className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                showResolvedArchive
                  ? 'bg-emerald-700 text-white border-emerald-800 font-bold'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
              title="Toggle view of resolved pins"
            >
              {showResolvedArchive ? 'Hide Resolved' : `Show Resolved (${resolvedIssues.length})`}
            </button>
          )}

          <button
            onClick={resetView}
            title="Reset Map to Full Tamil Nadu View"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded border border-slate-200 bg-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative">
        <div ref={mapContainerRef} className="h-88 sm:h-96 w-full z-0" style={{ background: '#f1f5f9' }} />

        {/* Clean map legend */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-md p-2.5 shadow-sm text-xs space-y-1.5 pointer-events-auto max-w-[240px]">
          <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white inline-block shadow-xs flex-shrink-0"></span>
            <span className="text-slate-600 text-[11px]">Active Problem Origin (Village)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-900 border border-white inline-block shadow-xs flex-shrink-0 text-[9px] text-center text-white leading-3">🏫</span>
            <span className="text-slate-600 text-[11px]">Government School Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-red-500 inline-block flex-shrink-0"></span>
            <span className="text-slate-600 text-[11px]">Active Transit Corridor</span>
          </div>
          <div className="pt-1 border-t border-slate-100 text-[10px] text-emerald-800 font-medium">
            ✓ Resolved issues automatically removed from map
          </div>
        </div>
      </div>

      {/* Corridor Quick Highlights Strip (Active Issues only) */}
      <div className="p-3 bg-white border-t border-slate-200 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Unresolved Bottlenecks (Click to fly):
          </div>
          <span className="text-[11px] text-slate-400">
            {displayCorridors.length} active corridors on map
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {displayCorridors.slice(0, 4).map((issue) => (
            <div
              key={issue.id}
              onClick={() => handleFocusRoute(issue.id)}
              className={`p-2.5 border rounded cursor-pointer transition-all flex flex-col justify-between ${
                selectedRouteId === issue.id
                  ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700'
                  : issue.isNew
                  ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                  : 'border-slate-200 hover:border-emerald-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-[10px] font-bold text-slate-700">{issue.id}</span>
                  {issue.isNew && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white animate-pulse">
                      NEW
                    </span>
                  )}
                  <span
                    className={`text-[9px] px-1 rounded font-semibold ${
                      issue.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {issue.priority}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 line-clamp-1 text-xs">
                  {issue.village} ➔ {issue.schoolName}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {issue.district} • <strong className="text-slate-700">{issue.affectedStudents} students</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
