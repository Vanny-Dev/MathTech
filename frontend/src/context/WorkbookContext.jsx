import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const WorkbookContext = createContext(null);

const SECTION_ORDER = [
  'home',
  'learningCompetencies',
  'lesson',
  'activities',
  'feedback',
  'review',
  'progress',
];

const MODULE_KEY = 'dw_module_id';

export const WorkbookProvider = ({ children }) => {
  // Persisted so the chosen topic survives a page refresh
  const [moduleId, setModuleIdState] = useState(() => localStorage.getItem(MODULE_KEY) || null);

  const setModuleId = useCallback((id) => {
    if (id) localStorage.setItem(MODULE_KEY, id);
    else localStorage.removeItem(MODULE_KEY);
    setModuleIdState(id);
  }, []);
  const [completedSections, setCompletedSections] = useState({
    home:                 false,
    learningCompetencies: false,
    lesson:               false,
    activities:           false,
    feedback:             false,
    review:               false,
    progress:             false,
  });

  const markComplete = useCallback((section) => {
    setCompletedSections((prev) => ({ ...prev, [section]: true }));
  }, []);

  // Unlock sections progressively, but allow the main learning flow to stay accessible
  const isUnlocked = useCallback((section) => {
    const idx = SECTION_ORDER.indexOf(section);
    if (idx === 0) return true;
    if (section === 'learningCompetencies') return true;
    if (section === 'lesson') return completedSections.home || completedSections.learningCompetencies;
    if (section === 'activities') return completedSections.lesson || completedSections.home;
    if (section === 'feedback') return completedSections.activities || completedSections.lesson;
    if (section === 'review') return completedSections.feedback || completedSections.activities;
    if (section === 'progress') return completedSections.review || completedSections.feedback;
    return true;
  }, [completedSections]);

  const resetWorkbook = useCallback(() => {
    localStorage.removeItem(MODULE_KEY);
    setModuleIdState(null);
    setCompletedSections({
      home: false, learningCompetencies: false, lesson: false,
      activities: false, feedback: false, review: false, progress: false,
    });
  }, []);

  const value = useMemo(() => ({
    moduleId,
    setModuleId,
    completedSections,
    markComplete,
    isUnlocked,
    resetWorkbook,
  }), [moduleId, completedSections, markComplete, isUnlocked, resetWorkbook]);

  return (
    <WorkbookContext.Provider value={value}>
      {children}
    </WorkbookContext.Provider>
  );
};

export const useWorkbook = () => useContext(WorkbookContext);
