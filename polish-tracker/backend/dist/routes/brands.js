"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../utils/database");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const brandsResult = await (0, database_1.query)(`
    SELECT 
      b.*,
      COUNT(p.id) as polish_count
    FROM brands b
    LEFT JOIN polishes p ON b.id = p.brand_id AND p.user_id = $1
    GROUP BY b.id
    ORDER BY b.name ASC
  `, [req.user.id]);
    res.json({
        success: true,
        data: brandsResult.rows
    });
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const brandResult = await (0, database_1.query)(`
    SELECT 
      b.*,
      COUNT(p.id) as polish_count
    FROM brands b
    LEFT JOIN polishes p ON b.id = p.brand_id AND p.user_id = $2
    WHERE b.id = $1
    GROUP BY b.id
  `, [req.params.id, req.user.id]);
    if (brandResult.rows.length === 0) {
        res.status(404).json({
            success: false,
            error: 'Brand not found'
        });
        return;
    }
    res.json({
        success: true,
        data: brandResult.rows[0]
    });
}));
exports.default = router;
//# sourceMappingURL=brands.js.map