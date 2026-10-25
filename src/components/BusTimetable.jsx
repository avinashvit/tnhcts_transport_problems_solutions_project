import React, { useState, useMemo } from 'react';
import { Search, Clock, MapPin, School, ArrowRight, Bus, CheckCircle2 } from 'lucide-react';
import { TN_GOVT_BUS_ROUTES } from '../data/busData';

export default function BusTimetable({ onTrackRoute }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');

  const filteredRoutes = useMemo(() => {
    return TN_GOVT_BUS_ROUTES.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.routeNumber.toLowerCase().includes(q) ||
          r.originVillage.toLowerCase().includes(q) ||
          r.destinationSchool.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (districtFilter !== 'All' && r.district !== districtFilter) {
        return false;
      }
      return true;
    });
  }, [searchQuery, districtFilter]);

  const districts = ['All', 'Dharmapuri', 'Salem', 'Dindigul'];

  return (
    <div className="space-y-6 font-mono max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            // OFFICIAL TNSTC FEEDER TIMETABLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 lowercase tracking-tight mt-0.5">
            school bus schedules & timings
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Check official morning school pickup and evening return timings across rural feeder stops.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-black rounded text-[11px] text-slate-700 flex-shrink-0">
          <span className="font-bold block">100% Free Travel for Students</span>
          <span className="text-slate-500 text-[10px]">Uniform & Pass verified</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border-2 border-black shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search village, government school, or route number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border-2 border-black rounded bg-slate-50 font-bold outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setDistrictFilter(d)}
              className={`text-xs px-3 py-1.5 rounded font-bold border-2 border-black transition-all ${
                districtFilter === d
                  ? 'bg-black text-white shadow-neo-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {districtFilter === d ? '✓ ' : ''}{d}
            </button>
          ))}
        </div>
      </div>

      {/* Routes Grid styled with clean neo-brutalist reference aesthetic */}
      <div className="space-y-4">
        {filteredRoutes.map((route, idx) => {
          const badgeBg =
            idx % 3 === 0
              ? 'bg-[#68759e]' // periwinkle
              : idx % 3 === 1
              ? 'bg-[#10b981]' // emerald
              : 'bg-[#0f766e]'; // teal

          return (
            <div
              key={route.id}
              className="bg-white border-2 border-black rounded-2xl shadow-neo overflow-hidden flex flex-col md:flex-row items-stretch transition-all hover:shadow-neo-lg"
            >
              {/* Protruding Colored Block */}
              <div
                className={`${badgeBg} text-white p-5 md:w-52 flex-shrink-0 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 block">
                    ROUTE #{idx + 1}
                  </span>
                  <div className="text-2xl font-bold tracking-tight lowercase mt-1">
                    {route.routeNumber.split(' ')[0]}
                  </div>
                  <div className="text-[11px] font-semibold opacity-90 mt-0.5">
                    {route.busRegNo}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20">
                  <span className="text-[10px] block opacity-80 uppercase">Depot:</span>
                  <span className="text-xs font-bold block">{route.depot}</span>
                </div>
              </div>

              {/* Main Card Content */}
              <div className="flex-1 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        [ {route.district} DISTRICT ]
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        {route.originVillage} ➔ {route.destinationSchool}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded bg-slate-100 border border-black font-bold">
                        {route.status}
                      </span>
                    </div>
                  </div>

                  {/* Morning & Evening Timings Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-black rounded">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        Morning Pickup
                      </span>
                      <strong className="text-sm text-slate-900 block mt-0.5">
                        {route.morningPickup}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-black rounded">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        School Arrival
                      </span>
                      <strong className="text-sm text-emerald-800 block mt-0.5">
                        {route.schoolArrival}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-black rounded">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        Evening Dismissal
                      </span>
                      <strong className="text-sm text-slate-900 block mt-0.5">
                        {route.eveningDismissalPickup}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-black rounded">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        Home Drop-Off
                      </span>
                      <strong className="text-sm text-slate-900 block mt-0.5">
                        {route.eveningDrop}
                      </strong>
                    </div>
                  </div>

                  {/* Intermediate Stops Sequence */}
                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                      Stops Sequence on this Feeder Route:
                    </span>
                    <div className="flex flex-wrap gap-1.5 items-center text-xs">
                      {route.stops.map((stop, sIdx) => (
                        <React.Fragment key={sIdx}>
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-black/50 text-[11px] font-semibold text-slate-800">
                            {stop.name} ({stop.time})
                          </span>
                          {sIdx < route.stops.length - 1 && (
                            <span className="text-slate-400 font-bold">➔</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 border border-black flex items-center justify-center text-[9px] bg-black text-white"
                      >
                        ★
                      </div>
                    ))}
                    <span className="text-[11px] text-slate-500 ml-1.5 font-bold">
                      100% Punctuality Rating
                    </span>
                  </div>

                  <button
                    onClick={() => onTrackRoute(route.id)}
                    className="neo-btn px-4 py-2 bg-black text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800"
                  >
                    <span>[ 📱 Track Live Bus ➔ ]</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
