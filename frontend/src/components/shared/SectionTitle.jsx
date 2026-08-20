import React from 'react';

/**
 * Page heading: a single compact bar rather than a large stacked heading.
 *
 *   [icon] Independent Activity        Question 3 of 10  2/10  GRADED
 *
 * The old heading set the title at 2rem over a full-width rule, which on a
 * laptop pushed the actual work down the page — and pages that also carried a
 * counter and status pills spent a second row on those. Both now share one
 * bar, through the optional `meta` slot, so a learner opening a page sees the
 * question rather than the chrome above it.
 */
export default function SectionTitle({ icon: Icon, meta, children }) {
  return (
    <header className="page-head">
      {Icon && (
        <span className="page-head-icon">
          <Icon size={17} strokeWidth={2.6} />
        </span>
      )}
      <h1 className="page-head-title">{children}</h1>
      {meta && <div className="page-head-meta">{meta}</div>}
    </header>
  );
}
