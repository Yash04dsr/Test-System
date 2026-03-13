"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
  const [data, setData] = useState({
    overallAccuracy: 78,
    totalAttempts: 12,
    radarData: MOCK_RADAR,
    pieData: MOCK_PIE,
    performanceTrends: MOCK_LINE,
    strengths: ['Geometry', 'Physics', 'Algebra'],
    weaknesses: ['Probability', 'Calculus']
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/analytics/dashboard/60d0fe4f5311236168a109ca')
      .then(res => res.json())
      .then(resData => {
        if (resData && !resData.error && resData.radarData) {
          setData(resData);
        }
      })
      .catch(err => console.error("Using fallback analytics data"));
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Results Dashboard" />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome back, Alex.</h2>
              <p className="text-secondary mt-1">Here is a deep analysis of your performance.</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-secondary">Overall Accuracy</div>
              <div className="text-4xl font-bold text-primary">{Math.round(data.overallAccuracy)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Radar Chart (Skill Balance) */}
            <Card className="col-span-1 lg:col-span-1 border-border shadow-sm">
              <CardHeader>
                <CardTitle>Skill Balance</CardTitle>
                <p className="text-xs text-secondary-foreground">Topic-wise accuracy distribution</p>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Accuracy" dataKey="A" stroke="#0f172a" fill="#0f172a" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Line Chart (Performance Trends) */}
            <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <p className="text-xs text-secondary-foreground">Scores over time</p>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.performanceTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart (Difficulty Mapping) */}
            <Card className="col-span-1 border-border shadow-sm">
              <CardHeader>
                <CardTitle>Difficulty Mapping</CardTitle>
                <p className="text-xs text-secondary-foreground">Accuracy across difficulty levels</p>
              </CardHeader>
              <CardContent className="h-[250px]">
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
              </CardContent>
            </Card>
            
          </div>
        </main>
      </div>
    </div>
  );
}
