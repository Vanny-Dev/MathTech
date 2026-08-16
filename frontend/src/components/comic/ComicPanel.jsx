import React from 'react';
import CharacterImage from './CharacterImage.jsx';

export default function ComicPanel({
  characterSrc,
  characterName = '',      // key from the CHARS map, used for the fallback label
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
      {/* Character portrait — falls back to a placeholder if the art is missing */}
      <CharacterImage src={characterSrc} name={characterName} height={140} />

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
