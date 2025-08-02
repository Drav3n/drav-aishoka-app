"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const database_1 = require("../utils/database");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let userResult = await (0, database_1.query)('SELECT * FROM users WHERE provider = $1 AND provider_id = $2', ['google', profile.id]);
            let user;
            if (userResult.rows.length === 0) {
                const newUserResult = await (0, database_1.query)(`INSERT INTO users (email, name, avatar_url, provider, provider_id) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
                    profile.emails?.[0]?.value || '',
                    profile.displayName || '',
                    profile.photos?.[0]?.value || '',
                    'google',
                    profile.id
                ]);
                user = newUserResult.rows[0];
            }
            else {
                user = userResult.rows[0];
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport_1.default.use(new passport_github2_1.Strategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let userResult = await (0, database_1.query)('SELECT * FROM users WHERE provider = $1 AND provider_id = $2', ['github', profile.id]);
            let user;
            if (userResult.rows.length === 0) {
                const newUserResult = await (0, database_1.query)(`INSERT INTO users (email, name, avatar_url, provider, provider_id) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`, [
                    profile.emails?.[0]?.value || '',
                    profile.displayName || profile.username || '',
                    profile.photos?.[0]?.value || '',
                    'github',
                    profile.id
                ]);
                user = newUserResult.rows[0];
            }
            else {
                user = userResult.rows[0];
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
}
router.use(passport_1.default.initialize());
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const token = (0, auth_1.generateToken)(req.user.id, req.user.email);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
}));
router.get('/github', passport_1.default.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport_1.default.authenticate('github', { session: false }), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const token = (0, auth_1.generateToken)(req.user.id, req.user.email);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
}));
router.post('/dev-login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (process.env.DEV_MODE !== 'true') {
        res.status(403).json({
            success: false,
            error: 'Dev mode not enabled'
        });
        return;
    }
    let userResult = await (0, database_1.query)('SELECT * FROM users WHERE provider = $1 AND email = $2', ['dev', 'dev@localhost']);
    let user;
    if (userResult.rows.length === 0) {
        const newUserResult = await (0, database_1.query)(`INSERT INTO users (email, name, provider, provider_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`, ['dev@localhost', 'Dev User', 'dev', 'dev-user-id']);
        user = newUserResult.rows[0];
    }
    else {
        user = userResult.rows[0];
    }
    const token = (0, auth_1.generateToken)(user.id, user.email);
    res.json({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.avatar_url
            }
        }
    });
}));
router.get('/me', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            avatar_url: req.user.avatar_url
        }
    });
}));
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map