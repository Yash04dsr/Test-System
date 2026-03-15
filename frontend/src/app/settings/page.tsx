"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { User, Target, Bell, Shield, Save, Loader2, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Settings state — values kept entirely client-side for now
  const [name, setName] = useState('');
  const [targetAccuracy, setTargetAccuracy] = useState(80);
  const [weeklyTestsGoal, setWeeklyTestsGoal] = useState(3);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailReports, setEmailReports] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Populate name from auth context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate a save (in future: PATCH /api/users/:id/settings)
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Show skeleton while auth is loading
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar title="Settings" />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-4xl mx-auto">
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-secondary/20 rounded w-48"></div>
              <div className="h-[200px] bg-secondary/10 rounded-xl border border-border"></div>
              <div className="h-[200px] bg-secondary/10 rounded-xl border border-border"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Settings" />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-4xl mx-auto space-y-8">
          {/* Page header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-secondary mt-1">Manage your profile, goals, and notification preferences.</p>
          </div>

          {/* Profile Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="text-primary" size={20} />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/10 px-3 py-2 text-sm cursor-not-allowed opacity-60"
                  value={user.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email is linked to your authentication account and cannot be changed here.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/10 px-3 py-2 text-sm cursor-not-allowed opacity-60 capitalize"
                  value={user.role}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Academic Goals Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-600" size={20} />
                Academic Goals
              </CardTitle>
              <CardDescription>Set targets for the AI engine to track your progress against.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Accuracy Slider */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Target Accuracy (%)</label>
                  <p className="text-xs text-muted-foreground">Your minimum accuracy goal for mock tests.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50" max="100" step="5"
                    className="w-36 accent-primary"
                    value={targetAccuracy}
                    onChange={(e) => setTargetAccuracy(parseInt(e.target.value))}
                  />
                  <span className="font-bold text-primary text-lg w-12 text-right">{targetAccuracy}%</span>
                </div>
              </div>

              {/* Weekly Test Goal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Weekly Test Goal</label>
                  <p className="text-xs text-muted-foreground">Number of tests to complete each week.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWeeklyTestsGoal(Math.max(1, weeklyTestsGoal - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-input hover:bg-secondary/20 transition-colors text-lg"
                  >−</button>
                  <span className="font-bold text-primary text-lg w-6 text-center">{weeklyTestsGoal}</span>
                  <button
                    onClick={() => setWeeklyTestsGoal(Math.min(10, weeklyTestsGoal + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-input hover:bg-secondary/20 transition-colors text-lg"
                  >+</button>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Notifications Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-blue-600" size={20} />
                Communication Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Push Notifications</span>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${pushNotifications ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Weekly Reports</span>
                <button
                  onClick={() => setEmailReports(!emailReports)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${emailReports ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${emailReports ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Security Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-gray-600" size={20} />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your account is secured via Firebase Authentication. To change your password, use the &quot;Forgot Password&quot; flow on the login page.
              </p>
            </CardContent>
          </Card>
          </motion.div>

          {/* Save Button */}
          <div className="flex justify-end pb-8">
            <Button onClick={handleSave} disabled={saving} className="gap-2 px-8">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
