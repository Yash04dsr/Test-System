"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

interface StudentAnalytic {
  id: string;
  name: string;
  testsTaken: number;
  averageAccuracy: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentAnalytic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/analytics/admin/students`);
        const data = await res.json();
        if (!data.error) setStudents(data);
      } catch (err) {
        console.error("Failed to fetch student roster", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Roster</h2>
          <p className="text-secondary mt-1">Review activity and performance metrics for all registered students.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-xl p-3 max-w-md">
        <Search size={18} className="text-secondary" />
        <input 
          type="text" 
          placeholder="Search by student name or ID..." 
          className="bg-transparent border-none outline-none flex-1 text-sm text-foreground"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/10 text-secondary-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Student Name</th>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4 text-center">Tests Taken</th>
                  <th className="px-6 py-4 text-center">Avg. Accuracy</th>
                  <th className="px-6 py-4 rounded-tr-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12 mx-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 mx-auto" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-secondary">No students found.</td></tr>
                ) : filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary font-mono text-xs">{student.id}</td>
                    <td className="px-6 py-4 text-center font-medium">{student.testsTaken}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        student.averageAccuracy >= 70 ? 'bg-success/20 text-success' : 
                        student.averageAccuracy <= 40 ? 'bg-destructive/20 text-destructive' : 'bg-secondary/20 text-secondary-foreground'
                      }`}>
                        {student.averageAccuracy}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* In the future, this could link to a detailed Admin perspective of the student dashboard */}
                      <Button variant="outline" size="sm" className="gap-1 text-xs" disabled>
                        View Report <ChevronRight size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
