'use client';

import type { ReactNode } from 'react';
import { createContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { CurrentUser, UserRole, School } from '@/types';
import {
  getSchoolByCode,
  loginUser,
  registerSchoolAndPrincipal,
  type LoginCredentials,
  type RegistrationData
} from '@/lib/data';

export interface AuthContextType {
  currentUser: CurrentUser | null;
  schoolProfile: School | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (data: RegistrationData) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [schoolProfile, setSchoolProfile] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleAuthRedirect = useCallback((user: CurrentUser | null) => {
    if (user) {
      const dashboardPath = `/dashboard/${user.role.toLowerCase()}`;
      // Allow principals to navigate to any page within their dashboard
      const isPrincipalOnDashboard = user.role === 'Principal' && pathname.startsWith('/dashboard/principal');
      
      if (pathname.startsWith('/dashboard') && pathname !== dashboardPath && !isPrincipalOnDashboard) {
        router.replace(dashboardPath);
      } else if (pathname === '/login' || pathname === '/register') {
        router.replace(dashboardPath);
      }
    } else {
      if (pathname.startsWith('/dashboard')) {
        router.replace('/login');
      }
    }
  }, [router, pathname]);

  useEffect(() => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('currentUser');
      const storedSchoolCode = localStorage.getItem('schoolCode');
      
      if (storedUser && storedSchoolCode) {
        const user: CurrentUser = JSON.parse(storedUser);
        const school = getSchoolByCode(storedSchoolCode);
        setCurrentUser(user);
        setSchoolProfile(school);
        handleAuthRedirect(user);
      } else {
        handleAuthRedirect(null);
      }
    } catch (error) {
      console.error('Failed to parse auth data from localStorage', error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('schoolCode');
      handleAuthRedirect(null);
    } finally {
      setLoading(false);
    }
  }, [handleAuthRedirect]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    const user = loginUser(credentials);
    if (user) {
      const school = getSchoolByCode(credentials.schoolCode);
      const userWithSchool: CurrentUser = { ...user, schoolName: school?.name || '' };
      
      localStorage.setItem('currentUser', JSON.stringify(userWithSchool));
      localStorage.setItem('schoolCode', credentials.schoolCode);
      setCurrentUser(userWithSchool);
      setSchoolProfile(school);
      router.push(`/dashboard/${user.role.toLowerCase()}`);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setSchoolProfile(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('schoolCode');
    router.push('/login');
  };

  const register = async (data: RegistrationData): Promise<boolean> => {
    setLoading(true);
    const success = registerSchoolAndPrincipal(data);
    if (success) {
      router.push('/login');
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const value = {
    currentUser,
    schoolProfile,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
