import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { unwrap } from '../utils/unwrap.js';

export const aiRouter = Router();

aiRouter.use(requireAuth);

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(20)
    .optional()
    .default([]),
});

// ---------------------------------------------------------------------------
// Build a role-specific system prompt injected with live context data
// ---------------------------------------------------------------------------
async function buildSystemPrompt(userId: string, role: string): Promise<string> {
  const basePrompt = `You are an academic assistant for Shri Vivekanand College of Engineering, 
helping ${role}s manage attendance, marks, and academic progress. 
Be concise, friendly, and accurate. Current date: ${new Date().toLocaleDateString('en-IN')}.
Do not make up data — only state facts you have been given.`;

  if (role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('id, roll_number, division, year, course:courses(name), department:departments(name)')
      .eq('user_id', userId)
      .maybeSingle();

    if (!student) return basePrompt;

    const { data: attData } = await supabase
      .from('attendance_records')
      .select('status, session:sessions!inner(subject:subjects(name, code))')
      .eq('student_id', student.id);

    // Aggregate per subject
    const subjectAtt: Record<string, { present: number; total: number; name: string }> = {};
    for (const rec of attData ?? []) {
      const subj = (rec.session as any)?.subject;
      if (!subj) continue;
      if (!subjectAtt[subj.code]) subjectAtt[subj.code] = { present: 0, total: 0, name: subj.name };
      subjectAtt[subj.code].total++;
      if (rec.status === 'Present' || rec.status === 'Late') subjectAtt[subj.code].present++;
    }

    const attSummary = Object.entries(subjectAtt)
      .map(([code, s]) => `  • ${s.name} (${code}): ${s.total > 0 ? Math.round((s.present / s.total) * 100) : 0}% (${s.present}/${s.total})`)
      .join('\n') || '  No attendance records yet.';

    const { data: marks } = await supabase
      .from('marks')
      .select('q1, q2, q3, total, grade, published, subject:subjects(name, code)')
      .eq('student_id', student.id)
      .eq('published', true);

    const marksSummary = (marks ?? [])
      .map((m: any) => `  • ${m.subject?.name}: ${m.total}/60 (${m.grade ?? '—'})`)
      .join('\n') || '  No published marks yet.';

    const { data: condonations } = await supabase
      .from('condonations')
      .select('status, subject:subjects(name)')
      .eq('student_id', student.id);

    const condSummary = (condonations ?? [])
      .map((c: any) => `  • ${c.subject?.name}: ${c.status}`)
      .join('\n') || '  No condonation requests.';

    return `${basePrompt}

STUDENT CONTEXT:
- Name is available from their session
- Roll Number: ${student.roll_number}
- Course: ${(student.course as any)?.name}
- Department: ${(student.department as any)?.name}
- Division: ${student.division}, Year: ${student.year}

ATTENDANCE (current year):
${attSummary}

PUBLISHED MARKS:
${marksSummary}

CONDONATION REQUESTS:
${condSummary}

Answer questions about their own data. Help them understand their eligibility, suggest applying for condonation when attendance is below 75%, and explain their grades clearly.`;
  }

  if (role === 'faculty') {
    const { data: faculty } = await supabase
      .from('faculty')
      .select('id, designation, department:departments(name), user:users!faculty_user_id_fkey(name)')
      .eq('user_id', userId)
      .maybeSingle();

    if (!faculty) return basePrompt;

    const { data: assignments } = await supabase
      .from('faculty_subject_assignments')
      .select('division, subject:subjects(name, code, semester)')
      .eq('faculty_id', (faculty as any).id);

    const assignSummary = (assignments ?? [])
      .map((a: any) => `  • ${a.subject?.name} (${a.subject?.code}) — Div ${a.division}, Sem ${a.subject?.semester}`)
      .join('\n') || '  No subjects assigned.';

    const { data: sessions } = await supabase
      .from('sessions')
      .select('status, session_date, subject:subjects(name)')
      .eq('faculty_id', (faculty as any).id)
      .order('session_date', { ascending: false })
      .limit(10);

    const sessionsSummary = (sessions ?? [])
      .map((s: any) => `  • ${s.session_date} — ${s.subject?.name}: ${s.status}`)
      .join('\n') || '  No recent sessions.';

    return `${basePrompt}

FACULTY CONTEXT:
- Department: ${(faculty.department as any)?.name}
- Designation: ${(faculty as any).designation ?? 'Faculty'}

ASSIGNED SUBJECTS (this year):
${assignSummary}

RECENT SESSIONS (last 10):
${sessionsSummary}

Help faculty create sessions, understand how to mark attendance, enter marks, and publish results. Answer questions about their timetable and class statistics.`;
  }

  if (role === 'parent') {
    const { data: child } = await supabase
      .from('students')
      .select('id, roll_number, division, year, course:courses(name), user:users!students_user_id_fkey(name)')
      .eq('parent_user_id', userId)
      .maybeSingle();

    if (!child) {
      return `${basePrompt}\n\nNo student is linked to this parent account yet.`;
    }

    const { data: attData } = await supabase
      .from('attendance_records')
      .select('status, session:sessions!inner(subject:subjects(name, code))')
      .eq('student_id', (child as any).id);

    const subjectAtt: Record<string, { present: number; total: number; name: string }> = {};
    for (const rec of attData ?? []) {
      const subj = (rec.session as any)?.subject;
      if (!subj) continue;
      if (!subjectAtt[subj.code]) subjectAtt[subj.code] = { present: 0, total: 0, name: subj.name };
      subjectAtt[subj.code].total++;
      if (rec.status === 'Present' || rec.status === 'Late') subjectAtt[subj.code].present++;
    }

    const attSummary = Object.entries(subjectAtt)
      .map(([code, s]) => `  • ${s.name} (${code}): ${s.total > 0 ? Math.round((s.present / s.total) * 100) : 0}%`)
      .join('\n') || '  No attendance records yet.';

    const { data: marks } = await supabase
      .from('marks')
      .select('total, grade, published, subject:subjects(name)')
      .eq('student_id', (child as any).id)
      .eq('published', true);

    const marksSummary = (marks ?? [])
      .map((m: any) => `  • ${m.subject?.name}: ${m.total}/60 (${m.grade ?? '—'})`)
      .join('\n') || '  No published marks yet.';

    return `${basePrompt}

WARD CONTEXT:
- Name: ${(child.user as any)?.name}
- Roll Number: ${(child as any).roll_number}
- Course: ${(child.course as any)?.name}
- Division: ${(child as any).division}, Year: ${(child as any).year}

ATTENDANCE:
${attSummary}

PUBLISHED MARKS:
${marksSummary}

Help parents understand their child's academic progress, attendance status, and what actions to take if attendance is low.`;
  }

  // Admin / HOD context
  const { data: stats } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('is_active', true);

  return `${basePrompt}

INSTITUTION CONTEXT:
- Active students: ${stats?.length ?? 'unknown'}
You have admin-level access. Help with managing students, faculty, departments, courses, grading schemes, and reviewing reports.`;
}

// ---------------------------------------------------------------------------
// POST /api/ai/chat
// Uses Groq (free tier) — OpenAI-compatible API.
// Get a free key at https://console.groq.com
// ---------------------------------------------------------------------------
aiRouter.post(
  '/chat',
  asyncHandler(async (req, res) => {
    const apiKey = env.GROQ_API_KEY;

    if (!apiKey) {
      throw ApiError.badRequest(
        'AI Assistant is not configured. Add GROQ_API_KEY to the backend .env file. ' +
        'Get a free key at https://console.groq.com'
      );
    }

    const { message, history } = chatSchema.parse(req.body);
    const role   = req.user!.role;
    const userId = req.user!.sub;

    const systemPrompt = await buildSystemPrompt(userId, role);

    const messages = [
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',   // free, fast (~500 tokens/s)
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      console.error('Groq API error:', response.status, errText);
      throw ApiError.internal('AI service request failed. Please try again.');
    }

    const data = await response.json() as any;
    const reply = data.choices?.[0]?.message?.content?.trim()
      ?? "I'm sorry, I couldn't generate a response. Please try again.";

    res.json({ reply, role });
  })
);
