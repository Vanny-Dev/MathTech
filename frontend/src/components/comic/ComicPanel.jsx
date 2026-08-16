import React from 'react';

export default function ComicPanel({
  characterSrc,
  characterSide = 'left',  // 'left' | 'right'
  speechContent,
  answerArea,
  bg = 'default',          // 'default' | 'halftone'
  minHeight = '160px',
}) {
  const isRight = characterSide === 'right';

  return (
    <div
      className={`comic-panel ${bg === 'halftone' ? 'bg-halftone' : ''}`}
      style={{ minHeight, flexDirection: isRight ? 'row-reverse' : 'row' }}
    >
      {/* Character image */}
      {characterSrc && (
        <img
          src={characterSrc}
          alt="character"
          style={{
            height: '140px',
            objectFit: 'contain',
            flexShrink: 0,
          }}
        />
      )}

      {/* Speech / answer area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {speechContent && (
          <div className={`speech-bubble ${isRight ? 'right' : ''}`}>
            {speechContent}
          </div>
        )}
        {answerArea}
      </div>
    </div>
  );
}
