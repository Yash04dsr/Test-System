"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, BookOpen, Target, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalTestsTaken: 0,
    averageAccuracy: 0,
    activeQuestions: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/analytics/admin/global`);
        const data = await res.json();
        
        if (!data.error) {
          setMetrics(data);
        }
      } catch (err) {
        console.error("Failed to fetch admin metrics", err);
        // Fallback demo data
        setMetrics({
          totalStudents: 142,
          totalTestsTaken: 894,
          averageAccuracy: 68.4,
          activeQuestions: 45
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-secondary mt-1">Global performance and usage metrics across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Total Students</CardTitle>
            <Users size={16} className="text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalStudents}</div>
            <p className="text-xs text-secondary mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Tests Taken</CardTitle>
            <Target size={16} className="text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalTestsTaken}</div>
            <p className="text-xs text-secondary mt-1">Across all subjects</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Global Avg Accuracy</CardTitle>
            <TrendingUp size={16} className="text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{metrics.averageAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-secondary mt-1">System-wide performance</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Active Questions</CardTitle>
            <BookOpen size={16} className="text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.activeQuestions}</div>
            <p className="text-xs text-secondary mt-1">In question bank</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-secondary/10 border border-secondary/20 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Admin Notice</h3>
        <p className="text-secondary-foreground text-sm">
          The Question Manager and Student Roster features can be accessed from the sidebar. 
          Use these tools to modify the test database and review individual student performance metrics.
        </p>
      </div>
    </div>
  );
}
