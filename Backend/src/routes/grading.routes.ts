import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/unwrap.js';
import { logAudit } from '../utils/audit.js';

export const gradingRouter = Router();

gradingRouter.use(requireAuth);

// GET /api/grading — list all schemes with their bands
gradingRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data: schemes, error: sErr } = await supabase
      .from('grading_schemes')
      .select('id, name, is_default, created_at')
      .order('created_at', { ascending: false });
    unwrap(sErr);

    const { data: bands, error: bErr } = await supabase
      .from('grading_bands')
      .select('id, scheme_id, grade, min_percentage, sort_order')
      .order('sort_order', { ascending: true });
    unwrap(bErr);

    const bandsByScheme = (bands ?? []).reduce<Record<string, typeof bands>>((acc, b) => {
      if (!acc[b!.scheme_id]) acc[b!.scheme_id] = [];
      acc[b!.scheme_id]!.push(b);
      return acc;
    }, {});

    const result = (schemes ?? []).map((s) => ({
      ...s,
      bands: bandsByScheme[s.id] ?? [],
    }));

    res.json({ schemes: result });
  })
);

// GET /api/grading/default — the active scheme + its bands
gradingRouter.get(
  '/default',
  asyncHandler(async (_req, res) => {
    const { data: scheme, error } = await supabase
      .from('grading_schemes')
      .select('id, name, is_default, created_at')
      .eq('is_default', true)
      .maybeSingle();
    unwrap(error);

    if (!scheme) {
      return res.json({ scheme: null, bands: [] });
    }

    const { data: bands, error: bErr } = await supabase
      .from('grading_bands')
      .select('id, grade, min_percentage, sort_order')
      .eq('scheme_id', scheme.id)
      .order('sort_order', { ascending: true });
    unwrap(bErr);

    res.json({ scheme, bands: bands ?? [] });
  })
);

const bandSchema = z.object({
  grade: z.string().min(1),
  minPercentage: z.number().min(0).max(100),
  sortOrder: z.number().int().default(0),
});

const schemeSchema = z.object({
  name: z.string().min(1),
  isDefault: z.boolean().default(false),
  bands: z.array(bandSchema).min(1, 'At least one grading band is required'),
});

// POST /api/grading — create a new scheme with all its bands atomically
gradingRouter.post(
  '/',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const body = schemeSchema.parse(req.body);

    // Clear default flag on all other schemes if this one is default
    if (body.isDefault) {
      const { error: clearErr } = await supabase
        .from('grading_schemes')
        .update({ is_default: false })
        .eq('is_default', true);
      unwrap(clearErr);
    }

    const { data: scheme, error: schemeErr } = await supabase
      .from('grading_schemes')
      .insert({ name: body.name, is_default: body.isDefault })
      .select()
      .single();
    unwrap(schemeErr);

    const bandRows = body.bands.map((b, i) => ({
      scheme_id: scheme!.id,
      grade: b.grade,
      min_percentage: b.minPercentage,
      sort_order: b.sortOrder ?? i,
    }));

    const { error: bandsErr } = await supabase.from('grading_bands').insert(bandRows);
    if (bandsErr) {
      // Rollback scheme
      await supabase.from('grading_schemes').delete().eq('id', scheme!.id);
      unwrap(bandsErr);
    }

    await logAudit(req, {
      action: 'CREATE_GRADING_SCHEME',
      module: 'Grading',
      details: { name: body.name, isDefault: body.isDefault, bandCount: body.bands.length },
    });

    const { data: full } = await supabase
      .from('grading_bands')
      .select('id, grade, min_percentage, sort_order')
      .eq('scheme_id', scheme!.id)
      .order('sort_order', { ascending: true });

    res.status(201).json({ scheme, bands: full ?? [] });
  })
);

// PATCH /api/grading/:id/set-default — make a scheme the active one
gradingRouter.patch(
  '/:id/set-default',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { error: clearErr } = await supabase
      .from('grading_schemes')
      .update({ is_default: false })
      .eq('is_default', true);
    unwrap(clearErr);

    const { data, error } = await supabase
      .from('grading_schemes')
      .update({ is_default: true })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();
    unwrap(error);

    if (!data) throw ApiError.notFound('Grading scheme not found.');

    await logAudit(req, { action: 'SET_DEFAULT_GRADING_SCHEME', module: 'Grading', details: { id: req.params.id } });

    res.json({ scheme: data });
  })
);

// DELETE /api/grading/:id
gradingRouter.delete(
  '/:id',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { data: scheme } = await supabase
      .from('grading_schemes')
      .select('is_default')
      .eq('id', req.params.id)
      .maybeSingle();

    if (scheme?.is_default) {
      throw ApiError.conflict('Cannot delete the active default grading scheme. Set another scheme as default first.');
    }

    const { error } = await supabase.from('grading_schemes').delete().eq('id', req.params.id);
    unwrap(error);

    await logAudit(req, { action: 'DELETE_GRADING_SCHEME', module: 'Grading', details: { id: req.params.id } });

    res.status(204).send();
  })
);
