import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAnswer } from '../../store/submissionSlice.js';
import ComicPanel    from './ComicPanel.jsx';
import ResultBadge   from '../shared/ResultBadge.jsx';
import useSound      from '../../hooks/useSound.js';

// Character image map — replace with actual paths in /assets/characters/
const CHARS = {
  dark_idle:       '/assets/characters/dark_idle.png',
  dark_happy:      '/assets/characters/dark_happy.png',
  dark_serious:    '/assets/characters/dark_serious.png',
  light_thinking:  '/assets/characters/light_thinking.png',
  light_happy:     '/assets/characters/light_happy.png',
  light_sad:       '/assets/characters/light_sad.png',
};

export default function ComicStrip({ activity, onAnswered, readOnly = false, highlightCorrect = false }) {
  const dispatch = useDispatch();
  const { play } = useSound();

  const [inputVal, setInputVal]   = useState('');
  const [selected, setSelected]   = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult]       = useState(null); // 'correct' | 'wrong'

  const comic = activity?.comic || {};

  const handleSubmit = () => {
    const given = activity.type === 'fill_blank' ? inputVal : selected;
    if (!given && given !== false) return;

    dispatch(setAnswer({ activityId: activity._id, answer: given }));

    if (onAnswered) {
      const isCorrect = onAnswered(activity._id, given);
      const res = isCorrect ? 'correct' : 'wrong';
      setResult(res);
      play(res);
    }

    setSubmitted(true);
  };

  // Determine which character to show in panel 3 based on result
  const reactionChar = result === 'correct'
    ? CHARS[comic.correctCharacter]  || CHARS.dark_happy
    : result === 'wrong'
    ? CHARS[comic.wrongCharacter]    || CHARS.dark_serious
    : CHARS[comic.askingCharacter]   || CHARS.dark_idle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="comic-strip">

        {/* Panel 1: Question */}
        <ComicPanel
          characterSide="right"
          characterSrc={CHARS[comic.askingCharacter] || CHARS.dark_idle}
          speechContent={activity?.question}
          bg="halftone"
        />

        {/* Panel 2: Answer input */}
        <ComicPanel
          characterSide="left"
          characterSrc={CHARS[comic.thinkingCharacter] || CHARS.light_thinking}
          speechContent="hmm..."
          answerArea={
            !readOnly ? (
              <AnswerInput
                activity={activity}
                inputVal={inputVal}
                setInputVal={setInputVal}
                selected={selected}
                setSelected={setSelected}
                submitted={submitted}
                highlightCorrect={highlightCorrect}
              />
            ) : (
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: 'var(--muted-strong)' }}>
                Your answer: <strong>{activity?.givenAnswer ?? '—'}</strong>
              </div>
            )
          }
        />

        {/* Panel 3: Reaction */}
        <ComicPanel
          characterSide="right"
          characterSrc={reactionChar}
          speechContent={
            submitted
              ? result === 'correct'
                ? 'Correct! Great job!'
                : 'Hmm, not quite...'
              : null
          }
        />
      </div>

      {/* Submit button + result badge */}
      {!readOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
          {!submitted && (
            <button
              className="btn btn-blue"
              style={{ fontSize: '1rem', letterSpacing: '2px', padding: '0.7rem 2rem' }}
              onClick={handleSubmit}
            >
              SUBMIT UR ANSWER?
            </button>
          )}
          {submitted && <ResultBadge result={result} />}
        </div>
      )}
    </div>
  );
}

// ── Answer input based on activity type ─────────────────────
function AnswerInput({ activity, inputVal, setInputVal, selected, setSelected, submitted }) {
  if (submitted) {
    return (
      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
        Your answer: <em>{inputVal || selected?.toString()}</em>
      </div>
    );
  }

  if (activity.type === 'fill_blank') {
    return (
      <input
        className="comic-input"
        placeholder="Your Answer..."
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        style={{ maxWidth: '200px' }}
      />
    );
  }

  if (activity.type === 'true_false') {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['True', 'False'].map((opt) => (
          <button
            key={opt}
            className={`btn ${selected === opt ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelected(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (activity.type === 'multiple_choice') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {activity.choices?.map((choice, i) => (
          <button
            key={i}
            className={`btn ${selected === choice ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelected(choice)}
            style={{ justifyContent: 'flex-start' }}
          >
            {String.fromCharCode(65 + i)}. {choice}
          </button>
        ))}
      </div>
    );
  }

  return null;
}
