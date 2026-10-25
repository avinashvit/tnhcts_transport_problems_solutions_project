/**
 * Rule-based recommendation engine for SchoolRoute TN.
 * Evaluates reported school transport barriers and derives actionable recommendations
 * with clear rationale explaining why each suggestion was triggered.
 */

export function generateRecommendationForIssue(issue) {
  const { category, affectedStudents, village, schoolName, district, priority } = issue;
  const count = Number(affectedStudents) || 0;

  switch (category) {
    case 'bus_shortage': {
      const isHighVolume = count >= 60;
      return {
        id: `REC-${issue.id}`,
        issueId: issue.id,
        category: 'bus_shortage',
        categoryLabel: 'Bus Shortage',
        title: isHighVolume
          ? 'Assess Demand for Dedicated Morning School Bus Service'
          : 'Assess Additional Morning Trip / Route Halt Modification',
        responsibleAgency: 'Tamil Nadu State Transport Corporation (TNSTC) & District Transport Office',
        proposedAction: isHighVolume
          ? `Deploy a dedicated 52-seater TNSTC student trip originating from ${village} between 07:45 AM and 08:15 AM terminating at ${schoolName}. Alternatively, schedule an intermediate shuttle run connecting key feeder stops.`
          : `Review existing TNSTC passing district routes and authorize an official scheduled student stop at ${village} between 08:00 AM and 08:30 AM to accommodate student inflow to ${schoolName}.`,
        whyGenerated: `Generated because ${count} students in ${village} (${district} District) experience absence of adequate public bus services during morning school commute hours, leading to attendance loss and unregulated transit risks.`,
        ruleApplied: count >= 60
          ? 'Rule BR-01: Student cluster ≥ 60 without morning transit qualifies for dedicated school-hour service evaluation.'
          : 'Rule BR-02: Feeder village with commuter deficit qualifies for route-halt alignment.',
        verificationSteps: [
          'TNSTC Branch Manager field survey of morning boarding points',
          `Verification of school start time (assembly bell) with ${schoolName} Headmaster`,
          'Block Educational Officer (BEO) endorsement of student residential roll'
        ],
        impactEstimate: `Directly ensures reliable, punctual school access for approx. ${count} students.`,
        status: issue.status,
        priority: priority
      };
    }

    case 'long_walking': {
      const isExcessive = count >= 50;
      return {
        id: `REC-${issue.id}`,
        issueId: issue.id,
        category: 'long_walking',
        categoryLabel: 'Long Walking Distance',
        title: 'Evaluate Closer Bus Stop or Route Extension',
        responsibleAgency: 'District Collectorate Transport Committee & Regional Transport Office (RTO)',
        proposedAction: `Conduct a joint feasibility inspection to relocate the existing bus shelter closer to ${village} junction or create a designated 1.5 km loop extension directly serving students commuting to ${schoolName}.`,
        whyGenerated: `Generated because ${count} students are required to walk substantial distances (>2.5 km) on rural unpaved or arterial highway shoulders, creating fatigue, adverse weather exposure, and dropout risks.`,
        ruleApplied: isExcessive
          ? 'Rule LW-01: High-density walking cluster (>50 students) exceeds safe pedestrian threshold for secondary schooling.'
          : 'Rule LW-02: Remote hamlet transit gap qualifies for intermediate shelter point.',
        verificationSteps: [
          `GPS trail audit of pedestrian path between ${village} and nearest active transit node`,
          'Verification of road carriageway width for safe bus turning radius',
          'Panchayat resolution allocating land for a safe covered passenger waiting shelter'
        ],
        impactEstimate: `Reduces student round-trip walking time by an estimated 45–60 minutes daily for ${count} students.`,
        status: issue.status,
        priority: priority
      };
    }

    case 'overcrowding': {
      return {
        id: `REC-${issue.id}`,
        issueId: issue.id,
        category: 'overcrowding',
        categoryLabel: 'Overcrowding',
        title: 'Assess Passenger Counts and Deploy Peak-Hour Concession Shuttle',
        responsibleAgency: 'TNSTC Operational Wing & Local Depot Superintendent',
        proposedAction: `Undertake on-board passenger count audit on the peak service serving ${village} towards ${schoolName}. If load factor exceeds 120%, split the morning run or operate a 'School Special' shuttle run 15 minutes ahead of the regular general public service.`,
        whyGenerated: `Triggered by hazardous overcrowding affecting ${count} student commuters, where footboard traveling and boarding denials compromise safety during peak morning travel hours.`,
        ruleApplied: 'Rule OC-01: Commuter surge resulting in high student footboard risk requires immediate fleet capacity audit.',
        verificationSteps: [
          'Conductor trip audit sheet verification of student bus pass holders on the route',
          'Depot traffic supervisor spot inspection at morning peak (07:45 - 08:30 AM)',
          'Safety protocol check by Local Police Traffic Wing'
        ],
        impactEstimate: `Eliminates hazardous footboard riding and guarantees safe boarding for ${count} students.`,
        status: issue.status,
        priority: priority
      };
    }

    case 'unsafe_road': {
      return {
        id: `REC-${issue.id}`,
        issueId: issue.id,
        category: 'unsafe_road',
        categoryLabel: 'Unsafe Road Corridor',
        title: 'Flag Location for Multi-Departmental Road Safety Inspection',
        responsibleAgency: 'Highways & Minor Ports Department (TN) & Rural Development (Panchayat Union)',
        proposedAction: `Issue emergency inspection order for the transport stretch connecting ${village} to ${schoolName}. Deploy speed mitigation measures (rumble strips, 30 km/h school zone warning signs, reflective solar blinkers) and repair damaged culverts/shoulders.`,
        whyGenerated: `Triggered by critical roadway hazards affecting ${count} students walking or cycling along vehicular corridors with compromised infrastructure or heavy commercial traffic.`,
        ruleApplied: 'Rule SR-01: Reported physical road defect on active school route triggers priority inter-departmental safety notice.',
        verificationSteps: [
          'Joint site inspection by Assistant Executive Engineer (Highways) and Block Development Officer',
          'Assessment of student crossing points, lighting adequacy, and roadside blind spots',
          'Sanction of immediate civil works under rural road maintenance fund'
        ],
        impactEstimate: `Prevents pedestrian-vehicular collisions and secures daily route for ${count} students.`,
        status: issue.status,
        priority: priority
      };
    }

    case 'bus_timing': {
      return {
        id: `REC-${issue.id}`,
        issueId: issue.id,
        category: 'bus_timing',
        categoryLabel: 'Bus Timing Mismatch',
        title: 'Review School Schedule Against Depot Bus Timetable',
        responsibleAgency: 'Chief Educational Officer (CEO) & TNSTC Time-Table Harmonization Committee',
        proposedAction: `Reschedule the morning departure from ${village} by 20–25 minutes earlier to ensure students arrive 15 minutes before the morning assembly at ${schoolName}. Align the afternoon return service to depart 15 minutes after the final dismissal bell.`,
        whyGenerated: `Generated due to systemic timing mismatch where bus arrivals either cause habitual tardiness or leave students stranded for extended hours at rural junctions, affecting ${count} students.`,
        ruleApplied: 'Rule TM-01: Bus arrival after 08:45 AM or departure before school dismissal requires administrative schedule synchronization.',
        verificationSteps: [
          `Comparative analysis of ${schoolName} official bell schedule against TNSTC master depot chart`,
          'Verification of driver trip sheet logs for route punctuality over past 15 working days',
          'Notice to school administration and parents regarding calibrated timetable'
        ],
        impactEstimate: `Eliminates commuter delay and idle waiting times for ${count} students.`,
        status: issue.status,
        priority: priority
      };
    }

    default: {
      return {
        id: `REC-${issue.id}`,
        issueId: issue.id,
        category: 'other',
        categoryLabel: 'Custom Transport Issue',
        title: 'Block-Level Transport Committee Field Review',
        responsibleAgency: 'District Collectorate Transport Wing & Block Education Office',
        proposedAction: `Convene a field review between ${schoolName} administration, village panchayat representatives, and local transport authorities to devise custom transit accommodations for ${village}.`,
        whyGenerated: `Triggered by a specialized or composite transport barrier affecting ${count} students in ${village}, requiring bespoke administrative coordination.`,
        ruleApplied: 'Rule GN-01: Non-standard school transport grievance requires tailored block-level inquiry.',
        verificationSteps: [
          'On-site appraisal by Block Educational Officer (BEO)',
          'Consultation meeting with Parent-Teacher Association (PTA)',
          'Submission of recommendation to the District Level Transport Committee'
        ],
        impactEstimate: `Provides structured administrative resolution for ${count} impacted students.`,
        status: issue.status,
        priority: priority
      };
    }
  }
}

/**
 * Returns all generated recommendations from a list of issues
 */
export function getAllRecommendations(issues = []) {
  return issues.map(generateRecommendationForIssue);
}
