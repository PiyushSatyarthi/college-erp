import React from 'react';
import { AIChatWidget } from '@/components/AIChatWidget';
import { useAppStore } from '@/store/useAppStore';

export function ParentVoiceAssistant() {
  const { user } = useAppStore();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Assistant</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ask about your ward's attendance, marks, and academic progress
        </p>
      </div>
      <AIChatWidget
        title={`Parent Assistant${user?.name ? ` · ${user.name.split(' ')[0]}` : ''}`}
        placeholder="Ask about your ward's attendance, grades, exam eligibility…"
        greeting={`Hello ${user?.name?.split(' ')[0] ?? 'there'}! 👋 I'm your academic information assistant. I have access to your ward's live attendance data and published marks. Ask me anything about their academic progress.`}
        suggestions={[
          "What is my ward's overall attendance?",
          "Are they eligible for exams?",
          "Which subjects are they struggling in?",
          "What are their latest marks?",
          "Is their attendance below 75% anywhere?",
        ]}
      />
    </div>
  );
}
