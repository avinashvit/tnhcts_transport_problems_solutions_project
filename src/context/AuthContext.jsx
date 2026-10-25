import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'schoolroute_tn_auth_v1';

export function AuthProvider({ children }) {
  // Default to 'student' role or load from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load auth from localStorage:', e);
    }
    // Default initial user is Student
    return {
      role: 'student',
      name: 'Government School Student / Representative',
      badge: 'Student / School Commuter',
    };
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save auth to localStorage:', e);
    }
  }, [currentUser]);

  const loginAsStudent = (name = 'School Representative') => {
    const user = {
      role: 'student',
      name: name || 'Government School Student',
      badge: 'Student / School Commuter',
    };
    setCurrentUser(user);
    return user;
  };

  const loginAsAdmin = (name = 'District Transport Officer') => {
    const user = {
      role: 'admin',
      name: name || 'District Transport Officer',
      department: 'TNSTC & School Education Dept',
      badge: 'Authorized Official / Admin',
    };
    setCurrentUser(user);
    return user;
  };

  const switchRole = (newRole) => {
    if (newRole === 'admin') {
      loginAsAdmin();
    } else {
      loginAsStudent();
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAdmin: currentUser?.role === 'admin',
        isStudent: currentUser?.role === 'student',
        loginAsStudent,
        loginAsAdmin,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
