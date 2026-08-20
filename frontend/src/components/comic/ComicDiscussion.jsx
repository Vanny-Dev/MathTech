import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpenCheck } from 'lucide-react';
import SlideDeck from './SlideDeck.jsx';
import SpeechLine from './SpeechLine.jsx';

/**
 * Renders a module's `discussion` HTML as comic panels, one page at a time.
 *
 * The authored HTML follows a fixed shape:
 *
 *   <h3>Panel 1 — The Long Way</h3>
 *   <p><strong>Miguel:</strong> dialogue…</p>
 *   <p>narration or a centred formula</p>
 *
 * Each <h3> starts a panel; a paragraph opening with "<strong>Name:</strong>"
 * becomes a speech bubble, everything else becomes a narration block.
 *
 * Panels used to be stacked, which made a six-panel lesson a very long scroll.
 * They are now a carousel — one panel on screen at a time, advanced by the
 * buttons, the dots, the arrow keys, or a swipe. Falls back to plain rendering
 * when the content has no <h3> markers, so older or hand-written modules still
 * display.
 */

function parsePanels(html) {
  if (typeof window === 'undefined' || !html) return null;

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstChild;
  if (!root) return null;

  const nodes = Array.from(root.children);
  if (!nodes.some((n) => n.tagName === 'H3')) return null;   // not panelled

  const panels = [];
  let current = null;

  for (const node of nodes) {
    if (node.tagName === 'H3') {
      current = { heading: node.textContent.trim(), blocks: [] };
      panels.push(current);
      continue;
    }
    if (!current) {
      current = { heading: '', blocks: [] };
      panels.push(current);
    }

    const strong = node.querySelector(':scope > strong');
    const isDialogue =
      node.tagName === 'P' &&
      strong &&
      node.firstElementChild === strong &&
      /:\s*$/.test(strong.textContent);

    if (isDialogue) {
      const speaker = strong.textContent.replace(/:\s*$/, '').trim();
      const clone = node.cloneNode(true);
      clone.removeChild(clone.querySelector(':scope > strong'));
      current.blocks.push({ kind: 'line', speaker, html: clone.innerHTML.trim() });
    } else {
      current.blocks.push({ kind: 'note', html: node.outerHTML });
    }
  }

  return panels;
}

// "Panel 3 — Expanding It Back" -> { num: '3', title: 'Expanding It Back' }
function splitHeading(heading) {
  const m = heading.match(/^\s*Panel\s+(\d+)\s*[—–-]\s*(.*)$/i);
  if (m) return { num: m[1], title: m[2] };
  return { num: null, title: heading };
}

export default function ComicDiscussion({ html }) {
  const panels = useMemo(() => parsePanels(html), [html]);
  const total = panels?.length ?? 0;

  // Every hook runs unconditionally, before any early return — React requires
  // the same hooks in the same order on every render.
  const [page, setPage] = useState(0);
  const topRef = useRef(null);

  // Switching topic replaces the content; start that lesson at its first page
  useEffect(() => { setPage(0); }, [html]);

  const goTo = useCallback((target) => {
    setPage(target);
    // Bring the top into view so a page never opens halfway down the screen
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    );
  }, []);

  if (!html) {
    return <p style={{ fontFamily: 'Nunito, sans-serif' }}>No discussion content yet.</p>;
  }

  if (!panels) {
    return (
      <div
        className="rich-text"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.8 }}
      />
    );
  }

  const current = Math.min(page, total - 1);
  const onLast  = current === total - 1;

  return (
    <div className="comic-discussion" ref={topRef}>
      {/* Page indicator */}
      <div style={pg.bar}>
        <span style={pg.count}>Page {current + 1} of {total}</span>
        <div className="cd-dots">
          {panels.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`cd-dot ${i === current ? 'on' : i < current ? 'seen' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <SlideDeck count={total} index={current} onIndexChange={goTo} instantKey={html}>
        {(i) => {
          const panel = panels[i];
          const { num, title } = splitHeading(panel.heading);
          return (
            <>
              <header className="cd-panel-head">
                <span className="cd-panel-num">{num ?? i + 1}</span>
                <h3 className="cd-panel-title">{title}</h3>
              </header>

              <div className="cd-panel-body">
                {panel.blocks.map((b, j) =>
                  b.kind === 'line' ? (
                    <SpeechLine key={j} speaker={b.speaker} html={b.html} />
                  ) : (
                    <div
                      key={j}
                      className="cd-note rich-text"
                      dangerouslySetInnerHTML={{ __html: b.html }}
                    />
                  )
                )}
              </div>
            </>
          );
        }}
      </SlideDeck>

      {/* Turn controls */}
      <div style={pg.nav}>
        <button className="btn btn-outline" style={pg.btn} onClick={() => goTo(current - 1)} disabled={current === 0}>
          <ChevronLeft size={16} /> Back
        </button>

        {onLast ? (
          <span style={pg.done}>
            <BookOpenCheck size={15} strokeWidth={2.5} /> End of discussion
          </span>
        ) : (
          <button className="btn btn-teal" style={pg.btn} onClick={() => goTo(current + 1)}>
            Next page <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

const pg = {
  bar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '0.6rem', flexWrap: 'wrap',
  },
  count: {
    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
    fontWeight: 700, color: 'var(--muted-strong)',
  },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '0.6rem', flexWrap: 'wrap',
  },
  btn: { fontSize: '0.9rem', padding: '0.5rem 1rem' },
  // Replaces the Next button on the last page, so it carries the same padding
  // and border width — otherwise the shorter label lifts the row by ~10px.
  done: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.4rem',
    fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.88rem',
    color: 'var(--green)',
    padding: '0.5rem 1rem',
    border: '2px solid transparent',
    lineHeight: 1.4,
  },
};
