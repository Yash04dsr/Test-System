"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function Timer({ initialSeconds, onTimeUp }: { initialSeconds: number, onTimeUp: () => void }) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, onTimeUp]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining < 300; // Less than 5 mins

  return (
    <div className={`flex items-center gap-2 font-mono text-xl font-bold ${isLowTime ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
      <Clock className={isLowTime ? 'text-destructive' : 'text-secondary'} size={24} />
      {formatTime(secondsRemaining)}
    </div>
  );
}
