"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth, Role } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isSignUp && !name) return;

    setLoading(true);
    try {
      if (isSignUp) {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name
        await updateProfile(user, { displayName: name });
        
        // Create user document in Firestore targeting the assigned user ID
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          role,
          createdAt: new Date().toISOString()
        });

        toast.success("Account created successfully!");
        router.push(role === 'admin' ? '/admin' : '/dashboard');
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Fetch role to know where to redirect
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userRole = userDoc.data().role as Role;
          toast.success("Welcome back!");
          router.push(userRole === 'admin' ? '/admin' : '/dashboard');
        } else {
          // If no doc exists, default to student dashboard
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error((err as Error).message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user document already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let userRole: Role = 'student';

      if (!userDoc.exists()) {
        // First time Google sign in, create document (default to student)
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'Google User',
          email: user.email,
          role: 'student',
          createdAt: new Date().toISOString()
        });
      } else {
        userRole = userDoc.data().role as Role;
      }

      toast.success("Signed in with Google!");
      router.push(userRole === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      console.error(err);
      toast.error((err as Error).message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border shadow-lg rounded-2xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">EvalSys <span className="text-primary">PRO</span></h1>
          <p className="text-secondary mt-2">{isSignUp ? 'Create a secure account' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          {isSignUp && (
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
          )}
          
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
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full p-3 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isSignUp && (
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
          )}

          <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-secondary/20"></div>
            <span className="flex-shrink-0 mx-4 text-secondary text-sm">Alternatively</span>
            <div className="flex-grow border-t border-secondary/20"></div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full py-6 bg-white text-black hover:bg-gray-100 border-gray-300 gap-3" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </form>
        
        <div className="text-center text-sm text-secondary-foreground pt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-primary font-semibold hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
