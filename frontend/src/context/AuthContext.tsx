"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type Role = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, email: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('evalsys_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (name: string, email: string, role: Role) => {
    // Simulated login: Generate a mock ID based on the email
    const id = btoa(email).slice(0, 24); // Fake a 24-char ObjectId
    const newUser: User = { id, name, email, role };
    setUser(newUser);
    localStorage.setItem('evalsys_user', JSON.stringify(newUser));
    
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('evalsys_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
