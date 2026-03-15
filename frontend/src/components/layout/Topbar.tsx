import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Topbar({ title = 'Dashboard' }: { title?: string }) {
  const { user } = useAuth();
  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-secondary-foreground hover:bg-secondary/10 rounded-full transition-colors relative">
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 border-l pl-4 ml-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium mr-2 hidden md:block">{user?.name || 'Loading...'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
      </div>
    </header>
  );
}
