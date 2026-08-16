import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  BookText,
  NotebookPen,
  MessageCircleMore,
  RotateCcw,
  BarChart3,
  Info,
  LayoutDashboard,
  Users,
  Monitor,
  LogOut,
  Check,
  Lock,
  X,
  Sigma,
  BookMarked,
  CalendarClock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkbook } from '../../context/WorkbookContext.jsx';

const studentNav = [
  { icon: Home, label: 'Home', path: '/home', section: 'home', math: 'f(x)' },
  { icon: BookMarked, label: 'Topics', path: '/topics', section: null, math: 'topics[]' },
  { icon: BookOpen, label: 'Competencies', path: '/competencies', section: 'learningCompetencies', math: 'MELC' },
  { icon: BookText, label: 'Lesson', path: '/lesson', section: 'lesson', math: '∫' },
  { icon: NotebookPen, label: 'Activities', path: '/activities', section: 'activities', math: 'Qₙ' },
  { icon: MessageCircleMore, label: 'Feedback', path: '/feedback', section: 'feedback', math: 'Σ/n' },
  { icon: RotateCcw, label: 'Review', path: '/review', section: 'review', math: 'Δ' },
  { icon: BarChart3, label: 'Progress', path: '/progress', section: 'progress', math: 'x̄' },
  { icon: Info, label: 'About', path: '/about', section: null, math: 'i' },
];

const teacherNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard', section: null, math: 'Σ' },
  { icon: Users, label: 'Students', path: '/teacher/students', section: null, math: 'n =' },
  { icon: Monitor, label: 'Monitor', path: '/teacher/monitor', section: null, math: 'live' },
  { icon: CalendarClock, label: 'Schedule', path: '/teacher/schedule', section: null, math: 'release' },
];

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const { user, logout, isTeacher } = useAuth();
  const { isUnlocked, completedSections } = useWorkbook();
  const navigate = useNavigate();

  const navItems = isTeacher ? teacherNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      style={{
        ...styles.sidebar,
        ...(isMobile ? styles.mobileSidebar : {}),
        ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed),
        ...(isMobile && !isOpen ? styles.mobileHidden : {}),
      }}
    >
      <div style={styles.logo}>
        <span style={styles.logoWrap}>
          <span style={styles.logoMark}><Sigma size={17} strokeWidth={3} /></span>
          <span style={styles.logoText}>MathTech</span>
        </span>
        {isMobile && (
          <button type="button" onClick={onClose} style={styles.closeButton} aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>

      <div style={styles.userBox}>
        <div style={styles.avatar}>{user?.fullname?.[0]?.toUpperCase()}</div>
        <div>
          <div style={styles.userName}>{user?.fullname}</div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const locked = !isTeacher && item.section && !isUnlocked(item.section);
          const done = !isTeacher && item.section && completedSections[item.section];
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={locked ? '#' : item.path}
              onClick={(e) => locked && e.preventDefault()}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navActive : {}),
                ...(locked ? styles.navLocked : {}),
              })}
            >
              <Icon size={18} />
              <span style={styles.navLabel}>{item.label}</span>
              {item.math && <span style={styles.navMath}>{item.math}</span>}
              {done && <span style={styles.badge}><Check size={12} /></span>}
              {locked && <span style={{ ...styles.badge, background: 'var(--muted)' }}><Lock size={12} /></span>}
            </NavLink>
          );
        })}
      </nav>

      <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: 'var(--board)',
    color: 'var(--white)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    borderRight: '3px solid var(--ink)',
    flexShrink: 0,
    transition: 'transform 0.2s ease',
    zIndex: 1200,
  },
  mobileSidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: 'min(280px, 85vw)',
  },
  mobileHidden: {
    visibility: 'hidden',
    pointerEvents: 'none',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarClosed: {
    transform: 'translateX(-100%)',
  },
  logo: {
    padding: '1.1rem 1rem',
    borderBottom: '2px solid var(--board-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: 0,
  },
  logoMark: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--teal)',
    color: 'var(--board)',
    border: '2px solid var(--paper)',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1rem',
    letterSpacing: '0.5px',
    color: 'var(--teal)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.8rem 1rem',
    borderBottom: '2px solid var(--board-light)',
  },
  avatar: {
    width: '36px',
    height: '36px',
    background: 'var(--teal)',
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Fredoka One, cursive',
    fontSize: '1.2rem',
    border: '2px solid var(--white)',
    flexShrink: 0,
  },
  userName: {
    fontFamily: 'Fredoka One, cursive',
    fontSize: '0.95rem',
    letterSpacing: '1px',
  },
  userRole: {
    fontSize: '0.7rem',
    color: 'var(--muted)',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '0.5rem 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.7rem 1rem',
    color: 'var(--muted)',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '0.88rem',
    borderLeft: '4px solid transparent',
    transition: 'background 0.15s',
    textDecoration: 'none',
  },
  navActive: {
    background: 'var(--board-light)',
    borderLeft: '4px solid var(--teal)',
    color: 'var(--teal)',
  },
  navLocked: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  navLabel: {
    flex: 1,
  },
  navMath: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.62rem',
    fontWeight: 700,
    color: 'var(--muted)',
    flexShrink: 0,
  },
  badge: {
    background: 'var(--yellow)',
    color: 'var(--ink)',
    borderRadius: '999px',
    padding: '0 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    margin: '1rem',
    padding: '0.7rem',
    background: 'transparent',
    border: '2px solid var(--board-light)',
    color: 'var(--muted)',
    fontFamily: 'Fredoka One, cursive',
    letterSpacing: '1px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
  },
};
