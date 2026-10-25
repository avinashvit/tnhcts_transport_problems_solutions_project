import React, { useState } from 'react';
import { useIssues } from '../context/IssuesContext';
import { TN_DISTRICTS, CATEGORIES } from '../data/sampleIssues';
import {
  Send,
  PlusCircle,
  ArrowRight,
  Bus,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function ReportProblem({ onNavigate }) {
  const { addIssue } = useIssues();

  const [formData, setFormData] = useState({
    district: 'Dharmapuri',
    village: '',
    schoolName: '',
    category: 'bus_shortage',
    affectedStudents: '',
    priority: 'High',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [submittedIssue, setSubmittedIssue] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.district.trim()) {
      errs.district = 'Please select a Tamil Nadu district.';
    }
    if (!formData.village.trim()) {
      errs.village = 'Village / hamlet name is required.';
    } else if (formData.village.trim().length < 2) {
      errs.village = 'Village name must be at least 2 characters.';
    }

    if (!formData.schoolName.trim()) {
      errs.schoolName = 'Government school name is required.';
    } else if (formData.schoolName.trim().length < 5) {
      errs.schoolName = 'Please enter a complete school name (e.g., GHSS Morappur).';
    }

    if (!formData.category) {
      errs.category = 'Please choose a transport problem category.';
    }

    const students = parseInt(formData.affectedStudents, 10);
    if (!formData.affectedStudents || isNaN(students) || students < 1) {
      errs.affectedStudents = 'Please enter a valid approximate student count (at least 1).';
    } else if (students > 5000) {
      errs.affectedStudents = 'Count seems unusually high for a single feeder route.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please describe the transport problem and commuter difficulties.';
    } else if (formData.description.trim().length < 20) {
      errs.description = 'Please provide at least 20 characters of detail for field assessment.';
    }

    const phonePattern = /\b\d{10}\b/;
    if (phonePattern.test(formData.description)) {
      errs.description =
        'Personal phone numbers detected. In accordance with privacy rules, do not include individual phone numbers.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const created = addIssue(formData);
    setSubmittedIssue(created);
  };

  const handleResetForm = () => {
    setFormData({
      district: 'Dharmapuri',
      village: '',
      schoolName: '',
      category: 'bus_shortage',
      affectedStudents: '',
      priority: 'High',
      description: '',
    });
    setErrors({});
    setSubmittedIssue(null);
  };

  const fillQuickSample = (sampleType) => {
    if (sampleType === 'shortage') {
      setFormData({
        district: 'Salem',
        village: 'Kadayampatti West',
        schoolName: 'Government Higher Secondary School, Deevattipatti',
        category: 'bus_shortage',
        affectedStudents: '72',
        priority: 'High',
        description:
          'Morning 8:00 AM bus service frequently skips Kadayampatti West stop due to capacity. 70+ students are stranded daily, missing first-period classes.',
      });
    } else if (sampleType === 'walking') {
      setFormData({
        district: 'Tiruvannamalai',
        village: 'Vadamathur Village',
        schoolName: 'Government High School, Keelpennathur',
        category: 'long_walking',
        affectedStudents: '48',
        priority: 'Medium',
        description:
          'Students must walk 3.2 kilometers across an unlit rural canal bund road to access the nearest state highway bus shelter.',
      });
    } else if (sampleType === 'safety') {
      setFormData({
        district: 'Dindigul',
        village: 'Siluvathur Colony',
        schoolName: 'Government Model School, Shanmuganathapuram',
        category: 'unsafe_road',
        affectedStudents: '60',
        priority: 'High',
        description:
          'The state highway crossing lacks a zebra crossing or speed breakers. High-speed lorries create severe danger for students cycling and walking to school.',
      });
    }
    setErrors({});
  };

  // If submitted, show clean confirmation receipt
  if (submittedIssue) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 font-mono">
        <div className="bg-white rounded-xl border-2 border-black p-6 sm:p-8 shadow-neo text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#86efac] text-black border-2 border-black rounded flex items-center justify-center font-bold text-lg shadow-neo-sm">
                ✓
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  REPORT CONFIRMED
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Grievance #{submittedIssue.id} Registered
                </h2>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-black text-white font-bold rounded">
              Status: Reported
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            Your school transport report has been logged and is immediately visible to the TNSTC Depot Traffic Manager and District Education Officer.
          </p>

          {/* Ticket Details */}
          <div className="mt-6 p-4 bg-slate-50 border-2 border-black rounded-lg space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Route Corridor:</span>
              <span className="font-bold text-slate-900">
                {submittedIssue.village} ➔ {submittedIssue.schoolName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">District:</span>
              <span className="font-bold text-slate-900">{submittedIssue.district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Affected Commuters:</span>
              <span className="font-bold text-slate-900">{submittedIssue.affectedStudents} students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Priority:</span>
              <span className="font-bold text-red-600">{submittedIssue.priority} Priority</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                handleResetForm();
                onNavigate('track');
              }}
              className="w-full sm:w-auto neo-btn px-5 py-2.5 bg-black text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-900"
            >
              <span>Track Grievance Status ➔</span>
            </button>
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto neo-btn px-5 py-2.5 bg-white text-black text-xs font-bold border-2 border-black hover:bg-slate-50"
            >
              + Report Another Problem
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-white border-2 border-black rounded-xl p-6 shadow-neo">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              // STUDENT & COMMUTER INTAKE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Report a School Transport Problem
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Report bus shortages, overcrowded transit, long walking routes, or hazardous crossings.
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 border border-black rounded text-[11px] text-slate-700 flex items-center gap-2 flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Zero personal names or phone numbers required.</span>
          </div>
        </div>

        {/* Quick Test Sample Presets */}
        <div className="mt-4 pt-4 border-t border-black/10">
          <span className="text-[11px] font-bold text-slate-600 block mb-2">
            Auto-fill Quick Sample (Click to test):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillQuickSample('shortage')}
              className="neo-btn text-xs px-2.5 py-1 bg-white hover:bg-slate-100 border border-black font-bold"
            >
              Sample: Bus Shortage (Salem)
            </button>
            <button
              type="button"
              onClick={() => fillQuickSample('walking')}
              className="neo-btn text-xs px-2.5 py-1 bg-white hover:bg-slate-100 border border-black font-bold"
            >
              Sample: 3.2km Rural Walk (Tiruvannamalai)
            </button>
            <button
              type="button"
              onClick={() => fillQuickSample('safety')}
              className="neo-btn text-xs px-2.5 py-1 bg-white hover:bg-slate-100 border border-black font-bold"
            >
              Sample: Highway Crossing (Dindigul)
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl border-2 border-black p-6 sm:p-8 shadow-neo">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: District & Village */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tamil Nadu District <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
              >
                {TN_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist} District
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="text-xs text-red-600 mt-1">{errors.district}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Village / Hamlet Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Morappur West, Pennagaram Colony"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
              />
              {errors.village && (
                <p className="text-xs text-red-600 mt-1">{errors.village}</p>
              )}
            </div>
          </div>

          {/* Row 2: School Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Destination Government School <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Government Higher Secondary School (GHSS), Morappur"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
            />
            {errors.schoolName && (
              <p className="text-xs text-red-600 mt-1">{errors.schoolName}</p>
            )}
          </div>

          {/* Row 3: Category Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Problem Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(CATEGORIES).map(([key, cat]) => {
                const isSelected = formData.category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: key })}
                    className={`p-2.5 rounded text-xs font-mono text-left transition-all flex items-center justify-between border-2 border-black ${
                      isSelected
                        ? 'bg-black text-white font-bold shadow-neo-sm'
                        : 'bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span>{isSelected ? '✓' : '□'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Affected Students & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Approximate Affected Students <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                placeholder="e.g., 50"
                value={formData.affectedStudents}
                onChange={(e) =>
                  setFormData({ ...formData, affectedStudents: e.target.value })
                }
                className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
              />
              {errors.affectedStudents && (
                <p className="text-xs text-red-600 mt-1">{errors.affectedStudents}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Severity / Urgency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Medium', 'Low'].map((p) => {
                  const isSelected = formData.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-2 px-1 text-center text-xs font-bold border-2 border-black rounded transition-all ${
                        isSelected
                          ? p === 'High'
                            ? 'bg-red-500 text-white shadow-neo-sm'
                            : 'bg-black text-white shadow-neo-sm'
                          : 'bg-white text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 5: Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Description of Transport Difficulty <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Specify morning/evening bus timings, route numbers, road hazards, or walking barriers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-3 border-2 border-black rounded bg-slate-50 focus:bg-white outline-none"
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit Row */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t-2 border-black/10">
            <button
              type="button"
              onClick={handleResetForm}
              className="neo-btn px-4 py-2 text-xs font-bold bg-white text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
            <button
              type="submit"
              className="neo-btn px-6 py-2.5 bg-black text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-900"
            >
              <Send className="w-3.5 h-3.5 text-[#86efac]" />
              <span>Submit Transport Report ➔</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
