import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const WorkbookContext = createContext(null);

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
    resetWorkbook,
  }), [moduleId, completedSections, markComplete, resetWorkbook]);

  return (
    <WorkbookContext.Provider value={value}>
      {children}
    </WorkbookContext.Provider>
  );
};

export const useWorkbook = () => useContext(WorkbookContext);
