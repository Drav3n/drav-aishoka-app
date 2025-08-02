"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const database_1 = require("../utils/database");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const polishSchema = joi_1.default.object({
    name: joi_1.default.string().required().max(255),
    brand_id: joi_1.default.string().uuid().optional(),
    color_hex: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    finish_type: joi_1.default.string().valid('cream', 'shimmer', 'glitter', 'matte', 'magnetic', 'thermal').required(),
    collection_name: joi_1.default.string().max(255).optional(),
    purchase_date: joi_1.default.date().optional(),
    purchase_price: joi_1.default.number().min(0).max(999.99).optional(),
    purchase_location: joi_1.default.string().max(255).optional(),
    notes: joi_1.default.string().max(1000).optional(),
    rating: joi_1.default.number().integer().min(1).max(5).optional(),
    is_favorite: joi_1.default.boolean().default(false),
    custom_tags: joi_1.default.array().items(joi_1.default.string().max(50)).default([])
});
const updatePolishSchema = polishSchema.fork(['name', 'finish_type'], (schema) => schema.optional());
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { brand_id, finish_type, color_family, price_min, price_max, is_favorite, has_rating, rating_min, custom_tags, search, sort_by = 'created_at', sort_order = 'desc', limit = 20, offset = 0 } = req.query;
    let whereConditions = ['p.user_id = $1'];
    let queryParams = [req.user.id];
    let paramIndex = 2;
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
    queryParams.push(parseInt(limit), parseInt(offset));
    const countQuery = `
    SELECT COUNT(*)
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE ${whereConditions.join(' AND ')}
  `;
    const [polishesResult, countResult] = await Promise.all([
        (0, database_1.query)(polishesQuery, queryParams),
        (0, database_1.query)(countQuery, queryParams.slice(0, -2))
    ]);
    const total = parseInt(countResult.rows[0].count);
    const pages = Math.ceil(total / parseInt(limit));
    const response = {
        success: true,
        data: polishesResult.rows,
        pagination: {
            total,
            page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
            limit: parseInt(limit),
            pages
        }
    };
    res.json(response);
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const polishResult = await (0, database_1.query)(`
    SELECT 
      p.*,
      b.name as brand_name,
      b.website_url as brand_website,
      b.logo_url as brand_logo
    FROM polishes p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.id = $1 AND p.user_id = $2
  `, [req.params.id, req.user.id]);
    if (polishResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Polish not found', 404);
    }
    res.json({
        success: true,
        data: polishResult.rows[0]
    });
}));
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = polishSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.createError)(error.details[0].message, 400);
    }
    const polishData = {
        ...value,
        user_id: req.user.id,
        custom_tags: JSON.stringify(value.custom_tags || [])
    };
    const result = await (0, database_1.query)(`
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
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = updatePolishSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.createError)(error.details[0].message, 400);
    }
    const existingPolish = await (0, database_1.query)('SELECT id FROM polishes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (existingPolish.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Polish not found', 404);
    }
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    Object.entries(value).forEach(([key, val]) => {
        if (val !== undefined) {
            if (key === 'custom_tags') {
                updateFields.push(`${key} = $${paramIndex}`);
                updateValues.push(JSON.stringify(val));
            }
            else {
                updateFields.push(`${key} = $${paramIndex}`);
                updateValues.push(val);
            }
            paramIndex++;
        }
    });
    if (updateFields.length === 0) {
        throw (0, errorHandler_1.createError)('No fields to update', 400);
    }
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(req.params.id, req.user.id);
    const updateQuery = `
    UPDATE polishes 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;
    const result = await (0, database_1.query)(updateQuery, updateValues);
    res.json({
        success: true,
        data: result.rows[0]
    });
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)('DELETE FROM polishes WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Polish not found', 404);
    }
    res.json({
        success: true,
        message: 'Polish deleted successfully'
    });
}));
router.post('/:id/usage', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { occasion, notes } = req.body;
    const polishResult = await (0, database_1.query)('SELECT id FROM polishes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (polishResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Polish not found', 404);
    }
    const usageResult = await (0, database_1.query)(`
    INSERT INTO polish_usage (polish_id, user_id, occasion, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [req.params.id, req.user.id, occasion || null, notes || null]);
    res.status(201).json({
        success: true,
        data: usageResult.rows[0]
    });
}));
exports.default = router;
//# sourceMappingURL=polishes.js.map