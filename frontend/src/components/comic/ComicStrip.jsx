import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAnswer } from '../../store/submissionSlice.js';
import SpeechLine from './SpeechLine.jsx';
import ResultBadge from '../shared/ResultBadge.jsx';
import useSound from '../../hooks/useSound.js';

/**
 * One activity, presented as the lesson presents a panel.
 *
 * It shares the lesson's panel header, its speech bubbles and its cast, so a
 * question from Miguel looks and sounds like Miguel talking in the discussion.
 * Everything below the question is deliberately plain: validators asked for
 * less visual furniture in the exercises so the mathematics leads, so the
 * character stays a portrait rather than a poster and the answer choices get
 * the full width.
 *
 * The reaction line is only rendered once there is a verdict to react to.
 */

const TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  true_false:      'True or False',
  fill_blank:      'Fill in the Blank',
};

export default function ComicStrip({
  activity,
  onAnswered,
  number,
  readOnly = false,
  highlightCorrect = false,
}) {
  const dispatch = useDispatch();
  const { play } = useSound();

  const bodyRef = useRef(null);

  const [inputVal, setInputVal]   = useState('');
  const [selected, setSelected]   = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult]       = useState(null); // 'correct' | 'wrong' | null

  const comic = activity?.comic || {};

  const handleSubmit = () => {
    const given = activity.type === 'fill_blank' ? inputVal : selected;
    if (!given && given !== false) return;

    dispatch(setAnswer({ activityId: activity._id, answer: given }));

    if (onAnswered) {
      // The verdict may be null/undefined, meaning "do not reveal correctness
      // here" — practice mode, or a graded quiz scored only after the whole
      // set is submitted. The client never receives correctAnswer, so it
      // cannot judge; treating null as false would mark every answer wrong.
      const verdict = onAnswered(activity._id, given);

      if (verdict === null || verdict === undefined) {
        setResult(null);
      } else {
        const res = verdict ? 'correct' : 'wrong';
        setResult(res);
        play(res);
      }
    }

    setSubmitted(true);
  };

  // The reaction is appended below the answers, which on a long question sits
  // outside the scrolled view — so bring it into sight once it appears.
  useEffect(() => {
    if (!submitted) return;
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [submitted]);

  const askArt = comic.askingCharacter || 'dark_idle';

  const reactionArt =
    result === 'correct' ? (comic.correctCharacter || 'dark_happy')
    : result === 'wrong' ? (comic.wrongCharacter || 'dark_serious')
    : null;

  return (
    <>
      <header className="cd-panel-head">
        <span className="cd-panel-num">{number ?? '?'}</span>
        <h3 className="cd-panel-title">{TYPE_LABELS[activity?.type] || 'Question'}</h3>
      </header>

      <div className="cd-act-body" ref={bodyRef}>
        {/* ── The question, asked the way the lesson asks things ── */}
        <div className="cd-ask">
          <SpeechLine art={askArt}>{activity?.question}</SpeechLine>
        </div>

        {/* ── Answer area: full width, nothing decorative above it ── */}
        <div style={s.answerCard}>
          {readOnly ? (
            <div style={s.given}>
              Your answer: <strong>{String(activity?.givenAnswer ?? '—')}</strong>
            </div>
          ) : (
            <AnswerInput
              activity={activity}
              inputVal={inputVal}
              setInputVal={setInputVal}
              selected={selected}
              setSelected={setSelected}
              submitted={submitted}
              highlightCorrect={highlightCorrect}
            />
          )}
        </div>

        {/* ── Reaction: only once there is something to react to ── */}
        {submitted && reactionArt && (
          <SpeechLine art={reactionArt} tone={result === 'correct' ? 'good' : 'bad'}>
            {result === 'correct' ? 'Correct! Great job!' : 'Hmm, not quite...'}
          </SpeechLine>
        )}

      </div>

      {/* ── Submit / result: outside the scroll, always in reach ── */}
      {!readOnly && (
        <div className="cd-act-foot">
          {!submitted ? (
            <button className="btn btn-teal" style={s.submit} onClick={handleSubmit}>
              Submit answer
            </button>
          ) : result ? (
            <ResultBadge result={result} />
          ) : (
            <span style={s.saved}>Answer saved — keep going.</span>
          )}
        </div>
      )}
    </>
  );
}

// ── Answer input by activity type ─────────────────────────────
function AnswerInput({ activity, inputVal, setInputVal, selected, setSelected, submitted }) {
  if (submitted) {
    return (
      <div style={s.given}>
        Your answer: <strong>{inputVal || String(selected)}</strong>
      </div>
    );
  }

  if (activity.type === 'fill_blank') {
    return (
      <input
        className="math-input"
        placeholder="Type your answer"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        style={{ maxWidth: '260px' }}
      />
    );
  }

  if (activity.type === 'true_false') {
    return (
      <div style={s.choices}>
        {['True', 'False'].map((opt) => (
          <button
            key={opt}
            className={`btn ${selected === opt ? 'btn-teal' : 'btn-outline'}`}
            style={s.choice}
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
      <div style={s.choices}>
        {activity.choices?.map((choice, i) => (
          <button
            key={i}
            className={`btn ${selected === choice ? 'btn-teal' : 'btn-outline'}`}
            style={{ ...s.choice, justifyContent: 'flex-start' }}
            onClick={() => setSelected(choice)}
          >
            <span style={s.letter}>{String.fromCharCode(65 + i)}</span>
            {choice}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

const s = {
  answerCard: {
    background: 'var(--paper)',
    border: '2px solid var(--ink)',
    padding: '0.8rem',
  },

  choices: { display: 'flex', flexDirection: 'column', gap: '0.45rem' },
  choice: { width: '100%', fontSize: '0.95rem', padding: '0.6rem 0.8rem', textAlign: 'left' },
  letter: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.8rem',
    opacity: 0.65,
    marginRight: '0.15rem',
  },

  given: { fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem' },

  submit: { fontSize: '0.95rem', padding: '0.6rem 1.4rem' },
  saved: { fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'var(--muted-strong)' },
};
