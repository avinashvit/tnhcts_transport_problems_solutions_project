import React, { useState, useMemo } from 'react';
import { useIssues } from '../context/IssuesContext';
import { CATEGORIES } from '../data/sampleIssues';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function StudentTrackStatus({ onNavigateToReport }) {
  const { issues } = useIssues();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          i.schoolName.toLowerCase().includes(q) ||
          i.village.toLowerCase().includes(q) ||
          i.district.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (activeFilter !== 'All' && i.status !== activeFilter) {
        return false;
      }
      return true;
    });
  }, [issues, searchQuery, activeFilter]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono">
      {/* Top Banner */}
      <div className="bg-white border-2 border-black rounded-xl p-6 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            // STUDENT & VILLAGE COMMUTER VIEW
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Track Grievance & Resolution Status
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Monitor real-time survey results and official TNSTC depot actions taken on reported routes.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="neo-btn px-4 py-2 bg-black text-white text-xs font-bold flex-shrink-0 hover:bg-slate-900"
        >
          + Report Another Issue
        </button>
      </div>

      {/* Search Input & Status Filter Pills */}
      <div className="bg-white p-4 rounded-xl border-2 border-black shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search village, government school, district, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Reported', 'In Progress', 'Resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`text-xs px-2.5 py-1 rounded font-bold border-2 border-black transition-all ${
                activeFilter === s
                  ? 'bg-black text-white shadow-neo-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{activeFilter === s ? '✓ ' : '□ '}</span>
              <span>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border-2 border-black text-slate-500 text-xs shadow-neo">
            No reports found matching your search. Try typing your village or school name.
          </div>
        ) : (
          filtered.map((issue) => {
            const cat = CATEGORIES[issue.category] || CATEGORIES.other;
            const isResolved = issue.status === 'Resolved';

            return (
              <div
                key={issue.id}
                className={`bg-white rounded-xl border-2 border-black p-5 sm:p-6 shadow-neo space-y-3.5 transition-all hover:shadow-neo-lg ${
                  isResolved ? 'bg-emerald-50/15' : ''
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-black px-2 py-0.5 rounded bg-slate-100 border border-black">
                      #{issue.id}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {issue.reportedDate}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-slate-100 border border-black">
                      {cat.label}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded text-xs font-bold border-2 border-black ${
                      isResolved
                        ? 'bg-[#86efac] text-black shadow-neo-sm'
                        : issue.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    Status: {issue.status}
                  </span>
                </div>

                {/* Route Destination Title */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {issue.village} ➔ {issue.schoolName}
                  </h3>
                  <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                    <span>District: <strong className="text-black">{issue.district}</strong></span>
                    <span>•</span>
                    <span>Approx. <strong className="text-black">{issue.affectedStudents}</strong> students affected</span>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 bg-slate-50 border border-black rounded text-xs text-slate-800">
                  <span className="font-bold block mb-1 text-[10px] text-slate-500 uppercase">
                    Reported Transport Difficulty:
                  </span>
                  <p className="leading-relaxed">{issue.description}</p>
                </div>

                {/* Official Response Section */}
                <div
                  className={`p-3 rounded text-xs space-y-1 border-2 border-black ${
                    isResolved
                      ? 'bg-[#86efac]/20 text-slate-950'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Official Department Action / Response:</span>
                  </div>
                  <p className="italic text-xs text-slate-700">
                    "{issue.officialNotes || 'Report received. Under preliminary review by the Block Educational Officer and TNSTC Depot traffic supervisor.'}"
                  </p>
                  {isResolved && (
                    <div className="text-[11px] font-bold text-emerald-900 pt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Issue verified and resolved. Route pin cleared from active dispatch map.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
