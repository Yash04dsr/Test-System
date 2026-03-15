"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/Skeleton';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  courseId: string;
  difficulty: string;
}

interface Course {
  _id: string;
  title: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [courseId, setCourseId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchQuestionsAndCourses = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const [qRes, cRes] = await Promise.all([
        fetch(`${apiUrl}/api/tests/admin/questions`),
        fetch(`${apiUrl}/api/courses`)
      ]);
      const qData = await qRes.json();
      const cData = await cRes.json();
      
      if (!qData.error) setQuestions(qData);
      if (!cData.error) setCourses(cData);
    } catch (err) {
      toast.error("Failed to fetch data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsAndCourses();
  }, []);

  const openModal = (q?: Question) => {
    if (q) {
      setEditingQuestion(q);
      setText(q.text);
      setOptions([...q.options]);
      setCorrectIndex(q.correctOptionIndex);
      setCourseId(q.courseId || '');
      setDifficulty(q.difficulty);
    } else {
      setEditingQuestion(null);
      setText('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setCourseId(courses.length > 0 ? courses[0]._id : '');
      setDifficulty('Medium');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!courseId) {
      toast.error("Please select a Course for this question.");
      return;
    }
    const payload = {
      text, options, correctOptionIndex: correctIndex, courseId, difficulty
    };
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const method = editingQuestion ? 'PUT' : 'POST';
    const url = editingQuestion 
      ? `${apiUrl}/api/tests/questions/${editingQuestion._id}`
      : `${apiUrl}/api/tests/questions`;

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      toast.success(editingQuestion ? "Question updated successfully!" : "New question added!");
      fetchQuestionsAndCourses();
    } catch (err) {
      toast.error("Failed to save the question. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${apiUrl}/api/tests/questions/${id}`, { method: 'DELETE' });
      toast.success("Question deleted.");
      fetchQuestionsAndCourses();
    } catch (err) {
      toast.error("Failed to delete the question.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Question Bank Manager</h2>
          <p className="text-secondary mt-1">Add, edit, or remove questions from the global test database.</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus size={18} /> Add New Question
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/10 text-secondary-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Course</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Question Text</th>
                  <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-64" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : questions.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-secondary">No questions found in database.</td></tr>
                ) : questions.map(q => {
                  const courseNum = courses.find(c => c._id === q.courseId);
                  return (
                  <tr key={q._id} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{courseNum ? courseNum.title : 'Legacy Topic'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        q.difficulty === 'Easy' ? 'bg-success/20 text-success' : 
                        q.difficulty === 'Hard' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs" dangerouslySetInnerHTML={{ __html: q.text }}></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openModal(q)} className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors mr-2">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(q._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl border-border shadow-xl">
            <CardHeader>
              <CardTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign to Course</label>
                  <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full p-2 bg-secondary/10 border border-secondary/20 rounded-md">
                    <option value="" disabled>Select a Course...</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-2 bg-secondary/10 border border-secondary/20 rounded-md">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Text (HTML allowed)</label>
                <textarea rows={3} value={text} onChange={e => setText(e.target.value)} className="w-full p-2 bg-secondary/10 border border-secondary/20 rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={correctIndex === idx} 
                      onChange={() => setCorrectIndex(idx)} 
                      className="w-4 h-4 text-primary"
                    />
                    <input 
                      type="text" 
                      value={opt} 
                      onChange={e => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }} 
                      className="flex-1 p-2 bg-secondary/10 border border-secondary/20 rounded-md" 
                      placeholder={`Option ${idx + 1}`} 
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-secondary/20 mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Question</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
