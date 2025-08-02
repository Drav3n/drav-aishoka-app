import express from 'express';
import { query } from '../utils/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const router = express.Router();

// GET /api/brands - Get all brands
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const brandsResult = await query(`
    SELECT 
      b.*,
      COUNT(p.id) as polish_count
    FROM brands b
    LEFT JOIN polishes p ON b.id = p.brand_id AND p.user_id = $1
    GROUP BY b.id
    ORDER BY b.name ASC
  `, [req.user!.id]);

  res.json({
    success: true,
    data: brandsResult.rows
  });
}));

// GET /api/brands/:id - Get specific brand
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const brandResult = await query(`
    SELECT 
      b.*,
      COUNT(p.id) as polish_count
    FROM brands b
    LEFT JOIN polishes p ON b.id = p.brand_id AND p.user_id = $2
    WHERE b.id = $1
    GROUP BY b.id
  `, [req.params.id, req.user!.id]);

  if (brandResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Brand not found'
    });
  }

  res.json({
    success: true,
    data: brandResult.rows[0]
  });
}));

export default router;