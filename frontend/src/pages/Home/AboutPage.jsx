import React from 'react';
import { Info } from 'lucide-react';
import SectionTitle from '../../components/shared/SectionTitle.jsx';

export default function AboutPage() {
  return (
    <div>
      <SectionTitle icon={Info} label="info">About</SectionTitle>
      <div className="comic-card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.3rem', marginBottom: '0.8rem' }}>
          MathTech — Mathematics
        </h2>
        <p style={{ fontFamily: 'Nunito, sans-serif', lineHeight: 1.8 }}>
          MathTech is an interactive digital workbook designed to make learning Mathematics
          engaging and fun using a comic-style interface. Students follow a structured
          learning path from competencies to interactive activities, with real-time
          progress tracking and teacher monitoring.
        </p>
      </div>
    </div>
  );
}
