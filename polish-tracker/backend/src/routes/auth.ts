import express, { Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { query } from '../utils/database';
import { generateToken, authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { User } from '../types';

const router = express.Router();

// Configure Google OAuth strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
      // Check if user exists
      let userResult = await query(
        'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
        ['google', profile.id]
      );

      let user: User;
      if (userResult.rows.length === 0) {
        // Create new user
        const newUserResult = await query(
          `INSERT INTO users (email, name, avatar_url, provider, provider_id) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [
            profile.emails?.[0]?.value || '',
            profile.displayName || '',
            profile.photos?.[0]?.value || '',
            'google',
            profile.id
          ]
        );
        user = newUserResult.rows[0];
      } else {
        user = userResult.rows[0];
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// Configure GitHub OAuth strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
      // Check if user exists
      let userResult = await query(
        'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
        ['github', profile.id]
      );

      let user: User;
      if (userResult.rows.length === 0) {
        // Create new user
        const newUserResult = await query(
          `INSERT INTO users (email, name, avatar_url, provider, provider_id) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [
            profile.emails?.[0]?.value || '',
            profile.displayName || profile.username || '',
            profile.photos?.[0]?.value || '',
            'github',
            profile.id
          ]
        );
        user = newUserResult.rows[0];
      } else {
        user = userResult.rows[0];
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// Initialize passport
router.use(passport.initialize());

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  asyncHandler(async (req: any, res: Response) => {
    const token = generateToken(req.user.id, req.user.email);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  })
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  asyncHandler(async (req: any, res: Response) => {
    const token = generateToken(req.user.id, req.user.email);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  })
);

// Dev mode login (for development only)
router.post('/dev-login', asyncHandler(async (req: any, res: Response) => {
  if (process.env.DEV_MODE !== 'true') {
    res.status(403).json({
      success: false,
      error: 'Dev mode not enabled'
    });
    return;
  }

  // Get or create dev user
  let userResult = await query(
    'SELECT * FROM users WHERE provider = $1 AND email = $2',
    ['dev', 'dev@localhost']
  );

  let user: User;
  if (userResult.rows.length === 0) {
    const newUserResult = await query(
      `INSERT INTO users (email, name, provider, provider_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      ['dev@localhost', 'Dev User', 'dev', 'dev-user-id']
    );
    user = newUserResult.rows[0];
  } else {
    user = userResult.rows[0];
  }

  const token = generateToken(user.id, user.email);

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

// Get current user
router.get('/me', authMiddleware as any, asyncHandler(async (req: any, res: Response) => {
  // Check if user exists (should be set by authMiddleware)
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
    return;
  }

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

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;