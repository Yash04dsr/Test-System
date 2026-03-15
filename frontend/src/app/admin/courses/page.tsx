"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/Skeleton';

interface Course {
  _id: string;
  title: string;
  description: string;
  enrolledStudentIds: string[];
}

interface Student {
  id: string;
  name: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Enrollment states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [localEnrollments, setLocalEnrollments] = useState<string[]>([]);

  const fetchCoursesAndStudents = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const [coursesRes, studentsRes] = await Promise.all([
        fetch(`${apiUrl}/api/courses`),
        fetch(`${apiUrl}/api/users/students`)
      ]);
      
      const coursesData = await coursesRes.json();
      const studentsData = await studentsRes.json();
      
      if (!coursesData.error) setCourses(coursesData);
      if (!studentsData.error) setStudents(studentsData);
    } catch (err) {
      toast.error("Failed to fetch data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndStudents();
  }, []);

  const openCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setTitle(course.title);
      setDescription(course.description);
    } else {
      setEditingCourse(null);
      setTitle('');
      setDescription('');
    }
    setIsCourseModalOpen(true);
  };

  const openEnrollmentModal = (course: Course) => {
    setSelectedCourseId(course._id);
    setLocalEnrollments([...(course.enrolledStudentIds || [])]);
    setIsEnrollmentModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!title) {
        toast.error("Course title is required");
        return;
    }
    
    const payload = { title, description };
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const method = editingCourse ? 'PUT' : 'POST';
    const url = editingCourse 
      ? `${apiUrl}/api/courses/${editingCourse._id}`
      : `${apiUrl}/api/courses`;

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsCourseModalOpen(false);
      toast.success(editingCourse ? "Course updated successfully!" : "New course created!");
      fetchCoursesAndStudents();
    } catch (err) {
      toast.error("Failed to save the course. Please try again.");
    }
  };

  const handleSaveEnrollments = async () => {
    if (!selectedCourseId) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      await fetch(`${apiUrl}/api/courses/${selectedCourseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrolledStudentIds: localEnrollments })
      });
      setIsEnrollmentModalOpen(false);
      toast.success("Enrollments updated successfully!");
      fetchCoursesAndStudents();
    } catch (err) {
      toast.error("Failed to update enrollments.");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will NOT delete associated questions.')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${apiUrl}/api/courses/${id}`, { method: 'DELETE' });
      toast.success("Course deleted.");
      fetchCoursesAndStudents();
    } catch (err) {
      toast.error("Failed to delete the course.");
    }
  };

  const toggleStudentEnrollment = (studentId: string) => {
    if (localEnrollments.includes(studentId)) {
      setLocalEnrollments(localEnrollments.filter(id => id !== studentId));
    } else {
      setLocalEnrollments([...localEnrollments, studentId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Course Manager</h2>
          <p className="text-secondary mt-1">Manage courses and control which students have access to them.</p>
        </div>
        <Button onClick={() => openCourseModal()} className="gap-2">
          <Plus size={18} /> Create Course
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/10 text-secondary-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Course Title</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Enrolled Students</th>
                  <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-64" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : courses.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-secondary">No courses found.</td></tr>
                ) : courses.map(course => (
                  <tr key={course._id} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">{course.title}</td>
                    <td className="px-6 py-4 text-secondary">{course.description || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                        {course.enrolledStudentIds?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => openEnrollmentModal(course)} className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Manage Enrollments">
                        <Users size={16} />
                      </button>
                      <button onClick={() => openCourseModal(course)} className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit Course">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteCourse(course._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Delete Course">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Course Editor Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-border shadow-xl">
            <CardHeader>
              <CardTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-secondary/10 border border-secondary/20 rounded-md" placeholder="e.g. Intro to Advanced Mathematics" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-secondary/10 border border-secondary/20 rounded-md" placeholder="Brief outline of the course content" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-secondary/20 mt-6">
                <Button variant="outline" onClick={() => setIsCourseModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveCourse}>{editingCourse ? 'Update Course' : 'Create Course'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course Enrollment Modal */}
      {isEnrollmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-border shadow-xl">
            <CardHeader>
              <CardTitle>Manage Enrollments</CardTitle>
              <p className="text-sm text-secondary">Select which students can access tests for this course.</p>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {students.map(student => {
                  const isEnrolled = localEnrollments.includes(student.id);
                  return (
                    <div 
                      key={student.id} 
                      onClick={() => toggleStudentEnrollment(student.id)}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-colors ${
                        isEnrolled ? "bg-primary/10 border-primary/30" : "bg-card hover:bg-secondary/10 border-border"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isEnrolled}
                        readOnly
                        className="w-4 h-4 text-primary"
                      />
                      <span className="font-medium">{student.name}</span>
                      <span className="text-xs text-secondary ml-auto">{student.id.substring(0,8)}...</span>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-secondary/20 mt-6">
                <Button variant="outline" onClick={() => setIsEnrollmentModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEnrollments}>Save Enrollments</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
