/**
 * DB-compatible types for the chat system.
 * These match the external Supabase schema (snake_case).
 */

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface CategoryScores {
  findability: number;
  mobileUsability: number;
  offerClarity: number;
  trustProof: number;
  conversionReadiness: number;
}

export interface ProfileData {
  name: string;
  targetAudience: string;
  usp: string;
  ctas: string[];
  siteStructure: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface PageSpeedData {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  coreWebVitals: {
    lcp: number | null;
    cls: number | null;
    fcp: number | null;
    tbt: number | null;
    speedIndex: number | null;
  };
}

export interface WebsiteProfile {
  id: string;
  url: string;
  user_id: string;
  conversation_id: string;
  is_own_website: boolean;
  status: "pending" | "crawling" | "analyzing" | "completed" | "error";
  overall_score: number | null;
  category_scores: CategoryScores | null;
  profile_data: ProfileData | null;
  pagespeed_data: PageSpeedData | null;
  raw_markdown: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ImprovementTask {
  id: string;
  website_profile_id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  created_at: string;
}
