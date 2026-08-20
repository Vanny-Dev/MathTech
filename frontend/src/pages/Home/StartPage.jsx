import React from 'react';
import { Play, ArrowRight } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';
import { useNavigate } from 'react-router-dom';
import { useWorkbook } from '../../context/WorkbookContext.jsx';

export default function StartPage() {
  const navigate = useNavigate();
  const { moduleId } = useWorkbook();
  return (
    <div>
      <SectionTitle icon={Play}>Start</SectionTitle>
      <div className="comic-card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.4rem', marginBottom: '1rem' }}>
          How to use this workbook
        </h2>
        <ol style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 2, paddingLeft: '1.2rem' }}>
          <li>Read the <strong>Learning Competencies</strong> to know your goals.</li>
          <li>Study the <strong>Lesson</strong> — discussion, concepts, and examples.</li>
          <li>Do the <strong>Practice Exercises</strong> to warm up.</li>
          <li>Complete the <strong>Independent Activity</strong> for grading.</li>
          <li>Check your <strong>Feedback</strong> — score and explanations.</li>
          <li>Review incorrect answers and <strong>Retry</strong> if needed.</li>
          <li>Track your <strong>Progress</strong> over time.</li>
        </ol>
        <button
          className="btn btn-blue"
          style={{ marginTop: '1.5rem' }}
          // Competencies, Lesson and Activities all read the selected topic.
          // Without one they render empty, so send the student to pick first.
          onClick={() => navigate(moduleId ? '/competencies' : '/topics')}
        >
          {moduleId ? 'Start Learning' : 'Choose a topic'} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
