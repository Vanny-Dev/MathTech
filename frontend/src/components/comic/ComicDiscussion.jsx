import React, { useMemo, useState } from 'react';

/**
 * Renders a module's `discussion` HTML as real comic panels.
 *
 * The authored HTML follows a fixed shape:
 *
 *   <h3>Panel 1 — The Long Way</h3>
 *   <p><strong>Miguel:</strong> dialogue…</p>
 *   <p>narration or a centred formula</p>
 *
 * Each <h3> starts a new panel; a paragraph that opens with "<strong>Name:</strong>"
 * becomes a speech bubble attributed to that speaker, and everything else becomes
 * a narration/formula block inside the panel.
 *
 * Falls back to plain rendering when the content has no <h3> panel markers, so
 * older or hand-written modules still display.
 */

// Who sits on which side, how their bubble looks, and which portrait to use
// once the artwork exists in /assets/characters/.
const SPEAKERS = {
  teacher: { side: 'left',  bg: 'var(--board)',       fg: 'var(--paper)', name: 'var(--teal)', border: 'var(--teal)', art: 'teacher'        },
  miguel:  { side: 'right', bg: 'var(--white)',       fg: 'var(--ink)',   name: 'var(--ink)',  border: 'var(--ink)',  art: 'dark_idle'      },
  ana:     { side: 'right', bg: 'var(--yellow-soft)', fg: 'var(--ink)',   name: 'var(--ink)',  border: 'var(--ink)',  art: 'light_thinking' },
};
const DEFAULT_SPEAKER = { side: 'right', bg: 'var(--white)', fg: 'var(--ink)', name: 'var(--ink)', border: 'var(--ink)', art: null };

const styleFor = (name) => SPEAKERS[name.trim().toLowerCase()] || DEFAULT_SPEAKER;

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

    // Dialogue looks like: <strong>Miguel:</strong> rest of the line
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

  if (!html) {
    return <p style={{ fontFamily: 'Nunito, sans-serif' }}>No discussion content yet.</p>;
  }

  // Unpanelled content — render as before rather than dropping it
  if (!panels) {
    return (
      <div
        className="rich-text"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.8 }}
      />
    );
  }

  return (
    <div className="comic-discussion">
      {panels.map((panel, i) => {
        const { num, title } = splitHeading(panel.heading);
        return (
          <section key={i} className="cd-panel">
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
          </section>
        );
      })}
    </div>
  );
}

function SpeechLine({ speaker, html }) {
  const s = styleFor(speaker);
  const initial = speaker.trim().charAt(0).toUpperCase();
  const [artFailed, setArtFailed] = useState(false);

  // Show the real portrait once the PNG exists; until then, the initial badge.
  const showArt = s.art && !artFailed;

  return (
    <div className={`cd-line ${s.side === 'left' ? 'cd-left' : 'cd-right'}`}>
      {showArt ? (
        <img
          className="cd-avatar cd-avatar-img"
          src={`/assets/characters/${s.art}.png`}
          alt={speaker}
          onError={() => setArtFailed(true)}
          style={{ borderColor: s.border }}
        />
      ) : (
        <span
          className="cd-avatar"
          style={{ background: s.border, color: s.side === 'left' ? 'var(--board)' : 'var(--white)' }}
          aria-hidden="true"
        >
          {initial}
        </span>
      )}

      <div
        className="cd-bubble"
        style={{ background: s.bg, color: s.fg, borderColor: s.border, '--cd-tail': s.border }}
      >
        <span className="cd-speaker" style={{ color: s.name }}>{speaker}</span>
        <span className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
