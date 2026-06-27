import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Define the 'users' table (logged-in user profiles)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  age: integer('age'),
  location: text('location'),
  occupation: text('occupation'),
  relationshipGoal: text('relationship_goal'),
  chapterTheme: text('chapter_theme'),
  interests: jsonb('interests').default([]), // Array of interests
  values: jsonb('values').default([]), // Array of values
  bio: text('bio'),
  height: integer('height'),
  weight: integer('weight'),
  gender: text('gender'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'companions' table (available dating partners/matches)
export const companions = pgTable('companions', {
  id: text('id').primaryKey(), // arthur, evelyn, takashi, etc.
  name: text('name').notNull(),
  age: integer('age').notNull(),
  location: text('location').notNull(),
  occupation: text('occupation').notNull(),
  relationshipGoal: text('relationship_goal').notNull(),
  chapterTheme: text('chapter_theme').notNull(),
  interests: jsonb('interests').notNull().default([]),
  values: jsonb('values').notNull().default([]),
  bio: text('bio').notNull(),
  avatarEmoji: text('avatar_emoji').notNull(),
  avatarColor: text('avatar_color').notNull(),
  height: integer('height'),
  weight: integer('weight'),
  gender: text('gender'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'messages' table (conversations)
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  matchId: text('match_id').notNull(), // companion's text id (e.g., 'arthur')
  senderId: text('sender_id').notNull(), // 'user' or the companion's text id
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'compatibility' table (saved quiz results)
export const compatibility = pgTable('compatibility', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  matchId: text('match_id').notNull(),
  matchScore: integer('match_score').notNull(),
  summary: text('summary').notNull(),
  sharedStrengths: jsonb('shared_strengths').notNull().default([]),
  potentialGrowthAreas: jsonb('potential_growth_areas').notNull().default([]),
  recommendedDates: jsonb('recommended_dates').notNull().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  compatibilities: many(compatibility),
}));

export const companionsRelations = relations(companions, ({ many }) => ({
  messages: many(messages),
  compatibilities: many(compatibility),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const compatibilityRelations = relations(compatibility, ({ one }) => ({
  user: one(users, {
    fields: [compatibility.userId],
    references: [users.id],
  }),
}));
