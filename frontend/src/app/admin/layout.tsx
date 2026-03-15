"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If no user or not an admin, redirect
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Keep rendering minimal until auth is verified
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Administrator Portal" />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
