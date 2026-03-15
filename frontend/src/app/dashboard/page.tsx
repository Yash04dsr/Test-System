"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';

// Mock Data fallback
const MOCK_RADAR = [
  { subject: 'Algebra', A: 80, fullMark: 100 },
  { subject: 'Geometry', A: 98, fullMark: 100 },
  { subject: 'Calculus', A: 65, fullMark: 100 },
  { subject: 'Probability', A: 45, fullMark: 100 },
  { subject: 'Physics', A: 85, fullMark: 100 },
];
const MOCK_LINE = [
  { date: 'Mon', score: 65 }, { date: 'Tue', score: 72 }, { date: 'Wed', score: 68 },
  { date: 'Thu', score: 85 }, { date: 'Fri', score: 90 }, { date: 'Sat', score: 92 },
];
const MOCK_PIE = [
  { name: 'Easy', value: 95 }, { name: 'Medium', value: 75 }, { name: 'Hard', value: 40 },
];
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState({
    overallAccuracy: 78,
    totalAttempts: 12,
    radarData: MOCK_RADAR,
    pieData: MOCK_PIE,
    performanceTrends: MOCK_LINE,
    strengths: ['Geometry', 'Physics', 'Algebra'],
    weaknesses: ['Probability', 'Calculus'],
    testHistory: [] as { date: string, score: number, totalQuestions: number, accuracy: number }[],
    aiStudyPlan: 'Loading AI generated strategy...'
  });

  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role === 'admin') { // Added user check here to prevent error if user is null
      router.push('/admin');
      return;
    }

    if (!user) return; // Guard clause before fetch

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Fetch analytics - user is guaranteed to be truthy due to earlier check
    fetch(`${apiUrl}/api/analytics/dashboard/${user.id}`)
      .then(res => res.json())
      .then(resData => {
        if (resData && !resData.error && resData.radarData) {
          setData(resData);
        }
      })
      .catch(err => console.error("Using fallback analytics data"))
      .finally(() => setLoading(false));

    // Fetch available tests
    fetch(`${apiUrl}/api/tests/questions`)
      .then(res => res.json())
      .then(qData => {
        if (Array.isArray(qData)) {
          const topics = Array.from(new Set(qData.map((q: { topic: string }) => q.topic))) as string[];
          setAvailableTopics(topics as string[]);
        }
      })
      .catch(err => console.error("Could not fetch available tests"));
  }, [user, authLoading]);

  // Only render if auth is fully initialized and user exists
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Results Dashboard" />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}.</h2>
              <p className="text-secondary mt-1">Here is a deep analysis of your performance.</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-secondary">Overall Accuracy</div>
              <div className="text-4xl font-bold text-primary">{Math.round(data.overallAccuracy)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Radar Chart (Skill Balance) */}
            <motion.div className="col-span-1 lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="border-border shadow-sm h-full">
              <CardHeader>
                <CardTitle>Skill Balance</CardTitle>
                <p className="text-xs text-secondary-foreground">Topic-wise accuracy distribution</p>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? <Skeleton className="w-full h-full rounded-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Accuracy" dataKey="A" stroke="#0f172a" fill="#0f172a" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            </motion.div>

            {/* Line Chart (Performance Trends) */}
            <motion.div className="col-span-1 lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="border-border shadow-sm h-full">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <p className="text-xs text-secondary-foreground">Scores over time</p>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.performanceTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            </motion.div>

            {/* Pie Chart (Difficulty Mapping) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="col-span-1 border-border shadow-sm">
              <CardHeader>
                <CardTitle>Difficulty Mapping</CardTitle>
                <p className="text-xs text-secondary-foreground">Accuracy across difficulty levels</p>
              </CardHeader>
              <CardContent className="h-[250px]">
                {loading ? <Skeleton className="w-full h-full rounded-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
              <CardHeader>
                <CardTitle>AI Insights Engine</CardTitle>
                <p className="text-xs text-secondary-foreground">Automatically generated focus areas</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-success mb-3 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-success inline-block"></span> Strengths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.strengths.length > 0 ? data.strengths.map(s => (
                        <span key={s} className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium">
                          {s}
                        </span>
                      )) : <span className="text-secondary text-sm">Need more data...</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-destructive mb-3 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-destructive inline-block"></span> Weaknesses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.weaknesses.length > 0 ? data.weaknesses.map(w => (
                        <span key={w} className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-sm font-medium">
                          {w}
                        </span>
                      )) : <span className="text-secondary text-sm">Need more data...</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <span className="text-xl">✨</span> AI Strategy Engine
                  </h4>
                  <p className="text-foreground text-sm leading-relaxed">
                    {data.aiStudyPlan}
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>
            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            {/* Available Tests */}
            <Card className="col-span-1 border-border shadow-sm">
              <CardHeader>
                <CardTitle>Available Tests</CardTitle>
                <p className="text-xs text-secondary-foreground">Topics ready for practice</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableTopics.length === 0 ? (
                  <p className="text-secondary text-sm">No tests available.</p>
                ) : availableTopics.map((topic, i) => (
                  <div key={i} className="flex justify-between items-center bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                    <span className="font-medium text-sm">{topic}</span>
                    <Link href="/test">
                      <Button size="sm" variant="outline" className="h-8">Start</Button>
                    </Link>
                  </div>
                ))}
                <div className="flex justify-between items-center bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <span className="font-semibold text-sm text-primary">Comprehensive Mock</span>
                    <Link href="/test">
                      <Button size="sm" className="h-8">Take Full Test</Button>
                    </Link>
                </div>
              </CardContent>
            </Card>

            {/* Test History Table */}
            <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
              <CardHeader>
                <CardTitle>Test History</CardTitle>
                <p className="text-xs text-secondary-foreground">Your recent exam attempts</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/10 text-secondary-foreground uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">Questions</th>
                        <th className="px-6 py-4 text-center">Score</th>
                        <th className="px-6 py-4 text-right">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.testHistory && data.testHistory.length > 0 ? data.testHistory.slice(0, 5).map((history, idx) => (
                        <tr key={idx} className="hover:bg-secondary/5 transition-colors">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">
                            {new Date(history.date).toLocaleDateString()} at {new Date(history.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="px-6 py-4 text-center">{history.totalQuestions}</td>
                          <td className="px-6 py-4 text-center">{history.score} / {history.totalQuestions}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              history.accuracy >= 70 ? 'bg-success/20 text-success' : 
                              history.accuracy <= 40 ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
                            }`}>
                              {history.accuracy}%
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-secondary">No test history available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
