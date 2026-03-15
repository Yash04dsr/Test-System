"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { User, Target, Bell, Shield, Save, Loader2, Trophy, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    targetAccuracy: 85,
    weeklyTestsGoal: 3,
    pushNotifications: true,
    emailNotifications: true,
    theme: 'light'
  });

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call for now (In real app, update Firestore users/settings collection)
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Settings</h1>
        <p className="text-secondary-foreground/70 text-lg">Manage your profile, academic goals, and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Navigation (Visual) */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/10 text-primary font-semibold rounded-lg text-left">
            <User size={18} />
            Profile & Account
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary-foreground hover:bg-secondary/10 rounded-lg text-left transition-colors">
            <Target size={18} />
            Academic Goals
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary-foreground hover:bg-secondary/10 rounded-lg text-left transition-colors">
            <Bell size={18} />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary-foreground hover:bg-secondary/10 rounded-lg text-left transition-colors">
            <Shield size={18} />
            Privacy & Security
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <Card className="border-secondary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="text-primary" size={20} />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details visible on your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                <input 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
                <input 
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/10 px-3 py-2 text-sm ring-offset-background cursor-not-allowed opacity-70"
                  value={settings.email}
                  disabled
                />
                <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed as it is linked to your authentication account.</p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Goals Section */}
          <Card className="border-secondary/20 shadow-lg shadow-primary/5 luxury-gradient-on-hover">
            <CardHeader className="bg-secondary/5">
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="text-yellow-600" size={20} />
                Academic Goals
              </CardTitle>
              <CardDescription>Set targets for the AI study engine to track your progress.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Target Accuracy (%)</label>
                    <p className="text-xs text-muted-foreground">Minimum score goal for mock tests.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="50" max="100" step="5"
                      className="w-32 accent-primary"
                      value={settings.targetAccuracy}
                      onChange={(e) => setSettings({...settings, targetAccuracy: parseInt(e.target.value)})}
                    />
                    <span className="font-bold text-primary w-8">{settings.targetAccuracy}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Weekly Test Goal</label>
                    <p className="text-xs text-muted-foreground">Number of tests to take per week.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSettings(s => ({...s, weeklyTestsGoal: Math.max(1, s.weeklyTestsGoal - 1)}))}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-secondary/30 hover:bg-secondary/10">-</button>
                    <span className="font-bold text-primary">{settings.weeklyTestsGoal}</span>
                    <button 
                      onClick={() => setSettings(s => ({...s, weeklyTestsGoal: Math.min(10, s.weeklyTestsGoal + 1)}))}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-secondary/30 hover:bg-secondary/10">+</button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="border-secondary/20 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="text-blue-600" size={20} />
                Communication Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Push Notifications</span>
                  <div 
                    onClick={() => setSettings({...settings, pushNotifications: !settings.pushNotifications})}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${settings.pushNotifications ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Weekly Reports</span>
                  <div 
                    onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${settings.emailNotifications ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
               </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
                onClick={handleSave} 
                disabled={saving}
                className="gap-2 px-8 py-6 text-lg"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
