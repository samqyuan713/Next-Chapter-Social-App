import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: any; // Decoded Firebase ID Token
  userDb?: typeof users.$inferSelect; // Synced database user object
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    // 1. Verify token (with support for sandbox guest bypass tokens)
    let decodedToken: any;
    if (token.startsWith('sandbox-token-')) {
      const email = token.substring('sandbox-token-'.length) || 'guest-tester@example.com';
      const uid = 'sandbox-uid-' + email.replace(/[^a-zA-Z0-9]/g, '-');
      decodedToken = {
        uid,
        email,
        name: 'Guest Tester',
      };
    } else {
      decodedToken = await adminAuth.verifyIdToken(token);
    }
    req.user = decodedToken;

    // 2. Synchronize user record in PostgreSQL (upsert)
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';

    // Wrap query in robust error handling as mandated
    try {
      const existingUsers = await db.select().from(users).where(eq(users.uid, uid));
      let userRecord: typeof users.$inferSelect;

      if (existingUsers.length === 0) {
        // Insert new user record
        const insertResult = await db.insert(users)
          .values({
            uid,
            email,
            name: decodedToken.name || email.split('@')[0],
            interests: [],
            values: [],
          })
          .returning();
        userRecord = insertResult[0];
      } else {
        userRecord = existingUsers[0];
      }

      req.userDb = userRecord;
      next();
    } catch (dbErr) {
      console.error('Database user synchronization failed:', dbErr);
      return res.status(500).json({ error: 'Database synchronization failed. Please try again later.' });
    }
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
