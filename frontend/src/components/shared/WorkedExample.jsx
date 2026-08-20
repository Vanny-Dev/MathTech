import React, { useMemo } from 'react';
import { CircleCheckBig } from 'lucide-react';

/**
 * Renders a worked example as separate, readable parts instead of one
 * paragraph.
 *
 * The seeded content already carries its structure in newlines — a problem
 * statement, the computation steps, a note, and a final "Answer:" line — but
 * rendering it inside a single <p> collapsed every break into a space, so the
 * steps ran together as prose. Validators asked for the examples to be
 * presented clearly rather than in paragraph form; this parses that structure
 * back out at render time, without changing any stored content.
 */

const isAnswer = (line) => /^\s*Answer\s*:/i.test(line);

// A computation line either starts indented (the seeded steps do) or reads as
// arithmetic rather than as a sentence.
const isStep = (line) =>
  /^\s{2,}/.test(line) ||
  /^(Year|Step|Method)\s*\d*\s*[:.]/i.test(line) ||
  (/[=×÷→]/.test(line) && line.trim().split(/\s+/).length <= 14);

/**
 * Blank lines separate blocks. The first block is always the problem being
 * worked. After that each LINE is classified and consecutive lines of the same
 * kind are grouped, so an intro sentence followed by indented steps renders as
 * a sentence plus a step box rather than collapsing into one paragraph.
 */
function parse(content) {
  if (!content) return [];

  const blocks = content
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').filter((l) => l.trim() !== ''))
    .filter((lines) => lines.length > 0);

  const out = [];

  blocks.forEach((lines, blockIndex) => {
    if (blockIndex === 0) {
      out.push({ kind: 'problem', lines });
      return;
    }

    let run = null;
    for (const line of lines) {
      if (isAnswer(line)) {
        run = null;
        out.push({ kind: 'answer', text: line.replace(/^\s*Answer\s*:\s*/i, '') });
        continue;
      }
      const kind = isStep(line) ? 'steps' : 'prose';
      if (!run || run.kind !== kind) {
        run = { kind, lines: [] };
        out.push(run);
      }
      run.lines.push(line);
    }
  });

  return out;
}

export default function WorkedExample({ content }) {
  const blocks = useMemo(() => parse(content), [content]);

  if (blocks.length === 0) return null;

  return (
    <div style={s.wrap}>
      {blocks.map((b, i) => {
        if (b.kind === 'answer') {
          return (
            <div key={i} style={s.answer}>
              <CircleCheckBig size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />
              <span style={s.answerLabel}>Answer</span>
              <span style={s.answerValue}>{b.text}</span>
            </div>
          );
        }

        if (b.kind === 'steps') {
          return (
            <div key={i} style={s.steps}>
              {b.lines.map((line, k) => (
                <div key={k} style={s.step}>{line.trim()}</div>
              ))}
            </div>
          );
        }

        return (
          <p key={i} style={b.kind === 'problem' ? s.problem : s.note}>
            {b.lines.map((l) => l.trim()).join(' ')}
          </p>
        );
      })}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '0.7rem' },

  // The question being worked through
  problem: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.95rem',
    fontWeight: 700,
    lineHeight: 1.7,
  },
  note: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: 'var(--muted-strong)',
  },

  // Computation lines: monospace so numbers and operators line up
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    background: 'var(--paper)',
    borderLeft: '4px solid var(--teal)',
    padding: '0.6rem 0.8rem',
  },
  step: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.85rem',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },

  answer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    background: 'var(--green-soft)',
    border: '2px solid var(--ink)',
    padding: '0.5rem 0.75rem',
  },
  answerLabel: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--muted-strong)',
  },
  answerValue: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.95rem',
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },
};
