import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  answers:      {},   // { activityId: givenAnswer }
  submissionId: null,
  result:       null, // { totalScore, maxScore, percentage }
};

const submissionSlice = createSlice({
  name: 'submission',
  initialState,
  reducers: {
    setAnswer: (state, action) => {
      const { activityId, answer } = action.payload;
      state.answers[activityId] = answer;
    },
    setSubmissionResult: (state, action) => {
      state.submissionId = action.payload.submissionId;
      state.result       = action.payload;
    },
    resetSubmission: () => initialState,
  },
});

export const { setAnswer, setSubmissionResult, resetSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
