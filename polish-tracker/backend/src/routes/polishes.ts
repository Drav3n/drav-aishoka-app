import express from 'express';
import Joi from 'joi';
import { query, withTransaction } from '../utils/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, Polish, PolishFilters, PaginatedResponse } from '../types';

const router = express.Router();

// Validation schemas
const polishSchema = Joi.object({
  name: Joi.string().required().max(255),
  brand_id: Joi.string().uuid().optional(),
  color_hex: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  finish_type: Joi.string().valid('cream', 'shimmer', 'glitter', 'matte', 'magnetic', 'thermal').required(),
  collection_name: Joi.string().max(255).optional(),
  purchase_date: Joi.date().optional(),
  purchase_price: Joi.number().min(0).max(999.99).optional(),
  purchase_location: Joi.string().max(255).optional(),
  notes: Joi.string().max(1000).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  is_favorite: Joi.boolean().default(false),
  custom_tags: Joi.array().items(Joi.string().max(50)).default([])
});

const updatePolishSchema = polishSchema.fork(
  ['name', 'finish_type'], 
  (schema) => schema.optional()
);

// GET /api/polishes - Get user's polish collection with filtering
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const {
    brand_id,
    finish_type,
    color_family,
    price_min,
    price_max,
    is_favorite,
    has_rating,
    rating_min,
    custom_tags,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    limit = 20,
    offset = 0
  } = req.query as any;

  let whereConditions = ['p.user_id = $1'];
  let queryParams: any[] = [req.user!.id];
  let paramIndex = 2;

  // Build WHERE conditions
  if (brand_id) {
    whereConditions.push(`p.brand_id = $${paramIndex}`);
    queryParams.push(brand_id);
    paramIndex++;
  }

  if (finish_type) {
    whereConditions.push(`p.finish_type = $${paramIndex}`);
    queryParams.push(finish_type);
    paramIndex++;
  }

  if (price_min) {
    whereConditions.push(`p.purchase_price >= $${paramIndex}`);
    queryParams.push(parseFloat(price_min));
    paramIndex++;
  }

  if (price_max) {
    whereConditions.push(`p.purchase_price <= $${paramIndex}`);
    queryParams.push(parseFloat(price_max));
    paramIndex++;
  }

  if (is_favorite === 'true') {
    whereConditions.push('p.is_favorite = true');
  }

  if (has_rating === 'true') {
    whereConditions.push('p.rating IS NOT NULL');
  }

  if (rating_min) {
    whereConditions.push(`p.rating >= $${paramIndex}`);
    queryParams.push(parseInt(rating_min));
    paramIndex++;
  }

  if (custom_tags) {
    const tags = Array.isArray(custom_tags) ? custom_tags : [custom_tags];
    whereConditions.push(`p.custom_tags ?| $${paramIndex}`);
    queryParams.push(tags);
    paramIndex++;
  }

  if (search) {
    whereConditions.push(`(
      to_tsvector('english', p.name || ' ' || COALESCE(p.collection_name, '') || ' ' || COALESCE(p.notes, '')) 
      @@ plainto_tsquery('english', $${paramIndex})
      OR b.name ILIKE $${paramIndex + 1}
    )`);
    queryParams.push(search, `%${search}%`);
    paramIndex += 2;
  }

  // Build ORDER BY clause
  const validSortFields = ['name', 'brand', 'purchase_date', 'created_at', 'last_used'];
  const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
  const sortDirection = sort_order === 'asc' ? 'ASC' : 'DESC';

  let orderBy = '';
  switch (sortField) {
    case 'brand':
      orderBy = `b.name ${sortDirection}`;
      break;
    case 'last_used':
      orderBy = `last_usage.used_at ${sortDirection} NULLS LAST`;
      break;
    default:
      orderBy = `p.${sortField} ${sortDirection}`;
  }

  // Main query with joins
  const polishesQuery = `
    SELECT 
      p.*,
      b.name as brand_name,
      b.website_url as brand_website,
      b.logo_url as brand_logo,
      last_usage.used_at as last_used_at,
      usage_count.count as usage_count
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN (
      SELECT polish_id, MAX(used_at) as used_at
      FROM polish_usage
      GROUP BY polish_id
    ) last_usage ON p.id = last_usage.polish_id
    LEFT JOIN (
      SELECT polish_id, COUNT(*) as count
      FROM polish_usage
      GROUP BY polish_id
    ) usage_count ON p.id = usage_count.polish_id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  queryParams.push(parseInt(limit as string), parseInt(offset as string));

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(*)
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE ${whereConditions.join(' AND ')}
  `;

  const [polishesResult, countResult] = await Promise.all([
    query(polishesQuery, queryParams),
    query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
  ]);

  const total = parseInt(countResult.rows[0].count);
  const pages = Math.ceil(total / parseInt(limit as string));

  const response: PaginatedResponse<Polish> = {
    success: true,
    data: polishesResult.rows,
    pagination: {
      total,
      page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
      limit: parseInt(limit as string),
      pages
    }
  };

  res.json(response);
}));

