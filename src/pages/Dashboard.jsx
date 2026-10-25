import React, { useState } from 'react';
import { useIssues } from '../context/IssuesContext';
import TransportMap from '../components/TransportMap';
import IssueDetailModal from '../components/IssueDetailModal';
import NeoCardItem from '../components/NeoCardItem';
import { CATEGORIES } from '../data/sampleIssues';
import {
  AlertOctagon,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { issues, metrics, recentlyAddedId, updateIssueStatus } = useIssues();
  const [selectedIssue, setSelectedIssue] = useState(null);

  return (
    <div className="space-y-7 font-mono">
      {/* Overview Top Info Banner */}
      <div className="p-4 bg-white border-2 border-black rounded-xl shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-[#86efac] flex items-center justify-center font-bold text-sm rounded border border-black shadow-neo-sm">
            i
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tamil Nadu School Route Administration Portal
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Coordinating TNSTC bus routes, student commuter safety, and rural school access
            </div>
          </div>
        </div>

        <div className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 border border-black rounded text-slate-800">
          Statewide System Live
        </div>
      </div>

      {/* Exactly Four Summary Metrics Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            // Core Operational Metrics
          </span>
          <span className="text-[11px] text-slate-400">
            Auto-calculated from incoming reports
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Reported Problems */}
          <div className="bg-white border-2 border-black rounded-lg shadow-neo overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
            <div className="p-3 bg-black text-white flex items-center justify-between border-b-2 border-black">
              <span className="text-[11px] font-bold tracking-wider uppercase">
                / REPORTED
              </span>
              <AlertOctagon className="w-4 h-4 text-[#86efac]" />
            </div>
            <div className="p-4 flex items-baseline justify-between">
              <div>
                <div className="text-4xl font-bold text-slate-900">
                  {metrics.reportedProblems}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Active bottlenecks
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400">[01]</div>
            </div>
            <div className="px-4 py-2 border-t border-black/10 bg-slate-50 flex items-center justify-between text-[10px] text-slate-600">
              <span>status: open</span>
              <span className="text-black font-bold">100% indexed</span>
            </div>
          </div>

          {/* Metric 2: Affected Students */}
          <div className="bg-white border-2 border-black rounded-lg shadow-neo overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
            <div className="p-3 bg-[#68759e] text-white flex items-center justify-between border-b-2 border-black">
              <span className="text-[11px] font-bold tracking-wider uppercase">
                / COMMUTERS
              </span>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="p-4 flex items-baseline justify-between">
              <div>
                <div className="text-4xl font-bold text-slate-900">
                  {metrics.affectedStudents.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Daily students
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400">[02]</div>
            </div>
            <div className="px-4 py-2 border-t border-black/10 bg-slate-50 flex items-center justify-between text-[10px] text-slate-600">
              <span>district: all</span>
              <span className="text-blue-900 font-bold">est. ridership</span>
            </div>
          </div>

          {/* Metric 3: High-Priority Issues */}
          <div className="bg-white border-2 border-black rounded-lg shadow-neo overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
            <div className="p-3 bg-red-600 text-white flex items-center justify-between border-b-2 border-black">
              <span className="text-[11px] font-bold tracking-wider uppercase">
                / HIGH PRIORITY
              </span>
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="p-4 flex items-baseline justify-between">
              <div>
                <div className="text-4xl font-bold text-red-600">
                  {metrics.highPriorityIssues}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Urgent depot actions
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400">[03]</div>
            </div>
            <div className="px-4 py-2 border-t border-black/10 bg-slate-50 flex items-center justify-between text-[10px] text-slate-600">
              <span>action: immediate</span>
              <span className="text-red-600 font-bold">alert level 5</span>
            </div>
          </div>

          {/* Metric 4: Resolved Issues */}
          <div className="bg-white border-2 border-black rounded-lg shadow-neo overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
            <div className="p-3 bg-[#10b981] text-white flex items-center justify-between border-b-2 border-black">
              <span className="text-[11px] font-bold tracking-wider uppercase">
                / RESOLVED
              </span>
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="p-4 flex items-baseline justify-between">
              <div>
                <div className="text-4xl font-bold text-[#047857]">
                  {metrics.resolvedIssues}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Corridors resolved
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400">[04]</div>
            </div>
            <div className="px-4 py-2 border-t border-black/10 bg-slate-50 flex items-center justify-between text-[10px] text-slate-600">
              <span>pins: cleared</span>
              <span className="text-emerald-700 font-bold">verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map & Route Overview Section (Wireframe Framing) */}
      <div className="bg-white border-2 border-black rounded-2xl shadow-neo p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-black rounded-xs"></span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 lowercase tracking-tight">
              geographic feeder corridor map
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            // Resolved routes automatically clear pins
          </span>
        </div>

        <TransportMap
          issues={issues}
          highlightedId={recentlyAddedId}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
        />
      </div>

      {/* Short List of the Three Most Urgent Transport Issues (styled exactly like the reference screenshot!) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              // TOP OPERATIONAL BOTTLENECKS
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight lowercase">
              three most urgent corridors
            </h3>
          </div>

          <button
            onClick={() => onNavigate('issues')}
            className="neo-btn font-mono text-xs font-bold px-3 py-1.5 bg-black text-white flex items-center gap-1.5"
          >
            <span>View All Register</span>
            <span>&gt;</span>
          </button>
        </div>

        {/* Urgent Issues Cards in the screenshot wireframe layout */}
        <div className="space-y-4">
          {metrics.urgentIssues.map((issue, idx) => {
            const badgeColor =
              idx === 0
                ? 'bg-[#68759e]'
                : idx === 1
                ? 'bg-[#e11d48]'
                : 'bg-[#475569]';

            return (
              <NeoCardItem
                key={issue.id}
                badgeText={issue.category.split('_')[0]}
                badgeSubtext={`${issue.affectedStudents} stu ; ${issue.priority}`}
                badgeColor={badgeColor}
                metaLabel={`Priority #${idx + 1} • District`}
                metaValue={`${issue.district} TNSTC Depot`}
                metaLinkText={`REF #${issue.id}`}
                title={`${issue.village} ➔ ${issue.schoolName}`}
                subtitle={`■ ■ ${issue.priority} Severity • ${issue.description.slice(0, 85)}...`}
                stars={5}
                onClick={() => setSelectedIssue(issue)}
                onActionClick={() => setSelectedIssue(issue)}
              />
            );
          })}
        </div>
      </div>

      {/* Selected Issue Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdateStatus={updateIssueStatus}
          onNavigateToRecommendation={(id) => onNavigate('recommendations', id)}
        />
      )}
    </div>
  );
}
