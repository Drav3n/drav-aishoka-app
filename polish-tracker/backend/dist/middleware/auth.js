"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.optionalAuth = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../utils/database");
const errorHandler_1 = require("./errorHandler");
const authMiddleware = async (req, res, next) => {
    try {
        if (process.env.DEV_MODE === 'true') {
            const devUserResult = await (0, database_1.query)('SELECT * FROM users WHERE provider = $1 AND email = $2', ['dev', 'dev@localhost']);
            let devUser;
            if (devUserResult.rows.length === 0) {
                const newDevUser = await (0, database_1.query)(`INSERT INTO users (email, name, provider, provider_id) 
           VALUES ($1, $2, $3, $4) RETURNING *`, ['dev@localhost', 'Dev User', 'dev', 'dev-user-id']);
                devUser = newDevUser.rows[0];
            }
            else {
                devUser = devUserResult.rows[0];
            }
            req.user = devUser;
            return next();
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw (0, errorHandler_1.createError)('No token provided', 401);
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userResult = await (0, database_1.query)('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        if (userResult.rows.length === 0) {
            throw (0, errorHandler_1.createError)('User not found', 401);
        }
        req.user = userResult.rows[0];
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next((0, errorHandler_1.createError)('Invalid token', 401));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next((0, errorHandler_1.createError)('Token expired', 401));
        }
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userResult = await (0, database_1.query)('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        if (userResult.rows.length > 0) {
            req.user = userResult.rows[0];
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const generateToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map