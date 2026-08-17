import React from 'react';
import { BookOpen, BookText, NotebookPen, MessageCircleMore, RotateCcw, BarChart3 } from 'lucide-react';

export default function InstructionsPage() {
  const steps = [
    { icon: BookOpen, title: 'Read Competencies', desc: 'Understand what you will learn.' },
    { icon: BookText, title: 'Study the Lesson', desc: 'Go through discussion, concepts, and examples.' },
    { icon: NotebookPen, title: 'Do Activities', desc: 'Practice then take the independent activity.' },
    { icon: MessageCircleMore, title: 'Check Feedback', desc: 'See your score and correct answers.' },
    { icon: RotateCcw, title: 'Review & Retry', desc: 'Go over wrong answers and try again.' },
    { icon: BarChart3, title: 'Track Progress', desc: 'Monitor your improvement over attempts.' },
  ];

  return (
    <div>
      <h1 className="section-title">Instructions</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '600px' }}>
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="comic-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', border: '2px solid var(--ink)', background: 'var(--white)' }}>
                <Icon size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.1rem', letterSpacing: '1px' }}>
                  {i + 1}. {s.title}
                </div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: 'var(--muted-strong)' }}>
                  {s.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
