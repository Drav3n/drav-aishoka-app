"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.withTransaction = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
pool.on('connect', () => {
    console.log('📊 Connected to PostgreSQL database');
});
pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    process.exit(-1);
});
exports.default = pool;
const withTransaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.withTransaction = withTransaction;
const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Query executed:', { text, duration, rows: res.rowCount });
    }
    return res;
};
exports.query = query;
//# sourceMappingURL=database.js.map