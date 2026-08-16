import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function MainLayout({ children }) {
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 900);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 900);
  const location = useLocation();

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

  return (
    <div style={styles.root}>
      <Sidebar isOpen={isMobileView ? isSidebarOpen : true} onClose={() => setIsSidebarOpen(false)} isMobile={isMobileView} />
      {isMobileView && isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={styles.overlay} />
      )}
      <div style={styles.content}>
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="graph-paper" style={styles.main}>{children}</main>
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
    overflow: 'hidden',
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
    overflowY: 'auto',
    padding: 'clamp(1rem, 2.5vw, 1.5rem)',
    /* background comes from .graph-paper */
  },
};
