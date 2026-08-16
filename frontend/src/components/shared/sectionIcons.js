import {
  Home,
  BookOpen,
  BookText,
  NotebookPen,
  MessageCircleMore,
  RotateCcw,
  BarChart3,
} from 'lucide-react';

/**
 * Workbook sections in unlock order, with their lucide icon and the
 * monospace math label used beside them. Shared by the teacher monitor
 * and student detail views so both stay in sync with the Sidebar.
 */
export const SECTION_META = [
  { key: 'home',                 icon: Home,              label: 'Home',         math: 'f(x)' },
  { key: 'learningCompetencies', icon: BookOpen,          label: 'Competencies', math: 'MELC' },
  { key: 'lesson',               icon: BookText,          label: 'Lesson',       math: '∫' },
  { key: 'activities',           icon: NotebookPen,       label: 'Activities',   math: 'Qₙ' },
  { key: 'feedback',             icon: MessageCircleMore, label: 'Feedback',     math: 'Σ/n' },
  { key: 'review',               icon: RotateCcw,         label: 'Review',       math: 'Δ' },
  { key: 'progress',             icon: BarChart3,         label: 'Progress',     math: 'x̄' },
];

export const SECTION_KEYS = SECTION_META.map((s) => s.key);

export const SECTION_ICONS = Object.fromEntries(
  SECTION_META.map((s) => [s.key, s.icon])
);
