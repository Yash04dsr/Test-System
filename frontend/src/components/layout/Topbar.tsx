import React from 'react';
import { Bell, User } from 'lucide-react';

export function Topbar({ title = 'Dashboard' }: { title?: string }) {
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
            <span className="text-sm font-medium">Alex Student</span>
            <span className="text-xs text-secondary">Premium Tier</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
