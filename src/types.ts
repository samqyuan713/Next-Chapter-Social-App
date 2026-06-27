/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  chapterTheme: string;
  occupation: string;
  relationshipGoal: string;
  values: string[];
  avatarColor: string; // Tailwind gradient or color values
  avatarEmoji: string;
  quizAnswers?: Record<string, string>;
  quizScoreMatch?: number;
  height?: number; // Height in inches (e.g. 71 for 5'11")
  weight?: number; // Weight in lbs (e.g. 175)
  gender?: string; // e.g. "Male" or "Female"
}

export interface Message {
  id: string;
  senderId: 'user' | string; // 'user' or match profile ID
  text: string;
  timestamp: string; // ISO String
}

export interface Conversation {
  matchId: string;
  messages: Message[];
  lastUpdated: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  category: string;
  options: {
    label: string;
    text: string;
    value: string;
  }[];
}

export interface CompatibilityAnalysis {
  matchScore: number;
  summary: string;
  sharedStrengths: string[];
  potentialGrowthAreas: string[];
  recommendedDates: string[];
}
