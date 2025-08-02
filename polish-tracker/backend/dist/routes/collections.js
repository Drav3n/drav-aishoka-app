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
const collectionSchema = joi_1.default.object({
    name: joi_1.default.string().required().max(255),
    description: joi_1.default.string().max(1000).optional(),
    color: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional()
});
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const collectionsResult = await (0, database_1.query)(`
    SELECT 
      c.*,
      COUNT(cp.polish_id) as polish_count
    FROM custom_collections c
    LEFT JOIN collection_polishes cp ON c.id = cp.collection_id
    WHERE c.user_id = $1
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `, [req.user.id]);
    res.json({
        success: true,
        data: collectionsResult.rows
    });
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const collectionResult = await (0, database_1.query)(`
    SELECT * FROM custom_collections 
    WHERE id = $1 AND user_id = $2
  `, [req.params.id, req.user.id]);
    if (collectionResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Collection not found', 404);
    }
    const polishesResult = await (0, database_1.query)(`
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
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = collectionSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.createError)(error.details[0].message, 400);
    }
    const result = await (0, database_1.query)(`
    INSERT INTO custom_collections (user_id, name, description, color)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [req.user.id, value.name, value.description || null, value.color || null]);
    res.status(201).json({
        success: true,
        data: result.rows[0]
    });
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = collectionSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.createError)(error.details[0].message, 400);
    }
    const result = await (0, database_1.query)(`
    UPDATE custom_collections 
    SET name = $1, description = $2, color = $3
    WHERE id = $4 AND user_id = $5
    RETURNING *
  `, [value.name, value.description || null, value.color || null, req.params.id, req.user.id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Collection not found', 404);
    }
    res.json({
        success: true,
        data: result.rows[0]
    });
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, database_1.query)(`
    DELETE FROM custom_collections 
    WHERE id = $1 AND user_id = $2 
    RETURNING id
  `, [req.params.id, req.user.id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Collection not found', 404);
    }
    res.json({
        success: true,
        message: 'Collection deleted successfully'
    });
}));
router.post('/:id/polishes', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { polish_id } = req.body;
    if (!polish_id) {
        throw (0, errorHandler_1.createError)('Polish ID is required', 400);
    }
    const collectionResult = await (0, database_1.query)('SELECT id FROM custom_collections WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (collectionResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Collection not found', 404);
    }
    const polishResult = await (0, database_1.query)('SELECT id FROM polishes WHERE id = $1 AND user_id = $2', [polish_id, req.user.id]);
    if (polishResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Polish not found', 404);
    }
    await (0, database_1.query)(`
    INSERT INTO collection_polishes (collection_id, polish_id)
    VALUES ($1, $2)
    ON CONFLICT (collection_id, polish_id) DO NOTHING
  `, [req.params.id, polish_id]);
    res.json({
        success: true,
        message: 'Polish added to collection'
    });
}));
router.delete('/:id/polishes/:polishId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const collectionResult = await (0, database_1.query)('SELECT id FROM custom_collections WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (collectionResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Collection not found', 404);
    }
    const result = await (0, database_1.query)(`
    DELETE FROM collection_polishes 
    WHERE collection_id = $1 AND polish_id = $2
    RETURNING collection_id
  `, [req.params.id, req.params.polishId]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Polish not found in collection', 404);
    }
    res.json({
        success: true,
        message: 'Polish removed from collection'
    });
}));
exports.default = router;
//# sourceMappingURL=collections.js.map