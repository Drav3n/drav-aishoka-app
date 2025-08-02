import express, { Response } from 'express';
import { query } from '../utils/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, AnalyticsData } from '../types';

const router = express.Router();

// GET /api/analytics - Get comprehensive analytics for user's collection
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Get basic collection stats
  const basicStatsResult = await query(`
    SELECT 
      COUNT(*) as total_polishes,
      COALESCE(SUM(purchase_price), 0) as total_value,
      COALESCE(AVG(purchase_price), 0) as average_price
    FROM polishes 
    WHERE user_id = $1
  `, [userId]);

  // Get brand distribution
  const brandDistributionResult = await query(`
    SELECT 
      COALESCE(b.name, 'Unknown') as brand,
      COUNT(p.id) as count,
      COALESCE(SUM(p.purchase_price), 0) as value
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.user_id = $1
    GROUP BY b.name
    ORDER BY count DESC
    LIMIT 10
  `, [userId]);

  // Get finish type distribution
  const finishDistributionResult = await query(`
    SELECT 
      finish_type,
      COUNT(*) as count
    FROM polishes 
    WHERE user_id = $1
    GROUP BY finish_type
    ORDER BY count DESC
  `, [userId]);

  // Get color distribution (simplified - by hex color families)
  const colorDistributionResult = await query(`
    SELECT 
      CASE 
        WHEN color_hex LIKE '#FF%' OR color_hex LIKE '#F%' THEN 'Red'
        WHEN color_hex LIKE '#00FF%' OR color_hex LIKE '#0F%' THEN 'Green'
        WHEN color_hex LIKE '#0000FF%' OR color_hex LIKE '#00%' THEN 'Blue'
        WHEN color_hex LIKE '#FFFF%' OR color_hex LIKE '#FF%' THEN 'Yellow'
        WHEN color_hex LIKE '#FF00FF%' OR color_hex LIKE '#F0F%' THEN 'Purple'
        WHEN color_hex LIKE '#FFA500%' OR color_hex LIKE '#FF%' THEN 'Orange'
        WHEN color_hex LIKE '#000000%' OR color_hex LIKE '#0%' THEN 'Black'
        WHEN color_hex LIKE '#FFFFFF%' OR color_hex LIKE '#F%' THEN 'White'
        ELSE 'Other'
      END as color_family,
      COUNT(*) as count
    FROM polishes 
    WHERE user_id = $1 AND color_hex IS NOT NULL
    GROUP BY color_family
    ORDER BY count DESC
  `, [userId]);

  // Get most used polishes
  const mostUsedResult = await query(`
    SELECT 
      p.*,
      b.name as brand_name,
      COUNT(pu.id) as usage_count,
      MAX(pu.used_at) as last_used
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN polish_usage pu ON p.id = pu.polish_id
    WHERE p.user_id = $1
    GROUP BY p.id, b.name
    HAVING COUNT(pu.id) > 0
    ORDER BY usage_count DESC, last_used DESC
    LIMIT 5
  `, [userId]);

  // Get least used polishes (never used or used least)
  const leastUsedResult = await query(`
    SELECT 
      p.*,
      b.name as brand_name,
      COALESCE(COUNT(pu.id), 0) as usage_count,
      MAX(pu.used_at) as last_used
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN polish_usage pu ON p.id = pu.polish_id
    WHERE p.user_id = $1
    GROUP BY p.id, b.name
    ORDER BY usage_count ASC, p.created_at ASC
    LIMIT 5
  `, [userId]);

  // Get never used polishes
  const neverUsedResult = await query(`
    SELECT 
      p.*,
      b.name as brand_name
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN polish_usage pu ON p.id = pu.polish_id
    WHERE p.user_id = $1 AND pu.id IS NULL
    ORDER BY p.created_at ASC
    LIMIT 10
  `, [userId]);

  // Get usage by month (last 12 months)
  const usageByMonthResult = await query(`
    SELECT 
      TO_CHAR(used_at, 'YYYY-MM') as month,
      COUNT(*) as count
    FROM polish_usage 
    WHERE user_id = $1 
      AND used_at >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY TO_CHAR(used_at, 'YYYY-MM')
    ORDER BY month DESC
  `, [userId]);

  // Get collection growth by month
  const collectionGrowthResult = await query(`
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM') as month,
      COUNT(*) as count
    FROM polishes 
    WHERE user_id = $1
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month DESC
    LIMIT 12
  `, [userId]);

  const analytics: AnalyticsData = {
    total_polishes: parseInt(basicStatsResult.rows[0].total_polishes),
    total_value: parseFloat(basicStatsResult.rows[0].total_value),
    average_price: parseFloat(basicStatsResult.rows[0].average_price),
    brand_distribution: brandDistributionResult.rows.map(row => ({
      brand: row.brand,
      count: parseInt(row.count),
      value: parseFloat(row.value)
    })),
    finish_type_distribution: finishDistributionResult.rows.map(row => ({
      finish_type: row.finish_type,
      count: parseInt(row.count)
    })),
    color_distribution: colorDistributionResult.rows.map(row => ({
      color_family: row.color_family,
      count: parseInt(row.count)
    })),
    usage_stats: {
      most_used: mostUsedResult.rows,
      least_used: leastUsedResult.rows,
      never_used: neverUsedResult.rows,
      usage_by_month: usageByMonthResult.rows.map(row => ({
        month: row.month,
        count: parseInt(row.count)
      }))
    },
    collection_growth: collectionGrowthResult.rows.map(row => ({
      month: row.month,
      count: parseInt(row.count)
    }))
  };

  res.json({
    success: true,
    data: analytics
  });
}));

// GET /api/analytics/summary - Get quick summary stats
router.get('/summary', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const summaryResult = await query(`
    SELECT 
      COUNT(*) as total_polishes,
      COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorites_count,
      COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as rated_count,
      COALESCE(SUM(purchase_price), 0) as total_value,
      COUNT(DISTINCT brand_id) as unique_brands
    FROM polishes 
    WHERE user_id = $1
  `, [userId]);

  const recentUsageResult = await query(`
    SELECT COUNT(*) as recent_usage_count
    FROM polish_usage 
    WHERE user_id = $1 
      AND used_at >= CURRENT_DATE - INTERVAL '30 days'
  `, [userId]);

  const summary = {
    ...summaryResult.rows[0],
    recent_usage_count: parseInt(recentUsageResult.rows[0].recent_usage_count),
    total_polishes: parseInt(summaryResult.rows[0].total_polishes),
    favorites_count: parseInt(summaryResult.rows[0].favorites_count),
    rated_count: parseInt(summaryResult.rows[0].rated_count),
    total_value: parseFloat(summaryResult.rows[0].total_value),
    unique_brands: parseInt(summaryResult.rows[0].unique_brands)
  };

  res.json({
    success: true,
    data: summary
  });
}));

export default router;