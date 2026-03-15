"use client";

import React, { useState } from 'react';
import { useAuth, Role } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('student');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      login(name, email, role);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border shadow-lg rounded-2xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">EvalSys <span className="text-primary">PRO</span></h1>
          <p className="text-secondary mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Alex Johnson"
              className="w-full p-3 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="alex@university.edu"
              className="w-full p-3 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Select Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3 border rounded-lg transition-all ${role === 'student' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-secondary/20 text-secondary hover:bg-secondary/10'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 border rounded-lg transition-all ${role === 'admin' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-secondary/20 text-secondary hover:bg-secondary/10'}`}
              >
                Administrator
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full py-6 text-lg">
            Continue to Dashboard
          </Button>
        </form>
        
        <div className="text-center text-xs text-secondary-foreground">
          For demo purposes, entering any name and email works. Real authentication is disabled.
        </div>
      </div>
    </div>
  );
}
