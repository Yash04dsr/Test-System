"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Topbar } from '@/components/layout/Topbar';
import { Timer } from '@/components/test/Timer';
import { QuestionNav, QuestionState } from '@/components/test/QuestionNav';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';

interface Question {
  _id: string;
  text: string;
  options: string[];
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// Dummy questions in case API is down
const DUMMY_QUESTIONS: Question[] = [
  { _id: '1', text: 'What is the derivative of x^2?', options: ['x', '2x', 'x^2', '2'], topic: 'Calculus', difficulty: 'Easy' },
  { _id: '2', text: 'Solve for x: 2x + 5 = 15', options: ['5', '10', '2.5', '15'], topic: 'Algebra', difficulty: 'Easy' },
  { _id: '3', text: 'What is the sum of angles in a triangle?', options: ['90', '180', '360', '270'], topic: 'Geometry', difficulty: 'Easy' },
];

export default function TestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [states, setStates] = useState<Record<number, QuestionState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [warnings, setWarnings] = useState(0);
  const [loading, setLoading] = useState(true); // Local loading state for questions/session

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return; // Guard clause for when user is null but authLoading is false

    // Initial visit state
    setStates(prev => ({ ...prev, 0: prev[0] || 'visited' }));
    
    // Attempt to load saved session from local storage
    const savedSession = localStorage.getItem(`evalsys_testSession_${user.id}`);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.states) setStates(parsed.states);
        if (parsed.currentIdx) setCurrentIdx(parsed.currentIdx);
        if (parsed.startTime) setStartTime(parsed.startTime);
      } catch (e) {
        console.error("Could not parse saved test session", e);
      }
    }

    // Simulate API fetch
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/tests/questions`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          setQuestions(DUMMY_QUESTIONS); // Fallback to dummy questions
        }
      })
      .catch(err => {
        console.error("Error fetching questions, using fallback questions:", err);
        setQuestions(DUMMY_QUESTIONS); // Fallback to dummy questions
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, router, authLoading]);

  // Save session state to localStorage on changes
  useEffect(() => {
    if (user && Object.keys(answers).length > 0) {
      localStorage.setItem(`evalsys_testSession_${user.id}`, JSON.stringify({
        answers, states, currentIdx, startTime
      }));
    }
  }, [answers, states, currentIdx, startTime, user]);

  // Anti-cheat: Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarnings(w => {
          const newWarnings = w + 1;
          if (newWarnings >= 3) {
            toast.error("Maximum tab switches exceeded. Test auto-submitting.", { duration: 5000 });
            submitTest();
          } else {
            toast.warning(`WARNING: Please do not switch tabs during the test. You have ${3 - newWarnings} warnings left.`, { duration: 4000 });
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, answers, user]); // Depend on state needed for auto-submit

  const handleOptionSelect = (optIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
    setStates(prev => ({ ...prev, [currentIdx]: 'answered' }));
  };

  const handleMarkReview = () => {
    setStates(prev => ({ ...prev, [currentIdx]: prev[currentIdx] === 'marked' ? (answers[currentIdx] !== undefined ? 'answered' : 'visited') : 'marked' }));
  };

  const navigateQuestion = (idx: number) => {
    setCurrentIdx(idx);
    setStates(prev => ({ 
      ...prev, 
      [idx]: prev[idx] === 'unvisited' || !prev[idx] ? 'visited' : prev[idx] 
    }));
  };

  const submitTest = async () => {
    setIsSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    if (!user) {
      toast.error('Authentication error. Please login again.');
      setIsSubmitting(false);
      router.push('/login');
      return;
    }

    const timeSpentTotal = Math.floor((Date.now() - startTime) / 1000);
    const answeredQuestionCount = Object.keys(answers).length;
    const avgTimePerAnsweredQuestion = answeredQuestionCount > 0 ? Math.floor(timeSpentTotal / answeredQuestionCount) : 0;

    const formattedAnswers = questions.map((q, idx) => ({
      questionId: q._id,
      selectedOptionIndex: answers[idx] ?? null,
      // Assign average time to answered questions, or a default for unanswered
      timeSpentSeconds: answers[idx] !== undefined ? avgTimePerAnsweredQuestion : 5, 
    }));

    try {
      const res = await fetch(`${apiUrl}/api/tests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, // Now uses real Firebase UID
          answers: formattedAnswers,
          timeSpent: timeSpentTotal
        })
      });
      if (res.ok) {
        localStorage.removeItem(`evalsys_testSession_${user.id}`);
        toast.success("Test submitted successfully!");
        router.push('/dashboard');
      } else {
        localStorage.removeItem(`evalsys_testSession_${user.id}`);
        toast.error("Error submitting test. Returning to dashboard.");
        router.push('/dashboard');
      }
    } catch (e) {
      toast.error("Network error. Returning to dashboard.");
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = questions[currentIdx];

  // If still checking auth, show loader
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in after auth check, redirect (handled by useEffect)
  if (!user) {
    return null; // Or a simple message
  }

  // If questions are still loading, show loader
  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <div className="text-secondary font-medium animate-pulse">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar title="Mathematics Final Mock Test" />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 flex gap-6 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg">Question {currentIdx + 1} of {questions.length}</span>
              <span className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-xs font-medium">
                {question?.topic} • {question?.difficulty}
              </span>
            </div>
            <Timer initialSeconds={3600} onTimeUp={submitTest} />
          </div>

          <Card className="flex-1 flex flex-col">
            <CardContent className="pt-6 flex-1 text-lg">
              <div dangerouslySetInnerHTML={{ __html: question?.text || '' }} className="prose max-w-none text-foreground" />
              
              <div className="mt-8 space-y-3">
                {questions[currentIdx]?.options.map((opt: string, i: number) => (
                  <label 
                    key={i} 
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      answers[currentIdx] === i ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary/10 hover:border-secondary'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name={`question-${currentIdx}`} 
                      className="mt-1 w-4 h-4 text-primary" 
                      checked={answers[currentIdx] === i}
                      onChange={() => handleOptionSelect(i)}
                    />
                    <span className="leading-snug">{opt}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm mt-auto">
            <Button variant="outline" onClick={handleMarkReview} className="gap-2">
              <div className={`w-3 h-3 rounded-full ${states[currentIdx] === 'marked' ? 'bg-yellow-500' : 'bg-transparent border border-current'}`} />
              {states[currentIdx] === 'marked' ? 'Unmark Review' : 'Mark for Review'}
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                disabled={currentIdx === 0}
                onClick={() => navigateQuestion(currentIdx - 1)}
              >
                Previous
              </Button>
              {currentIdx < questions.length - 1 ? (
                <Button onClick={() => navigateQuestion(currentIdx + 1)}>
                  Save & Next
                </Button>
              ) : (
                <Button variant="success" onClick={submitTest} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Navigation Panel */}
        <div className="w-80 shrink-0 hidden lg:block">
          <QuestionNav 
            totalQuestions={questions.length}
            currentQuestion={currentIdx}
            questionStates={states}
            onSelectQuestion={navigateQuestion}
          />
        </div>
      </main>
    </div>
  );
}
