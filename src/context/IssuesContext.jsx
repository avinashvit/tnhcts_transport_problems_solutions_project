import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_ISSUES, TN_DISTRICT_COORDS } from '../data/sampleIssues';
import { resolveLocationCoords } from '../utils/geoResolver';

const IssuesContext = createContext(null);
const STORAGE_KEY = 'schoolroute_tn_issues_v1';

// Helper to ensure an issue has valid and geographically accurate Leaflet coordinates
function ensureCoords(issue) {
  const districtBase = TN_DISTRICT_COORDS[issue.district];

  if (
    Array.isArray(issue.villageCoords) &&
    issue.villageCoords.length === 2 &&
    Array.isArray(issue.schoolCoords) &&
    issue.schoolCoords.length === 2 &&
    districtBase
  ) {
    // Check if coords are within 0.45 degrees of district baseline
    // If distance > 0.45 degrees (e.g. ~50km away or at the old fallback), recalibrate to the exact place
    const dist = Math.hypot(
      issue.villageCoords[0] - districtBase[0],
      issue.villageCoords[1] - districtBase[1]
    );
    if (dist < 0.45) {
      return issue;
    }
  }

  // Accurately resolve based on town / village name & district
  const resolved = resolveLocationCoords(issue.district, issue.village, issue.schoolName);
  return {
    ...issue,
    villageCoords: resolved.villageCoords,
    schoolCoords: resolved.schoolCoords,
  };
}

export function IssuesProvider({ children }) {
  const [issues, setIssues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(ensureCoords);
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return INITIAL_ISSUES.map(ensureCoords);
  });

  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  // Cross-tab synchronization via storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setIssues(parsed.map(ensureCoords));
          }
        } catch (err) {
          console.error('Failed to parse cross-tab storage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to localStorage whenever issues change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [issues]);

  const addIssue = (newIssueData) => {
    const nextNum = issues.length + 1;
    const formattedId = `TN-2026-${String(nextNum).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    // Accurate Tamil Nadu town/village and district resolution
    const resolved = resolveLocationCoords(
      newIssueData.district,
      newIssueData.village.trim(),
      newIssueData.schoolName.trim()
    );

    const completeIssue = {
      id: formattedId,
      district: newIssueData.district,
      village: newIssueData.village.trim(),
      schoolName: newIssueData.schoolName.trim(),
      category: newIssueData.category,
      affectedStudents: parseInt(newIssueData.affectedStudents, 10) || 1,
      priority: newIssueData.priority || 'Medium',
      status: 'Reported',
      reportedDate: today,
      description: newIssueData.description.trim(),
      officialNotes: newIssueData.officialNotes || 'New report received via Student Portal. Awaiting block review and TNSTC survey.',
      villageCoords: resolved.villageCoords,
      schoolCoords: resolved.schoolCoords,
      isNew: true, // Marker for visual distinction
    };

    setIssues((prev) => [completeIssue, ...prev]);
    setRecentlyAddedId(formattedId);
    return completeIssue;
  };

  const updateIssueStatus = (id, newStatus, officialNotes) => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            officialNotes: officialNotes !== undefined ? officialNotes : item.officialNotes,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );
  };

  const resetToDefaults = () => {
    const defaultData = INITIAL_ISSUES.map(ensureCoords);
    setIssues(defaultData);
    setRecentlyAddedId(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    } catch (e) {
      console.error(e);
    }
  };

  // Four exact summary metrics:
  const metrics = useMemo(() => {
    const reportedProblems = issues.length;
    const affectedStudents = issues.reduce((acc, curr) => acc + (Number(curr.affectedStudents) || 0), 0);
    const highPriorityIssues = issues.filter((i) => i.priority === 'High' && i.status !== 'Resolved').length;
    const resolvedIssues = issues.filter((i) => i.status === 'Resolved').length;

    // Top 3 most urgent transport issues
    const urgentIssues = [...issues]
      .filter((i) => i.status !== 'Resolved')
      .sort((a, b) => {
        const priorityScore = { High: 3, Medium: 2, Low: 1 };
        const scoreDiff = (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (Number(b.affectedStudents) || 0) - (Number(a.affectedStudents) || 0);
      })
      .slice(0, 3);

    return {
      reportedProblems,
      affectedStudents,
      highPriorityIssues,
      resolvedIssues,
      urgentIssues,
    };
  }, [issues]);

  return (
    <IssuesContext.Provider
      value={{
        issues,
        metrics,
        recentlyAddedId,
        setRecentlyAddedId,
        addIssue,
        updateIssueStatus,
        resetToDefaults,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssuesContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
}
