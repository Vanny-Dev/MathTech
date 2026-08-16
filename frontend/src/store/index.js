import { configureStore } from '@reduxjs/toolkit';
import workbookReducer  from './workbookSlice.js';
import submissionReducer from './submissionSlice.js';

export const store = configureStore({
  reducer: {
    workbook:   workbookReducer,
    submission: submissionReducer,
  },
});
