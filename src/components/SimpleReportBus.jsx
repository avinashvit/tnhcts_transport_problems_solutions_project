import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, ShieldCheck, Bus, MapPin } from 'lucide-react';
import { useLiveDatabase } from '../context/LiveDatabaseContext';

export default function SimpleReportBus() {
  const { submitGrievance } = useLiveDatabase();

  const [formData, setFormData] = useState({
    village: '',
    schoolName: '',
    district: 'Dharmapuri',
    category: 'Bus Did Not Stop at Village',
    affectedCount: '45',
    description: '',
  });

  const [submittedTicket, setSubmittedTicket] = useState(null);

  const categories = [
    { id: 'Bus Did Not Stop at Village', label: 'Bus Did Not Stop at Village' },
    { id: 'Bus Running Late (Missed Class)', label: 'Bus Running Late (Missed Class)' },
    { id: 'Severe Overcrowding (Footboard Risk)', label: 'Severe Overcrowding (Footboard Risk)' },
    { id: 'Dangerous Highway Crossing', label: 'Dangerous Highway Crossing' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.village.trim() || !formData.schoolName.trim()) {
      alert('Please fill in your Village and School name.');
      return;
    }

    const created = submitGrievance(formData);
    setSubmittedTicket(created);
  };

  const fillSample = (type) => {
    if (type === 'skipped') {
      setFormData({
        village: 'Morappur West Village',
        schoolName: 'GHSS Dharmapuri',
        district: 'Dharmapuri',
        category: 'bus_skipped',
        affectedCount: '50',
        description: 'Morning 8:15 AM Bus #14A was overcrowded and skipped the Morappur West stop. 50 students were stranded.',
      });
    } else {
      setFormData({
        village: 'Kadayampatti Colony',
        schoolName: 'Govt Model School Deevattipatti',
        district: 'Salem',
        category: 'bus_late',
        affectedCount: '60',
        description: 'Feeder bus arrived at 9:20 AM instead of 8:40 AM. Students missed first period Science class.',
      });
    }
  };

  return (
    <div className="space-y-6 font-mono max-w-3xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-neo">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
          // QUICK CITIZEN & PARENT INTAKE
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 lowercase tracking-tight mt-0.5">
          report a school bus problem
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Did a government bus skip your village stop, arrive late, or have severe crowding? Report it in 1 minute.
        </p>

        {/* Quick Test Samples */}
        <div className="mt-4 pt-3 border-t border-black/10 flex flex-wrap gap-2 items-center text-xs">
          <span className="text-[11px] font-bold text-slate-500">Quick Test Samples:</span>
          <button
            type="button"
            onClick={() => fillSample('skipped')}
            className="neo-btn px-2.5 py-1 bg-white hover:bg-slate-100 border border-black text-xs font-bold"
          >
            Sample: Bus Skipped Stop
          </button>
          <button
            type="button"
            onClick={() => fillSample('late')}
            className="neo-btn px-2.5 py-1 bg-white hover:bg-slate-100 border border-black text-xs font-bold"
          >
            Sample: Late Arrival (Salem)
          </button>
        </div>
      </div>

      {/* Confirmation View if Submitted */}
      {submittedTicket ? (
        <div className="bg-white rounded-2xl border-2 border-black p-6 sm:p-8 shadow-neo space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-black">
            <div className="w-10 h-10 rounded-full bg-[#86efac] border-2 border-black flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                TICKET REGISTERED SUCCESSFULLY
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Grievance #{submittedTicket.id}
              </h2>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-2 border-black rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Village Corridor:</span>
              <strong>{submittedTicket.village} ➔ {submittedTicket.schoolName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">District:</span>
              <strong>{submittedTicket.district} District</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Affected Students:</span>
              <strong>{submittedTicket.affectedCount} Commuters</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="px-2 py-0.5 rounded bg-black text-white font-bold">
                {submittedTicket.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Your complaint has been forwarded directly to the TNSTC Regional Depot Traffic Manager and District Educational Officer for field inspection.
          </p>

          <button
            onClick={() => setSubmittedTicket(null)}
            className="neo-btn w-full py-2.5 bg-black text-white text-xs font-bold hover:bg-slate-800"
          >
            + Report Another Problem
          </button>
        </div>
      ) : (
        /* Form View */
        <div className="bg-white rounded-2xl border-2 border-black p-6 sm:p-8 shadow-neo">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your Village / Hamlet Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Morappur West, Pennagaram Colony"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Destination Government School *
                </label>
                <input
                  type="text"
                  placeholder="e.g., GHSS Dharmapuri, Govt Model School"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 font-bold outline-none"
                  required
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                What is the Problem? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: c.id })}
                    className={`p-2.5 rounded text-xs font-bold text-left border-2 border-black flex items-center justify-between transition-all ${
                      formData.category === c.id
                        ? 'bg-black text-white shadow-neo-sm'
                        : 'bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{c.label}</span>
                    <span>{formData.category === c.id ? '✓' : '□'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Affected Students & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Approximate Students Affected *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.affectedCount}
                  onChange={(e) => setFormData({ ...formData, affectedCount: e.target.value })}
                  className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  District
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 font-bold outline-none"
                >
                  <option value="Dharmapuri">Dharmapuri District</option>
                  <option value="Salem">Salem District</option>
                  <option value="Dindigul">Dindigul District</option>
                  <option value="Tiruvannamalai">Tiruvannamalai District</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Details (e.g. bus timing, route number, what happened)
              </label>
              <textarea
                rows={3}
                placeholder="Mention morning/evening bus timings or stop location..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs p-2.5 border-2 border-black rounded bg-slate-50 font-bold outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full neo-btn py-3 bg-[#10b981] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#059669]"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>[ Submit Bus Complaint to TNSTC Depot ➔ ]</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
