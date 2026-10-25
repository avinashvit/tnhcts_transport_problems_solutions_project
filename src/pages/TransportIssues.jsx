import React, { useState, useMemo, useEffect } from 'react';
import { useIssues } from '../context/IssuesContext';
import IssueDetailModal from '../components/IssueDetailModal';
import NeoCardItem from '../components/NeoCardItem';
import { CATEGORIES } from '../data/sampleIssues';
import {
  Search,
  Filter,
  Eye,
  Edit3,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
} from 'lucide-react';

export default function TransportIssues({ onNavigate, initialSelectedId = null }) {
  const { issues, updateIssueStatus } = useIssues();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (matches screenshot) or 'table'
  const [selectedIssue, setSelectedIssue] = useState(() => {
    if (initialSelectedId) {
      return issues.find((i) => i.id === initialSelectedId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (initialSelectedId) {
      const match = issues.find((i) => i.id === initialSelectedId);
      if (match) {
        setSelectedIssue(match);
      }
    }
  }, [initialSelectedId, issues]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Basic text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSchool = issue.schoolName.toLowerCase().includes(q);
        const matchesVillage = issue.village.toLowerCase().includes(q);
        const matchesDistrict = issue.district.toLowerCase().includes(q);
        const matchesId = issue.id.toLowerCase().includes(q);
        if (!matchesSchool && !matchesVillage && !matchesDistrict && !matchesId) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All' && issue.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'All' && issue.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [issues, searchQuery, statusFilter, categoryFilter]);

  const statuses = ['All', 'Reported', 'In Progress', 'Resolved'];

  return (
    <div className="space-y-6 font-mono">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-neo flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="search school, village, district, or id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
          />
        </div>

        {/* Status Filter Pills (Matching screenshot checkbox style!) */}
        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((s) => {
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded font-mono transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-black text-white font-bold border-2 border-black shadow-neo-sm'
                    : 'bg-white text-slate-800 border-2 border-black/80 hover:bg-slate-100'
                }`}
              >
                <span>{isActive ? '✓' : '□'}</span>
                <span>{s}</span>
              </button>
            );
          })}
        </div>

        {/* View Switcher Toggle: Cards (Screenshot mode) vs Table */}
        <div className="flex items-center gap-2 border-2 border-black p-1 rounded bg-slate-50">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
              viewMode === 'cards'
                ? 'bg-black text-white shadow-neo-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-black text-white shadow-neo-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          // Found <strong className="text-black">{filteredIssues.length}</strong> transport bottlenecks
        </span>
        <span className="text-[11px] text-slate-400">
          Click any card or row to review & update status
        </span>
      </div>

      {/* VIEW MODE 1: Exact NeoCardItem layout from reference image */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIssues.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white border-2 border-black rounded-xl text-slate-500 text-xs">
              No transport bottlenecks match "{searchQuery}".
            </div>
          ) : (
            filteredIssues.map((issue, idx) => {
              const badgeColor =
                issue.status === 'Resolved'
                  ? 'bg-[#10b981]' // emerald
                  : issue.priority === 'High'
                  ? 'bg-[#e11d48]' // red
                  : idx % 2 === 0
                  ? 'bg-[#68759e]' // periwinkle from screenshot
                  : 'bg-[#475569]'; // slate

              const stars =
                issue.priority === 'High' ? 5 : issue.priority === 'Medium' ? 4 : 3;

              return (
                <NeoCardItem
                  key={issue.id}
                  badgeText={issue.category.split('_')[0]}
                  badgeSubtext={`${issue.affectedStudents} stu ; ${issue.status}`}
                  badgeColor={badgeColor}
                  metaLabel="Depot / Authority"
                  metaValue={`${issue.district} TNSTC`}
                  metaLinkText={`#${issue.id}`}
                  title={`${issue.village} ➔ ${issue.schoolName}`}
                  subtitle={`■ □ ${issue.priority} Priority • ${issue.description.slice(0, 75)}...`}
                  stars={stars}
                  onClick={() => setSelectedIssue(issue)}
                  onActionClick={() => setSelectedIssue(issue)}
                />
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: Monospace Wireframe Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border-2 border-black shadow-neo overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-black text-white border-b-2 border-black font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Village & District</th>
                  <th className="py-3 px-4">Government School</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Commuters</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-500">
                      No transport issues match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => {
                    const cat = CATEGORIES[issue.category] || CATEGORIES.other;
                    return (
                      <tr
                        key={issue.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          #{issue.id}
                          <span className="block text-[10px] text-slate-400">
                            {issue.reportedDate}
                          </span>
                        </td>

                        {/* Village & District */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{issue.village}</div>
                          <div className="text-[11px] text-slate-500">
                            {issue.district}
                          </div>
                        </td>

                        {/* School Name */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 line-clamp-1">
                            {issue.schoolName}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {issue.description}
                          </div>
                        </td>

                        {/* Issue Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded border border-black text-[11px] font-bold bg-slate-100">
                            {cat.label}
                          </span>
                        </td>

                        {/* Affected Students */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {issue.affectedStudents}
                          </span>
                          <span className="block text-[10px] text-slate-400">stu</span>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border border-black ${
                              issue.priority === 'High'
                                ? 'bg-red-500 text-white'
                                : 'bg-slate-100 text-black'
                            }`}
                          >
                            {issue.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border border-black ${
                              issue.status === 'Resolved'
                                ? 'bg-[#86efac] text-black'
                                : issue.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            <span>{issue.status}</span>
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssue(issue);
                            }}
                            className="neo-btn px-2.5 py-1 text-xs font-bold bg-white text-black hover:bg-black hover:text-white transition-colors"
                          >
                            [ Update &gt; ]
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Detail & Status Update Modal */}
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
