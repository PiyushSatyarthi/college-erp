import React from 'react';
import { AIChatWidget } from '@/components/AIChatWidget';
import { useAppStore } from '@/store/useAppStore';

export function FacultyAIAssistant() {
  const { user } = useAppStore();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Teaching Assistant</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get insights on class performance, attendance trends, and session management
        </p>
      </div>
      <AIChatWidget
        title={`Faculty Assistant${user?.name ? ` · ${user.name.split(' ')[0]}` : ''}`}
        placeholder="Ask about your sessions, class attendance, marks entry…"
        greeting={`Hello ${user?.name?.split(' ')[0] ?? 'Professor'}! 👋 I'm your teaching assistant. I have context about your assigned subjects, recent sessions, and can help you manage attendance and marks. How can I help?`}
        suggestions={[
          'Show my assigned subjects',
          'How do I create a session?',
          'How do I mark attendance?',
          'How do I publish marks?',
          'What sessions did I complete this week?',
        ]}
      />
    </div>
  );
}
