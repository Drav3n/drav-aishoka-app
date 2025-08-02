import express from 'express';
import Joi from 'joi';
import { query, withTransaction } from '../utils/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const router = express.Router();

// Validation schemas
const collectionSchema = Joi.object({
  name: Joi.string().required().max(255),
  description: Joi.string().max(1000).optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional()
});

// GET /api/collections - Get user's custom collections
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const collectionsResult = await query(`
    SELECT 
      c.*,
      COUNT(cp.polish_id) as polish_count
    FROM custom_collections c
    LEFT JOIN collection_polishes cp ON c.id = cp.collection_id
    WHERE c.user_id = $1
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `, [req.user!.id]);

  res.json({
    success: true,
    data: collectionsResult.rows
  });
}));

// GET /api/collections/:id - Get specific collection with polishes
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const collectionResult = await query(`
    SELECT * FROM custom_collections 
    WHERE id = $1 AND user_id = $2
  `, [req.params.id, req.user!.id]);

  if (collectionResult.rows.length === 0) {
    throw createError('Collection not found', 404);
  }

  const polishesResult = await query(`
    SELECT 
      p.*,
      b.name as brand_name,
      cp.added_at
    FROM collection_polishes cp
    JOIN polishes p ON cp.polish_id = p.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE cp.collection_id = $1
    ORDER BY cp.added_at DESC
  `, [req.params.id]);

  const collection = collectionResult.rows[0];
  collection.polishes = polishesResult.rows;

  res.json({
    success: true,
    data: collection
  });
}));

// POST /api/collections - Create new collection
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = collectionSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const result = await query(`
    INSERT INTO custom_collections (user_id, name, description, color)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [req.user!.id, value.name, value.description || null, value.color || null]);

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

// PUT /api/collections/:id - Update collection
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = collectionSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const result = await query(`
    UPDATE custom_collections 
    SET name = $1, description = $2, color = $3
    WHERE id = $4 AND user_id = $5
    RETURNING *
  `, [value.name, value.description || null, value.color || null, req.params.id, req.user!.id]);

  if (result.rows.length === 0) {
    throw createError('Collection not found', 404);
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
}));

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const result = await query(`
    DELETE FROM custom_collections 
    WHERE id = $1 AND user_id = $2 
    RETURNING id
  `, [req.params.id, req.user!.id]);

  if (result.rows.length === 0) {
    throw createError('Collection not found', 404);
  }

  res.json({
    success: true,
    message: 'Collection deleted successfully'
  });
}));

// POST /api/collections/:id/polishes - Add polish to collection
router.post('/:id/polishes', asyncHandler(async (req: AuthRequest, res) => {
  const { polish_id } = req.body;

  if (!polish_id) {
    throw createError('Polish ID is required', 400);
  }

  // Verify collection belongs to user
  const collectionResult = await query(
    'SELECT id FROM custom_collections WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );

  if (collectionResult.rows.length === 0) {
    throw createError('Collection not found', 404);
  }

  // Verify polish belongs to user
  const polishResult = await query(
    'SELECT id FROM polishes WHERE id = $1 AND user_id = $2',
    [polish_id, req.user!.id]
  );

  if (polishResult.rows.length === 0) {
    throw createError('Polish not found', 404);
  }

  // Add polish to collection (ignore if already exists)
  await query(`
    INSERT INTO collection_polishes (collection_id, polish_id)
    VALUES ($1, $2)
    ON CONFLICT (collection_id, polish_id) DO NOTHING
  `, [req.params.id, polish_id]);

  res.json({
    success: true,
    message: 'Polish added to collection'
  });
}));

// DELETE /api/collections/:id/polishes/:polishId - Remove polish from collection
router.delete('/:id/polishes/:polishId', asyncHandler(async (req: AuthRequest, res) => {
  // Verify collection belongs to user
  const collectionResult = await query(
    'SELECT id FROM custom_collections WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );

  if (collectionResult.rows.length === 0) {
    throw createError('Collection not found', 404);
  }

  const result = await query(`
    DELETE FROM collection_polishes 
    WHERE collection_id = $1 AND polish_id = $2
    RETURNING collection_id
  `, [req.params.id, req.params.polishId]);

  if (result.rows.length === 0) {
    throw createError('Polish not found in collection', 404);
  }

  res.json({
    success: true,
    message: 'Polish removed from collection'
  });
}));

export default router;