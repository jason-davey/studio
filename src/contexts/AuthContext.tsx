
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { authInstance } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

type UserRole = 'admin' | 'creator' | null;

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole; // This will be the effective role for UI rendering
  isActualAdmin: boolean; // True if the logged-in user IS jason.davey@greenstone.com.au
  viewingAsRole: UserRole | null; // What role the admin is currently viewing as, if overriding
  setViewOverride: (role: UserRole | null) => void; // Function for admin to set the override
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualUserRole, setActualUserRole] = useState<UserRole>(null);
  const [viewingAsRole, setViewingAsRole] = useState<UserRole | null>(null); // Admin's override

  useEffect(() => {
    if (!authInstance) {
      console.warn("Firebase Auth instance not available. User authentication will not work.");
      setLoading(false);
      setActualUserRole(null);
      setViewingAsRole(null);
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
      setViewingAsRole(null); // Reset override on auth state change
      if (user) {
        if (user.email === 'jason.davey@greenstone.com.au') {
          setActualUserRole('admin');
        } else {
          setActualUserRole('creator');
        }
      } else {
        setActualUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isActualAdmin = useMemo(() => actualUserRole === 'admin', [actualUserRole]);

  const effectiveUserRole = useMemo(() => {
    if (isActualAdmin && viewingAsRole) {
      return viewingAsRole;
    }
    return actualUserRole;
  }, [isActualAdmin, viewingAsRole, actualUserRole]);

  const setViewOverride = useCallback((role: UserRole | null) => {
    if (isActualAdmin) {
      setViewingAsRole(role);
    }
  }, [isActualAdmin]);

  if (loading) { // Simplified condition: only check loading state
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Loading Authentication...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        userRole: effectiveUserRole, 
        isActualAdmin,
        viewingAsRole,
        setViewOverride,
        loading 
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
