import React, { useState } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, MapPin, Users, Lightbulb, Save, FileText } from 'lucide-react';
import { CATEGORIES } from '../data/sampleIssues';
import { generateRecommendationForIssue } from '../utils/recommendations';
import OfficialPetitionModal from './OfficialPetitionModal';

export default function IssueDetailModal({ issue, onClose, onUpdateStatus, onNavigateToRecommendation }) {
  if (!issue) return null;

  const [status, setStatus] = useState(issue.status);
  const [officialNotes, setOfficialNotes] = useState(issue.officialNotes || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showPetition, setShowPetition] = useState(false);

  const category = CATEGORIES[issue.category] || CATEGORIES.other;
  const recommendation = generateRecommendationForIssue(issue);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateStatus(issue.id, status, officialNotes);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto font-mono">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border-2 border-black shadow-neo-lg overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b-2 border-black bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-black text-white">
                #{issue.id}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-bold border border-black ${
                  issue.priority === 'High' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {issue.priority} Priority
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-bold border border-black bg-slate-100 text-slate-800">
                / {issue.status.toLowerCase()}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 lowercase mt-1 tracking-tight">
              {issue.village} ➔ {issue.schoolName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-black rounded hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-black rounded">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">District</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">
                {issue.district}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-black rounded">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Commuters</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">
                {issue.affectedStudents} students
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-black rounded">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Category</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">
                {category.label}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-black rounded">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Report Date</span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">
                {issue.reportedDate}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              // REPORTED TRANSPORT DIFFICULTY:
            </span>
            <div className="p-3.5 bg-slate-50 border border-black rounded text-xs text-slate-800 leading-relaxed">
              {issue.description}
            </div>
          </div>

          {/* Connected Rule-Based Solution Preview */}
          <div className="border-2 border-black bg-purple-50/30 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-blue-700" />
                <span>Recommended Solution: {recommendation.title}</span>
              </div>
              {onNavigateToRecommendation && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToRecommendation(issue.id);
                  }}
                  className="text-xs font-bold text-blue-800 hover:underline flex-shrink-0"
                >
                  View Solution &gt;
                </button>
              )}
            </div>
            <p className="text-xs text-slate-700 font-medium">
              {recommendation.proposedAction}
            </p>

            {/* 1-Click Official Legal Petition Button */}
            <div className="pt-2 border-t border-purple-200">
              <button
                type="button"
                onClick={() => setShowPetition(true)}
                className="w-full neo-btn py-2 px-3 bg-[#fde047] hover:bg-[#facc15] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 border-2 border-black shadow-neo-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-slate-900" />
                <span>[ 📄 1-Click Official G.O. Petition Generator (TNSTC / Collectorate) ➔ ]</span>
              </button>
            </div>
          </div>

          {/* Status Update Form */}
          <form onSubmit={handleSave} className="border-t-2 border-black pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              // UPDATE STATUS & OFFICIAL ACTION LOG
            </h3>

            {/* Status Radio Pills (Screenshot style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['Reported', 'In Progress', 'Resolved'].map((s) => {
                const isSelected = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`p-2.5 rounded border-2 border-black text-xs font-bold flex items-center justify-between transition-all ${
                      isSelected
                        ? s === 'Resolved'
                          ? 'bg-[#86efac] text-black shadow-neo-sm'
                          : 'bg-black text-white shadow-neo-sm'
                        : 'bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{s}</span>
                    <span>{isSelected ? '✓' : '□'}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Official Department Remarks / Action Taken
              </label>
              <textarea
                value={officialNotes}
                onChange={(e) => setOfficialNotes(e.target.value)}
                rows={3}
                placeholder="Log survey findings, bus route alteration orders, or contractor tasks..."
                className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="neo-btn px-4 py-2 border-2 border-black text-xs font-bold bg-white text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaved}
                className="neo-btn px-5 py-2 bg-black text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-[#86efac]" />
                <span>{isSaved ? 'Updated Successfully!' : 'Save Status'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 1-Click Official G.O. Legal Petition Modal */}
      {showPetition && (
        <OfficialPetitionModal
          issue={issue}
          onClose={() => setShowPetition(false)}
        />
      )}
    </div>
  );
}
