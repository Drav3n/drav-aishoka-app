"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error('❌ Error:', err);
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
    }
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map((val) => val.message).join(', ');
        statusCode = 400;
    }
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }
    if (err.name === 'error' && err.code) {
        switch (err.code) {
            case '23505':
                message = 'Duplicate entry';
                statusCode = 400;
                break;
            case '23503':
                message = 'Referenced resource not found';
                statusCode = 400;
                break;
            case '23502':
                message = 'Required field missing';
                statusCode = 400;
                break;
            default:
                message = 'Database error';
                statusCode = 500;
        }
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map