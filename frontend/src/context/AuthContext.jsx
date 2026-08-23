import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dw_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem('dw_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('dw_user');
    setUser(null);
  };

  /**
   * Confirm on load that the stored session still belongs to a real account.
   *
   * The signed-in user was read from localStorage and trusted from then on, so
   * a student whose account a teacher had deleted stayed inside the app: their
   * token was still validly signed, and nothing ever asked the server whether
   * the account existed. Checking once at startup ejects them straight away
   * rather than at whatever point a page happens to make its next request.
   *
   * A 401 is handled by the axios interceptor, which clears the session and
   * sends the browser to the login page. Anything else — the API being down,
   * for instance — must not log a legitimate student out, so it is ignored.
   */
  useEffect(() => {
    if (!user?.token) return;

    let cancelled = false;
    getMeApi()
      .then(({ data }) => {
        if (cancelled || !data?._id) return;
        // Keep the local copy in step with the server (a changed name or role)
        setUser((prev) => {
          if (!prev) return prev;
          const merged = { ...prev, ...data, token: prev.token };
          localStorage.setItem('dw_user', JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
    // Runs once for the session that was restored at startup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, login, logout, isTeacher, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
