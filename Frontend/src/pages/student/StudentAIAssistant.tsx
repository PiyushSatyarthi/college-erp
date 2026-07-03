import React from 'react';
import { AIChatWidget } from '@/components/AIChatWidget';
import { useAppStore } from '@/store/useAppStore';

export function StudentAIAssistant() {
  const { user } = useAppStore();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Study Assistant</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ask about your attendance, marks, eligibility, or anything academic
        </p>
      </div>
      <AIChatWidget
        title={`Student Assistant${user?.name ? ` · ${user.name.split(' ')[0]}` : ''}`}
        placeholder="Ask about your attendance, marks, condonation status…"
        greeting={`Hi ${user?.name?.split(' ')[0] ?? 'there'}! 👋 I'm your academic assistant. I have access to your real attendance percentages, published marks, and condonation requests. What would you like to know?`}
        suggestions={[
          'What is my overall attendance?',
          'Am I eligible for exams?',
          'Which subjects am I below 75%?',
          'What are my latest marks?',
          'How do I apply for condonation?',
        ]}
      />
    </div>
  );
}
