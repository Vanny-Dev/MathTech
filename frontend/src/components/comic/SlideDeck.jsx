import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * The sliding frame shared by the lesson and the activities.
 *
 * Every slide is laid out in one horizontal row and the row is what moves, so
 * the outgoing and incoming slides travel together and read as one motion
 * rather than a swap. Keeping this in one place is the point: the lesson and
 * the exercises previously paged differently — one animated, one changed
 * instantly — and any change had to be made twice to keep them in step.
 *
 * The caller owns `index`, because the pages around this need to know which
 * slide is showing (a question counter, an answered/unanswered dot, a submit
 * button that only appears on the last one).
 *
 * All slides stay mounted. That is deliberate for the activities: a learner who
 * pages back to an earlier question finds the answer they already chose still
 * selected, which remounting each slide would throw away.
 */
export default function SlideDeck({
  count,
  index,
  onIndexChange,
  children,          // (i) => node
  instantKey,        // change this to jump without animating
  keyboard = true,
  className = '',
}) {
  const [instant, setInstant] = useState(false);
  const [height, setHeight]   = useState(null);
  const trackRef = useRef(null);
  const drag     = useRef(null);

  // Swapping in a different lesson or module resets the index; sliding back
  // through every slide to reach the first one would be nonsense, so that one
  // move is made without a transition.
  useEffect(() => {
    if (instantKey === undefined) return;
    setInstant(true);
    const id = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(id);
  }, [instantKey]);

  const clamp = useCallback((i) => Math.max(0, Math.min(count - 1, i)), [count]);
  const current = clamp(index);

  /**
   * The frame takes the height of whichever slide is showing, and animates
   * between them.
   *
   * Slides in a flex row would otherwise all stretch to the tallest one, which
   * left a short fill-in-the-blank padded out with about 110px of blank space
   * below its answer box. Measuring instead means every slide is exactly as
   * tall as it needs to be, while the transition keeps the buttons underneath
   * from jumping between questions of different lengths.
   *
   * Laid out before paint so the frame never flashes at the wrong height, and
   * observed afterwards because a slide grows when its reaction line appears.
   */
  useLayoutEffect(() => {
    const slide = trackRef.current?.children[current];
    if (!slide) return;

    const measure = () => setHeight(slide.offsetHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(slide);
    return () => ro.disconnect();
  }, [current, count]);

  const goBack = useCallback(() => onIndexChange(clamp(index - 1)), [clamp, index, onIndexChange]);
  const goNext = useCallback(() => onIndexChange(clamp(index + 1)), [clamp, index, onIndexChange]);

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keyboard, goNext, goBack]);

  // Swiping is how a carousel is expected to work on a phone. The first few
  // pixels decide whether the gesture is a sideways swipe or a scroll down the
  // slide, so a learner reading a long question is never yanked to another one.
  const onPointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse') return;   // a mouse has the buttons
    drag.current = { x: e.clientX, y: e.clientY, axis: null };
  }, []);

  const onPointerMove = useCallback((e) => {
    const d = drag.current;
    if (!d || d.axis) return;
    const dx = Math.abs(e.clientX - d.x);
    const dy = Math.abs(e.clientY - d.y);
    if (dx > 10 || dy > 10) d.axis = dx > dy ? 'x' : 'y';
  }, []);

  const onPointerUp = useCallback((e) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.axis !== 'x') return;
    const dx = e.clientX - d.x;
    if (dx <= -45) goNext();
    else if (dx >= 45) goBack();
  }, [goNext, goBack]);

  return (
    <div
      className={`cd-frame ${instant ? 'instant' : ''} ${className}`}
      style={height == null ? undefined : { height: `${height}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { drag.current = null; }}
    >
      <div
        ref={trackRef}
        className={`cd-track ${instant ? 'instant' : ''}`}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {Array.from({ length: count }, (_, i) => (
          <section
            key={i}
            className={`cd-slide ${i === current ? 'on' : ''}`}
            aria-hidden={i !== current}
            /* The activity slides hold buttons and text fields. Without `inert`
               a keyboard user would tab straight off the visible question into
               the answer choices of a question they cannot see. */
            inert={i === current ? undefined : ''}
          >
            {children(i)}
          </section>
        ))}
      </div>
    </div>
  );
}
