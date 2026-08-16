import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { markSection } from '../store/workbookSlice.js';
import { markSectionCompleteApi } from '../api/progressApi.js';
import { useWorkbook } from '../context/WorkbookContext.jsx';

const useProgress = (section) => {
  const dispatch  = useDispatch();
  const { moduleId, markComplete } = useWorkbook();

  useEffect(() => {
    if (!section) return;

    const mark = async () => {
      try {
        if (moduleId) {
          await markSectionCompleteApi(moduleId, section);
        }
        dispatch(markSection(section));
        markComplete(section);
      } catch (err) {
        console.error('Progress update failed:', err);
      }
    };

    mark();
  }, [section, moduleId, dispatch, markComplete]);
};

export default useProgress;
