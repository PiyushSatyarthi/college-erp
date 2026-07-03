import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { aiApi, ApiError } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  title: string;
  placeholder: string;
  greeting: string;
  suggestions: string[];
}

export function AIChatWidget({ title, placeholder, greeting, suggestions }: Props) {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      // Keep last 10 exchanges for context (20 messages)
      const history = messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
      const { reply } = await aiApi.chat(msg, history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      const errMsg = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(errMsg);
      // Remove the user message that failed so they can retry
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[740px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-blue-600 text-white">
        <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-blue-200">Powered by Claude · Context-aware</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-blue-200">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Greeting */}
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="max-w-[80%]">
            <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed">
              {greeting}
            </div>
          </div>
        </div>

        {/* Suggestion pills */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="px-3 py-1.5 text-xs rounded-full border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Conversation */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
              ${msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'}`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-4 py-3 text-sm leading-relaxed rounded-2xl whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10 p-3 text-sm text-red-700 dark:text-red-400 mx-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {error.includes('GROQ_API_KEY') || error.includes('not configured') ? (
                <p className="text-xs mt-1 text-red-500">
                  Add <code className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">GROQ_API_KEY</code> to your backend <code className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">.env</code> and restart. Free key at <a href="https://console.groq.com" target="_blank" className="underline">console.groq.com</a>.
                </p>
              ) : null}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 max-h-32"
            style={{ height: 'auto', minHeight: '42px' }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
