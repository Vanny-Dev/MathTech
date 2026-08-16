import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  module:   null,   // current module data
  progress: null,   // completedSections, lastVisited
};

const workbookSlice = createSlice({
  name: 'workbook',
  initialState,
  reducers: {
    setModule:   (state, action) => { state.module   = action.payload; },
    setProgress: (state, action) => { state.progress = action.payload; },
    markSection: (state, action) => {
      if (state.progress) {
        state.progress.completedSections[action.payload] = true;
        state.progress.lastVisited = action.payload;
      }
    },
    resetWorkbook: () => initialState,
  },
});

export const { setModule, setProgress, markSection, resetWorkbook } = workbookSlice.actions;
export default workbookSlice.reducer;
