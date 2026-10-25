import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileText, Shield, Building2, MapPin, Users, Award } from 'lucide-react';
import { CATEGORIES } from '../data/sampleIssues';
import { generateRecommendationForIssue } from '../utils/recommendations';

export default function OfficialPetitionModal({ issue, onClose }) {
  if (!issue) return null;

  const [copied, setCopied] = useState(false);
  const category = CATEGORIES[issue.category] || CATEGORIES.other;
  const recommendation = generateRecommendationForIssue(issue);
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const petitionText = `GOVERNMENT OF TAMIL NADU
DEPARTMENT OF SCHOOL EDUCATION & TAMIL NADU STATE TRANSPORT CORPORATION (TNSTC)
OFFICIAL GRIEVANCE REDRESSAL REQUISITION

REF NO: TN/EDN-TRANSIT/2026/${issue.id}
DATED: ${todayFormatted}

TO:
1. The Managing Director / General Manager,
   Tamil Nadu State Transport Corporation (TNSTC - ${issue.district} Division)
2. The District Collector & District Magistrate,
   Collectorate Office, ${issue.district} District, Tamil Nadu.
3. The Chief Educational Officer (CEO),
   Department of School Education, ${issue.district} District.

SUBJECT:
Urgent requisition for operational transport resolution on feeder corridor: ${issue.village} to ${issue.schoolName} — Invoking Tamil Nadu Free Student Travel Scheme (G.O. Ms. No. 42) & Right to Education Guidelines — Regarding.

RESPECTED AUTHORITIES,

1. CORRIDOR & STUDENT COMMUTER PARTICULARS:
   • Origin Hamlet/Village: ${issue.village}
   • Destination Institution: ${issue.schoolName}
   • Revenue District: ${issue.district} District, Tamil Nadu
   • Affected Student Commuters: Approximately ${issue.affectedStudents} regular students (Boys & Girls, Classes 6 to 12)
   • Grievance Classification: ${category.label} (${issue.priority} Priority)

2. GROUND REALITY & COMMUTE BARRIER:
   ${issue.description}

3. STATUTORY & WELFARE MANDATES CITED:
   a. Tamil Nadu Government Free Bus Pass Scheme (Ilaa Vasar Bus Pass): Assuring unhindered, punctual access to government schools without financial or physical barriers.
   b. Right of Children to Free and Compulsory Education Act (RTE), Section 6: Mandating safe transit access for all children residing beyond walking limits.
   c. Tamil Nadu School Education Policy: Zero tolerance for transit-induced student dropouts, with special emphasis on the safety and retention of rural girl students.

4. SPECIFIC OPERATIONAL RELIEF REQUESTED:
   • Proposed Action: ${recommendation.proposedAction}
   • Administrative Justification: ${recommendation.whyGenerated}
   • Responsible Implementation Authority: ${recommendation.responsibleAgency}
   • Field Verification Checklist:
     ${recommendation.verificationSteps.map((step, idx) => `[0${idx + 1}] ${step}`).join('\n     ')}

We earnestly pray that the competent authorities conduct an immediate joint route inspection and issue necessary depot service alteration orders to protect the education and safety of these ${issue.affectedStudents} students.

SIGNED AND SUBMITTED BY:

1. ___________________________
   Headmaster / Headmistress
   ${issue.schoolName}
   (Seal & Signature)

2. ___________________________
   President, Village Panchayat
   ${issue.village} Panchayat Union
   (Seal & Signature)

3. ___________________________
   Secretary, Parent-Teacher Association (PTA)
   ${issue.schoolName}

4. ___________________________
   Student / Village Representative
   Feeder Corridor: ${issue.village}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(petitionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto font-mono">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border-2 border-black shadow-neo-lg overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Action Toolbar (Non-printable) */}
        <div className="px-5 py-3.5 bg-black text-white border-b-2 border-black flex items-center justify-between flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#86efac]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              1-Click Official G.O. Petition Generator
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white text-black font-bold hidden sm:inline">
              REF #{issue.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="neo-btn px-3 py-1 bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100"
              title="Copy formatted petition to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="neo-btn px-3 py-1 bg-[#86efac] text-slate-950 text-xs font-bold flex items-center gap-1.5 hover:bg-[#6ee7b7]"
              title="Print official petition or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 border border-white text-white hover:bg-white hover:text-black rounded transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Petition Document Preview Area (Printable) */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-900 bg-[#fffdfa] print:p-0 print:bg-white print:text-black">
          {/* Government Emblem & Header */}
          <div className="text-center border-b-2 border-black pb-5 space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-black bg-slate-50 font-bold text-lg mb-1 shadow-neo-sm">
              🏛️
            </div>
            <h1 className="text-sm sm:text-base font-bold tracking-widest uppercase">
              GOVERNMENT OF TAMIL NADU
            </h1>
            <h2 className="text-xs font-bold uppercase text-slate-700">
              Department of School Education & Tamil Nadu State Transport Corporation (TNSTC)
            </h2>
            <div className="text-[11px] font-bold text-slate-500 pt-1">
              JOINT PUBLIC GRIEVANCE REDRESSAL MEMORANDUM
            </div>
          </div>

          {/* Reference & Date Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs border-b border-black/15 pb-3 gap-1">
            <div>
              <span className="text-slate-500">MEMO REF: </span>
              <strong className="text-black">TN/EDN-TRANSIT/2026/{issue.id}</strong>
            </div>
            <div>
              <span className="text-slate-500">DATE OF SUBMISSION: </span>
              <strong>{todayFormatted}</strong>
            </div>
          </div>

          {/* Addressed To Section */}
          <div className="text-xs space-y-1 bg-slate-50 p-4 border border-black rounded">
            <div className="font-bold uppercase tracking-wider text-slate-600 text-[10px] mb-1">
              ADDRESSED TO:
            </div>
            <div className="font-semibold text-slate-800">
              1. <strong>The Managing Director / General Manager</strong>, TNSTC ({issue.district} Division / Regional Depot)
            </div>
            <div className="font-semibold text-slate-800">
              2. <strong>The District Collector & District Magistrate</strong>, {issue.district} District Collectorate
            </div>
            <div className="font-semibold text-slate-800">
              3. <strong>The Chief Educational Officer (CEO)</strong>, Department of School Education, {issue.district}
            </div>
          </div>

          {/* Subject Line */}
          <div className="text-xs font-bold leading-relaxed p-3 bg-amber-50/70 border-l-4 border-black">
            <u>SUBJECT:</u> Urgent official requisition for resolution of student transit barrier on feeder corridor: <span className="underline">{issue.village}</span> to <span className="underline">{issue.schoolName}</span> — Invoking Tamil Nadu Free Student Travel Scheme (G.O. Ms. No. 42) & Right to Education Guidelines — Regarding.
          </div>

          {/* Section 1: Corridor Particulars */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold uppercase text-[11px] tracking-wider text-slate-700">
              1. Corridor & Student Commuter Particulars:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-white border border-black rounded text-[11px]">
              <div>
                <span className="text-slate-500 block">Origin Village:</span>
                <strong className="text-slate-900">{issue.village}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Destination School:</span>
                <strong className="text-slate-900">{issue.schoolName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Daily Commuters:</span>
                <strong className="text-red-700">{issue.affectedStudents} Students</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Category & Priority:</span>
                <strong className="text-slate-900">{category.label} ({issue.priority})</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Ground Reality Description */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold uppercase text-[11px] tracking-wider text-slate-700">
              2. Field Reality & Commuter Difficulty Statement:
            </h3>
            <p className="p-3 bg-slate-50 border border-black rounded leading-relaxed text-slate-800 italic">
              "{issue.description}"
            </p>
          </div>

          {/* Section 3: Statutory Welfare Grounds */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold uppercase text-[11px] tracking-wider text-slate-700">
              3. Statutory Welfare Grounds & Legal Citations:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li>
                <strong>Tamil Nadu Free Student Travel Scheme (G.O. Ms. No. 42):</strong> Guarantees unhindered, punctual state bus transportation for all government school students in uniform.
              </li>
              <li>
                <strong>Right of Children to Free and Compulsory Education Act (RTE) Section 6:</strong> Obligates educational authorities to ensure accessible transit for feeder hamlets located beyond walking thresholds.
              </li>
              <li>
                <strong>State Girl Child Retention Priority:</strong> School education department mandates proactive mitigation of hazardous or unlit corridors to prevent secondary school dropouts.
              </li>
            </ul>
          </div>

          {/* Section 4: Specific Relief Requested */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold uppercase text-[11px] tracking-wider text-slate-700">
              4. Specific Administrative & Depot Relief Prayed For:
            </h3>
            <div className="p-4 bg-purple-50/40 border-2 border-black rounded-lg space-y-2">
              <div className="font-bold text-slate-900">
                PROPOSED ACTION: {recommendation.proposedAction}
              </div>
              <div className="text-[11px] text-slate-700">
                <strong>Justification Rationale:</strong> {recommendation.whyGenerated}
              </div>
              <div className="text-[11px] text-slate-600">
                <strong>Implementation Authority:</strong> {recommendation.responsibleAgency}
              </div>
            </div>
          </div>

          {/* Section 5: Signature Endorsement Block */}
          <div className="pt-6 border-t-2 border-black space-y-8">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-600">
              — Endorsement & Signature Verification —
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 text-[10px] text-slate-700 text-center">
              <div className="space-y-12">
                <div className="border-b border-black border-dashed pb-1"></div>
                <div>
                  <strong>Headmaster / Headmistress</strong>
                  <div className="text-slate-500 text-[9px] truncate">{issue.schoolName}</div>
                  <div className="text-slate-400 text-[9px]">[Seal & Date]</div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="border-b border-black border-dashed pb-1"></div>
                <div>
                  <strong>Village Panchayat President</strong>
                  <div className="text-slate-500 text-[9px]">{issue.village} Panchayat</div>
                  <div className="text-slate-400 text-[9px]">[Seal & Date]</div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="border-b border-black border-dashed pb-1"></div>
                <div>
                  <strong>PTA Secretary</strong>
                  <div className="text-slate-500 text-[9px]">Parent-Teacher Assoc.</div>
                  <div className="text-slate-400 text-[9px]">[Signature]</div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="border-b border-black border-dashed pb-1"></div>
                <div>
                  <strong>Student Representative</strong>
                  <div className="text-slate-500 text-[9px]">Feeder Corridor Commuter</div>
                  <div className="text-slate-400 text-[9px]">[Signature]</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-black flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono print:hidden gap-2">
          <span>// Ready for immediate administrative submission to TNSTC Regional Depot & District Collector</span>
          <button
            onClick={onClose}
            className="neo-btn px-4 py-1.5 bg-black text-white text-xs font-bold hover:bg-slate-800"
          >
            Close Petition
          </button>
        </div>
      </div>
    </div>
  );
}
