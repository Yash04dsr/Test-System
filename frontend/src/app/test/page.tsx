"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { Timer } from '@/components/test/Timer';
import { QuestionNav, QuestionState } from '@/components/test/QuestionNav';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

// Dummy questions in case API is down
const DUMMY_QUESTIONS = [
  { _id: '1', text: 'What is the derivative of x^2?', options: ['x', '2x', 'x^2', '2'], topic: 'Calculus', difficulty: 'Easy' },
  { _id: '2', text: 'Solve for x: 2x + 5 = 15', options: ['5', '10', '2.5', '15'], topic: 'Algebra', difficulty: 'Easy' },
  { _id: '3', text: 'What is the sum of angles in a triangle?', options: ['90', '180', '360', '270'], topic: 'Geometry', difficulty: 'Easy' },
];

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState(DUMMY_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [states, setStates] = useState<Record<number, QuestionState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initial visit state
    setStates(prev => ({ ...prev, 0: prev[0] || 'visited' }));
    
    // Simulate API fetch
    fetch('http://localhost:5000/api/tests/questions')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setQuestions(data);
      })
      .catch(err => console.error("Using fallback questions"));
  }, []);

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
    
    const payload = {
      userId: "60d0fe4f5311236168a109ca", // Mock User ID
      answers: questions.map((q, idx) => ({
        questionId: q._id,
        selectedOptionIndex: answers[idx] ?? null,
        timeSpentSeconds: 60, // Mock time spent
      }))
    };

    try {
      const res = await fetch('http://localhost:5000/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        // Fallback to fake submission redirect if backend is down
        router.push('/dashboard');
      }
    } catch (e) {
      router.push('/dashboard');
    }
  };

  const question = questions[currentIdx];

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
                {question?.options.map((opt, i) => (
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