// GET /api/polishes/:id - Get specific polish
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const polishResult = await query(`
    SELECT 
      p.*,
      b.name as brand_name,
      b.website_url as brand_website,
      b.logo_url as brand_logo
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.id = $1 AND p.user_id = $2
  `, [req.params.id, req.user!.id]);

  if (polishResult.rows.length === 0) {
    throw createError('Polish not found', 404);
  }

  res.json({
    success: true,
    data: polishResult.rows[0]
  });
}));

// POST /api/polishes - Create new polish
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = polishSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const polishData = {
    ...value,
    user_id: req.user!.id,
    custom_tags: JSON.stringify(value.custom_tags || [])
  };

  const result = await query(`
    INSERT INTO polishes (
      user_id, brand_id, name, color_hex, finish_type, collection_name,
      purchase_date, purchase_price, purchase_location, notes, rating,
      is_favorite, custom_tags
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
    polishData.user_id,
    polishData.brand_id || null,
    polishData.name,
    polishData.color_hex || null,
    polishData.finish_type,
    polishData.collection_name || null,
    polishData.purchase_date || null,
    polishData.purchase_price || null,
    polishData.purchase_location || null,
    polishData.notes || null,
    polishData.rating || null,
    polishData.is_favorite,
    polishData.custom_tags
  ]);

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// PUT /api/polishes/:id - Update polish
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = updatePolishSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  // Check if polish exists and belongs to user
  const existingPolish = await query(
    'SELECT id FROM polishes WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );

  if (existingPolish.rows.length === 0) {
    throw createError('Polish not found', 404);
  }

  // Build update query dynamically
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  Object.entries(value).forEach(([key, val]) => {
    if (val !== undefined) {
      if (key === 'custom_tags') {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(JSON.stringify(val));
      } else {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(val);
      }
      paramIndex++;
    }
  });

  if (updateFields.length === 0) {
    throw createError('No fields to update', 400);
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  updateValues.push(req.params.id, req.user!.id);

  const updateQuery = `
    UPDATE polishes 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;

  const result = await query(updateQuery, updateValues);

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// DELETE /api/polishes/:id - Delete polish
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const result = await query(
    'DELETE FROM polishes WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user!.id]
  );

  if (result.rows.length === 0) {
    throw createError('Polish not found', 404);
  }

  res.json({
    success: true,
    message: 'Polish deleted successfully'
  });
}));

// POST /api/polishes/:id/usage - Record polish usage
router.post('/:id/usage', asyncHandler(async (req: AuthRequest, res) => {
  const { occasion, notes } = req.body;

  // Check if polish exists and belongs to user
  const polishResult = await query(
    'SELECT id FROM polishes WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );

  if (polishResult.rows.length === 0) {
    throw createError('Polish not found', 404);
  }

  const usageResult = await query(`
    INSERT INTO polish_usage (polish_id, user_id, occasion, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [req.params.id, req.user!.id, occasion || null, notes || null]);

  res.status(201).json({
    success: true,
    data: usageResult.rows[0]
  });
}));

export default router;