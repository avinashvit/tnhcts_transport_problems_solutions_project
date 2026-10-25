import React, { useState, useMemo } from 'react';
import { useIssues } from '../context/IssuesContext';
import { generateRecommendationForIssue } from '../utils/recommendations';
import { CATEGORIES } from '../data/sampleIssues';
import IssueDetailModal from '../components/IssueDetailModal';
import TimetableSynchronizer from '../components/TimetableSynchronizer';
import OfficialPetitionModal from '../components/OfficialPetitionModal';
import {
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  MapPin,
  CheckSquare,
  FileCheck,
  FileText,
} from 'lucide-react';

export default function RecommendedSolutions({ onNavigate, highlightedIssueId = null }) {
  const { issues, updateIssueStatus } = useIssues();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIssueForModal, setSelectedIssueForModal] = useState(null);
  const [selectedPetitionIssue, setSelectedPetitionIssue] = useState(null);
  const [activeSection, setActiveSection] = useState('synchronizer'); // 'synchronizer' or 'register'

  // Generate recommendations for all current issues
  const recommendations = useMemo(() => {
    return issues.map((issue) => ({
      recommendation: generateRecommendationForIssue(issue),
      issue,
    }));
  }, [issues]);

  // Filter recommendations
  const filtered = useMemo(() => {
    return recommendations.filter(({ recommendation, issue }) => {
      if (categoryFilter !== 'All' && issue.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== 'All' && issue.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [recommendations, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 font-mono">
      {/* Official Advisory Banner */}
      <div className="p-4 bg-white border-2 border-black rounded-xl shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-black text-[#86efac] rounded flex items-center justify-center font-bold text-sm flex-shrink-0 border border-black shadow-neo-sm">
            !
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Statutory Notice: Advisory Decision Support Only
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl">
              Solutions are rule-based recommendations requiring depot verification by TNSTC traffic inspectors and District Education committees before deployment.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 border border-black rounded text-slate-800 flex-shrink-0">
          Rule Engine Active
        </span>
      </div>

      {/* Top Feature Mode Switcher: Timetable Synchronizer vs Solutions Register */}
      <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-neo flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('synchronizer')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 border-2 border-black ${
              activeSection === 'synchronizer'
                ? 'bg-black text-white shadow-neo-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#86efac]" />
            <span>⏱️ Timetable Synchronizer (Feature #1)</span>
          </button>

          <button
            onClick={() => setActiveSection('register')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 border-2 border-black ${
              activeSection === 'register'
                ? 'bg-black text-white shadow-neo-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
            <span>📋 Solutions & Petitions Register ({filtered.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden md:inline">
          Tamil Nadu State Transport Decision Support Engine
        </span>
      </div>

      {/* FEATURE 1: Interactive School Bell & TNSTC Timetable Synchronizer */}
      {activeSection === 'synchronizer' && (
        <TimetableSynchronizer
          onGeneratePetition={(issue) => setSelectedPetitionIssue(issue)}
        />
      )}

      {/* Filter Toolbar for Solutions */}
      <div className="bg-white p-4 rounded-xl border-2 border-black shadow-neo flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs font-bold text-slate-900">
          // RULE ENGINE ACTION REGISTER: <span className="text-blue-700">{filtered.length} Solutions Active</span>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Reported', 'In Progress', 'Resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1 rounded transition-all font-bold ${
                statusFilter === s
                  ? 'bg-black text-white border-2 border-black shadow-neo-sm'
                  : 'bg-white text-slate-700 border-2 border-black/80 hover:bg-slate-100'
              }`}
            >
              <span>{statusFilter === s ? '✓ ' : '□ '}</span>
              <span>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border-2 border-black text-slate-500 text-xs shadow-neo">
            No recommendations match your selected filters.
          </div>
        ) : (
          filtered.map(({ recommendation: rec, issue }, idx) => {
            const cat = CATEGORIES[issue.category] || CATEGORIES.other;
            const isHighlighted = highlightedIssueId === issue.id;

            // Sticking-out block color based on agency / index
            const badgeBg =
              idx % 3 === 0
                ? 'bg-[#68759e]' // periwinkle
                : idx % 3 === 1
                ? 'bg-[#0f766e]' // teal
                : 'bg-[#475569]'; // slate

            return (
              <div
                key={rec.id}
                className={`flex flex-col md:flex-row items-stretch bg-white border-2 border-black rounded-2xl shadow-neo transition-all hover:shadow-neo-lg overflow-hidden ${
                  isHighlighted ? 'ring-4 ring-black' : ''
                }`}
              >
                {/* Left Protruding Agency Badge (Reference screenshot style!) */}
                <div
                  className={`${badgeBg} text-white p-5 md:w-48 flex-shrink-0 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 block">
                      ACTION {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <div className="text-xl font-bold tracking-tight mt-1 lowercase">
                      {rec.id}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/20">
                    <span className="text-[10px] block opacity-80 uppercase">Authority:</span>
                    <span className="text-xs font-bold block">{rec.responsibleAgency}</span>
                    <span className="text-[10px] block opacity-90 mt-1">
                      {issue.affectedStudents} students
                    </span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-5 sm:p-6 space-y-4">
                  {/* Title and Corridor */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-black/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-800">
                          #{issue.id}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {cat.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 lowercase tracking-tight">
                        {rec.title}
                      </h3>
                      <div className="text-xs text-slate-600 mt-0.5">
                        <strong className="text-black">{issue.village}</strong> ➔{' '}
                        <strong className="text-black">{issue.schoolName}</strong> ({issue.district})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs px-2.5 py-1 rounded border border-black font-bold ${
                          issue.status === 'Resolved'
                            ? 'bg-[#86efac] text-black'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {issue.status}
                      </span>
                      <button
                        onClick={() => setSelectedIssueForModal(issue)}
                        className="neo-btn text-xs px-2.5 py-1 bg-white hover:bg-black hover:text-white font-bold transition-colors"
                      >
                        [ Update Status ]
                      </button>
                      <button
                        onClick={() => setSelectedPetitionIssue(issue)}
                        className="neo-btn text-xs px-2.5 py-1 bg-[#fde047] hover:bg-[#facc15] text-slate-950 font-bold transition-colors flex items-center gap-1 border-2 border-black"
                        title="Generate official legal petition for this solution"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>[ 📄 1-Click Petition ]</span>
                      </button>
                    </div>
                  </div>

                  {/* Proposed Action Box */}
                  <div className="p-3.5 bg-slate-50 border-2 border-black rounded-lg">
                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-700" />
                      <span>// PROPOSED ACTION</span>
                    </div>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      {rec.proposedAction}
                    </p>
                  </div>

                  {/* Why Generated Rationale */}
                  <div className="p-3 bg-pink-50/50 border border-black/20 rounded-lg space-y-1">
                    <div className="text-[10px] font-bold text-pink-900 uppercase tracking-wider">
                      // WHY GENERATED (SYSTEM TRIGGER)
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {rec.whyGenerated}
                    </p>
                    <div className="text-[10px] text-slate-500 pt-0.5 font-bold">
                      Rule: {rec.ruleApplied}
                    </div>
                  </div>

                  {/* Field Verification Checklist */}
                  <div>
                    <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-black" />
                      <span>Field Verification Checklist:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {rec.verificationSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white border border-black rounded text-[11px] text-slate-700 flex items-start gap-2 shadow-neo-sm"
                        >
                          <span className="font-bold text-black flex-shrink-0">
                            [0{idx + 1}]
                          </span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div className="pt-2 border-t border-black/10 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      <strong>Impact:</strong> {rec.impactEstimate}
                    </span>
                    <button
                      onClick={() => onNavigate('issues', issue.id)}
                      className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                    >
                      <span>Original Issue</span>
                      <span>&gt;</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for updating issue status */}
      {selectedIssueForModal && (
        <IssueDetailModal
          issue={selectedIssueForModal}
          onClose={() => setSelectedIssueForModal(null)}
          onUpdateStatus={updateIssueStatus}
        />
      )}

      {/* 1-Click Official G.O. Legal Petition Modal */}
      {selectedPetitionIssue && (
        <OfficialPetitionModal
          issue={selectedPetitionIssue}
          onClose={() => setSelectedPetitionIssue(null)}
        />
      )}
    </div>
  );
}
