/*
  # Enhanced DSA Tracker Schema for Professional Revision Hub

  1. New Tables
    - Enhanced `user_profiles` with revision preferences
    - Improved `problems` with revision tracking
    - New `problem_tags` for better organization
    - Enhanced `user_problems` with revision metadata
    - Improved `code_snippets` with version control
    - Enhanced `daily_progress` with goal tracking
    - New `user_badges` for gamification
    - New `revision_sessions` for interview prep tracking

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data access
    - Ensure proper user isolation

  3. Performance
    - Add indexes for common queries
    - Optimize for revision workflows
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enhanced user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  daily_goal integer DEFAULT 1 CHECK (daily_goal > 0 AND daily_goal <= 20),
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  revision_mode boolean DEFAULT false,
  preferred_languages text[] DEFAULT ARRAY['javascript'],
  interview_prep_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced problems table
CREATE TABLE IF NOT EXISTS problems (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic text NOT NULL,
  description text,
  external_url text,
  leetcode_number integer,
  company_tags text[] DEFAULT ARRAY[]::text[],
  pattern_tags text[] DEFAULT ARRAY[]::text[],
  xp_reward integer DEFAULT 10,
  is_active boolean DEFAULT true,
  revision_priority integer DEFAULT 0 CHECK (revision_priority >= 0 AND revision_priority <= 5),
  last_revised_at timestamptz,
  revision_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Problem tags table for better organization
CREATE TABLE IF NOT EXISTS problem_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  tag_name text NOT NULL,
  tag_type text DEFAULT 'general' CHECK (tag_type IN ('general', 'company', 'pattern', 'difficulty')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(problem_id, tag_name)
);

-- Enhanced user problems table with revision tracking
CREATE TABLE IF NOT EXISTS user_problems (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  status text DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Done', 'Needs Revision')),
  personal_notes text,
  time_complexity text,
  space_complexity text,
  approach_notes text,
  key_insights text,
  common_mistakes text,
  revision_notes text,
  difficulty_rating integer CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  confidence_level integer DEFAULT 1 CHECK (confidence_level >= 1 AND confidence_level <= 5),
  last_attempted_at timestamptz,
  completed_at timestamptz,
  last_revised_at timestamptz,
  revision_count integer DEFAULT 0,
  is_bookmarked boolean DEFAULT false,
  is_interview_ready boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Enhanced code snippets table with version control
CREATE TABLE IF NOT EXISTS code_snippets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  language text DEFAULT 'javascript' NOT NULL,
  code text NOT NULL,
  is_solution boolean DEFAULT true,
  is_optimized boolean DEFAULT false,
  version integer DEFAULT 1,
  notes text,
  time_complexity text,
  space_complexity text,
  performance_notes text,
  is_interview_ready boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced daily progress table
CREATE TABLE IF NOT EXISTS daily_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  problems_solved integer DEFAULT 0,
  problems_revised integer DEFAULT 0,
  daily_goal integer DEFAULT 1,
  revision_goal integer DEFAULT 0,
  goal_achieved boolean DEFAULT false,
  revision_goal_achieved boolean DEFAULT false,
  xp_earned integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  study_time_minutes integer DEFAULT 0,
  focus_areas text[] DEFAULT ARRAY[]::text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- User badges table for gamification
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text,
  badge_icon text,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- New revision sessions table for interview prep tracking
CREATE TABLE IF NOT EXISTS revision_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text DEFAULT 'general' CHECK (session_type IN ('general', 'interview_prep', 'topic_focus', 'company_prep')),
  problems_revised uuid[] DEFAULT ARRAY[]::uuid[],
  duration_minutes integer DEFAULT 0,
  focus_topics text[] DEFAULT ARRAY[]::text[],
  confidence_before integer CHECK (confidence_before >= 1 AND confidence_before <= 5),
  confidence_after integer CHECK (confidence_after >= 1 AND confidence_after <= 5),
  notes text,
  session_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic);
CREATE INDEX IF NOT EXISTS idx_problems_revision_priority ON problems(revision_priority DESC);
CREATE INDEX IF NOT EXISTS idx_problems_company_tags ON problems USING GIN(company_tags);
CREATE INDEX IF NOT EXISTS idx_problems_pattern_tags ON problems USING GIN(pattern_tags);

CREATE INDEX IF NOT EXISTS idx_user_problems_user_id ON user_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problems_status ON user_problems(status);
CREATE INDEX IF NOT EXISTS idx_user_problems_confidence ON user_problems(confidence_level);
CREATE INDEX IF NOT EXISTS idx_user_problems_bookmarked ON user_problems(user_id, is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX IF NOT EXISTS idx_user_problems_interview_ready ON user_problems(user_id, is_interview_ready) WHERE is_interview_ready = true;

CREATE INDEX IF NOT EXISTS idx_code_snippets_user_problem ON code_snippets(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);
CREATE INDEX IF NOT EXISTS idx_code_snippets_interview_ready ON code_snippets(user_id, is_interview_ready) WHERE is_interview_ready = true;

CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_revision_sessions_user_date ON revision_sessions(user_id, session_date);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_sessions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Problems policies
CREATE POLICY "Anyone can read active problems" ON problems
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create problems" ON problems
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own problems" ON problems
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Problem tags policies
CREATE POLICY "Anyone can read problem tags" ON problem_tags
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tags" ON problem_tags
  FOR ALL TO authenticated
  USING (true);

-- User problems policies
CREATE POLICY "Users can manage own problem progress" ON user_problems
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Code snippets policies
CREATE POLICY "Users can manage own code snippets" ON code_snippets
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Daily progress policies
CREATE POLICY "Users can manage own daily progress" ON daily_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- User badges policies
CREATE POLICY "Users can read own badges" ON user_badges
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Revision sessions policies
CREATE POLICY "Users can manage own revision sessions" ON revision_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at
  BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_problems_updated_at
  BEFORE UPDATE ON user_problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON code_snippets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at
  BEFORE UPDATE ON daily_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();