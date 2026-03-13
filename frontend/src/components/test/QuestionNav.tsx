"use client";

import React from 'react';
import { cn } from '../ui/Button';

export type QuestionState = 'unvisited' | 'visited' | 'answered' | 'marked';

interface QuestionNavProps {
  totalQuestions: number;
  currentQuestion: number;
  questionStates: Record<number, QuestionState>;
  onSelectQuestion: (index: number) => void;
}

export function QuestionNav({ totalQuestions, currentQuestion, questionStates, onSelectQuestion }: QuestionNavProps) {
  const getStatusColor = (state: QuestionState) => {
    switch (state) {
      case 'answered': return 'bg-success text-success-foreground border-success';
      case 'marked': return 'bg-yellow-500 text-white border-yellow-600'; // Special accent for marked
      case 'visited': return 'bg-secondary/20 text-foreground border-secondary/30 text-secondary-foreground';
      case 'unvisited': default: return 'bg-background border-input text-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-primary p-4 shrink-0">
        <h3 className="font-semibold text-primary-foreground">Question Panel</h3>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const state = questionStates[idx] || 'unvisited';
            const isActive = currentQuestion === idx;
            
            return (
              <button
                key={idx}
                onClick={() => onSelectQuestion(idx)}
                className={cn(
                  "h-10 w-10 rounded-full border flex items-center justify-center text-sm font-medium transition-all",
                  getStatusColor(state),
                  isActive && "ring-2 ring-primary ring-offset-2 scale-110 shadow-md",
                  !isActive && "hover:border-primary/50"
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t bg-secondary/5 shrink-0 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success"></div> Answered</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Marked</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary/20 border border-secondary/30"></div> Not Answered</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-background border border-input"></div> Not Visited</div>
      </div>
    </div>
  );
}
