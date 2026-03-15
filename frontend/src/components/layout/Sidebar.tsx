"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added imports
import { LayoutDashboard, FileText, Settings, LogOut, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname(); // Added line
  const { user, logout } = useAuth();
  const router = useRouter(); // Added line

  const handleLogout = async () => { // Added function
    await logout();
  };

  return (
    <aside className="w-64 bg-primary text-primary-foreground min-h-screen flex flex-col hidden md:flex">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">EvalSys PRO</h2>
        <p className="text-secondary-foreground/70 text-sm mt-1">Smart Evaluation Engine</p>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary/40 transition-colors">
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </Link>
        {user?.role === 'admin' ? (
          <>
            <Link href="/admin/questions" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/admin/questions' ? 'bg-secondary/40 font-semibold' : 'hover:bg-secondary/20'}`}>
              <ShieldCheck size={20} />
              <span className="font-medium">Manage Questions</span>
            </Link>
            <Link href="/admin/courses" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/admin/courses' ? 'bg-secondary/40 font-semibold' : 'hover:bg-secondary/20'}`}>
              <BookOpen size={20} />
              <span className="font-medium">Manage Courses</span>
            </Link>
          </>
        ) : (
          <Link href="/test" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary/40 transition-colors">
            <FileText size={20} />
            <span className="font-medium">Take Mock Test</span>
          </Link>
        )}
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary/40 transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-secondary/30">
        <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors text-primary-foreground">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
