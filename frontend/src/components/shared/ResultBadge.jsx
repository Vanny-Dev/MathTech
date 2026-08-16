import React from 'react';

export default function ResultBadge({ result }) {
  if (!result) return null;
  return (
    <div className={`result-badge ${result === 'correct' ? 'correct' : 'wrong'}`}>
      {result === 'correct' ? 'Correct!' : 'Wrong!'}
    </div>
  );
}
