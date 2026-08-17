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
  X,
  Sigma,
  BookMarked,
  CalendarClock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const studentNav = [
  { icon: Home, label: 'Home', path: '/home', section: 'home' },
  { icon: BookMarked, label: 'Topics', path: '/topics', section: null },
  { icon: BookOpen, label: 'Competencies', path: '/competencies', section: 'learningCompetencies' },
  { icon: BookText, label: 'Lesson', path: '/lesson', section: 'lesson' },
  { icon: NotebookPen, label: 'Activities', path: '/activities', section: 'activities' },
  { icon: MessageCircleMore, label: 'Feedback', path: '/feedback', section: 'feedback' },
  { icon: RotateCcw, label: 'Review', path: '/review', section: 'review' },
  { icon: BarChart3, label: 'Progress', path: '/progress', section: 'progress' },
  { icon: Info, label: 'About', path: '/about', section: null },
];

const teacherNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard', section: null },
  { icon: Users, label: 'Students', path: '/teacher/students', section: null },
  { icon: Monitor, label: 'Monitor', path: '/teacher/monitor', section: null },
  { icon: CalendarClock, label: 'Schedule', path: '/teacher/schedule', section: null },
];

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const { user, logout, isTeacher } = useAuth();
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
        ...(isMobile ? styles.mobileSidebar : styles.desktopSidebar),
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
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navActive : {}),
              })}
            >
              <Icon size={18} />
              <span style={styles.navLabel}>{item.label}</span>
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
  // Desktop: pin to the viewport so the nav and Logout stay put while the page
  // scrolls. Without alignSelf the flex row would stretch the aside to the full
  // content height, dragging Logout far below the fold on long lessons.
  desktopSidebar: {
    position: 'sticky',
    top: 0,
    height: '100vh',
    alignSelf: 'flex-start',
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
    // On short screens the nav itself scrolls, so Logout stays pinned at the
    // bottom of the sidebar rather than being pushed out of view.
    overflowY: 'auto',
    minHeight: 0,
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
  navLabel: {
    flex: 1,
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
