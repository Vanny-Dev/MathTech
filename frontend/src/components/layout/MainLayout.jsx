import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import ResponsiveAd from '../ads/ResponsiveAd.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MainLayout({ children }) {
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 900);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 900);
  const location = useLocation();
  const { isTeacher, isDeveloper } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobileView(mobile);
      setIsSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(isMobileView ? false : true);
  }, [location.pathname, isMobileView]);

  // A student reads one column of questions and explanation, so that column is
  // held to a comfortable measure and centred. A teacher works with rosters and
  // progress tables, which need the room, so those pages get a wide column.
  const isTeacherPage = location.pathname.startsWith('/teacher') || location.pathname.startsWith('/developer');

  return (
    <div style={styles.root}>
      <Sidebar isOpen={isMobileView ? isSidebarOpen : true} onClose={() => setIsSidebarOpen(false)} isMobile={isMobileView} />
      {isMobileView && isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={styles.overlay} />
      )}
      <div style={styles.content}>
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="graph-paper" style={styles.main}>
          {/* The graph paper still covers the full width; the reading column
              inside it is centred, so a wide laptop does not leave every page
              hugging the left edge with a third of the screen empty. */}
          <div style={{ ...styles.column, maxWidth: isTeacherPage ? '1240px' : '700px' }}>
            {children}
            {/* Teachers and developers work with rosters/settings, not the
                comic workbook — ads stay on the student-facing pages only. */}
            {!isTeacher && !isDeveloper && (
              <ResponsiveAd placement="content" style={{ marginTop: '1.5rem' }} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--paper)',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    // No `overflow: hidden` here — an overflow ancestor clips position: sticky,
    // which would stop the Navbar sticking to the top.
    minWidth: 0,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 1100,
  },
  main: {
    flex: 1,
    // The page itself scrolls, not this element. An inner scroll container
    // would give the sticky Navbar nothing to stick against.
    padding: 'clamp(1rem, 2.5vw, 1.5rem)',
    /* background comes from .graph-paper */
  },
  column: {
    width: '100%',
    marginInline: 'auto',
  },
};
