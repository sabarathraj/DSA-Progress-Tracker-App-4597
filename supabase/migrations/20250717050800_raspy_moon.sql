/*
  # Enhanced DSA Tracker Schema for Professional Revision Hub

  1. New Tables
    - `user_profiles` - Enhanced user profiles with revision goals and preferences
    - `problems` - Comprehensive problem management with revision tracking
    - `problem_tags` - Flexible tagging system for problems
    - `user_problems` - User progress with confidence levels and revision tracking
    - `code_snippets` - Version-controlled code storage with performance notes
    - `daily_progress` - Enhanced daily tracking with revision goals
    - `user_badges` - Achievement system for motivation
    - `revision_sessions` - Interview preparation session tracking

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data access
    - Ensure users can only access their own data

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize for real-time queries and updates

  4. Features
    - Revision tracking with confidence levels
    - Interview readiness marking
    - Company and pattern tags
    - Spaced repetition support
    - Session-based revision tracking
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

-- Enhanced User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  daily_goal integer DEFAULT 1 CHECK (daily_goal > 0 AND daily_goal <= 20),
  revision_goal integer DEFAULT 0 CHECK (revision_goal >= 0 AND revision_goal <= 10),
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  preferred_languages text[] DEFAULT ARRAY['javascript'],
  interview_mode boolean DEFAULT false,
  target_companies text[] DEFAULT ARRAY[]::text[],
  weak_topics text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Problems Table
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
  frequency_score integer DEFAULT 0 CHECK (frequency_score >= 0 AND frequency_score <= 100),
  revision_priority integer DEFAULT 0 CHECK (revision_priority >= 0 AND revision_priority <= 10),
  xp_reward integer DEFAULT 10,
  estimated_time_minutes integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Problem Tags Table (for flexible tagging)
CREATE TABLE IF NOT EXISTS problem_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  tag_name text NOT NULL,
  tag_type text DEFAULT 'general' CHECK (tag_type IN ('general', 'company', 'pattern', 'difficulty')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(problem_id, tag_name)
);

-- Enhanced User Problems Table
CREATE TABLE IF NOT EXISTS user_problems (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  status text DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Done', 'Needs Revision')),
  personal_notes text,
  approach_notes text,
  time_complexity text,
  space_complexity text,
  key_insights text,
  common_mistakes text,
  revision_notes text,
  difficulty_rating integer CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  confidence_level integer DEFAULT 1 CHECK (confidence_level >= 1 AND confidence_level <= 5),
  is_bookmarked boolean DEFAULT false,
  is_interview_ready boolean DEFAULT false,
  last_attempted_at timestamptz,
  completed_at timestamptz,
  last_revised_at timestamptz,
  next_revision_date timestamptz,
  revision_count integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  attempts_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Enhanced Code Snippets Table
CREATE TABLE IF NOT EXISTS code_snippets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  language text DEFAULT 'javascript' NOT NULL,
  code text NOT NULL,
  version integer DEFAULT 1,
  is_solution boolean DEFAULT true,
  performance_notes text,
  optimization_notes text,
  notes text,
  execution_time_ms integer,
  memory_usage_mb numeric(10,2),
  is_optimized boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Daily Progress Table
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
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  productivity_rating integer CHECK (productivity_rating >= 1 AND productivity_rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text,
  badge_icon text,
  progress_current integer DEFAULT 0,
  progress_required integer DEFAULT 1,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Revision Sessions Table (for interview preparation tracking)
CREATE TABLE IF NOT EXISTS revision_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text DEFAULT 'general' CHECK (session_type IN ('general', 'interview_prep', 'topic_focus', 'company_prep', 'weakness_focus')),
  session_date timestamptz DEFAULT now(),
  duration_minutes integer DEFAULT 0,
  problems_revised uuid[] DEFAULT ARRAY[]::uuid[],
  topics_covered text[] DEFAULT ARRAY[]::text[],
  companies_focused text[] DEFAULT ARRAY[]::text[],
  confidence_before integer CHECK (confidence_before >= 1 AND confidence_before <= 5),
  confidence_after integer CHECK (confidence_after >= 1 AND confidence_after <= 5),
  session_notes text,
  goals_achieved boolean DEFAULT false,
  next_session_plan text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic);
CREATE INDEX IF NOT EXISTS idx_problems_company_tags ON problems USING GIN(company_tags);
CREATE INDEX IF NOT EXISTS idx_problems_pattern_tags ON problems USING GIN(pattern_tags);
CREATE INDEX IF NOT EXISTS idx_problems_frequency ON problems(frequency_score DESC);
CREATE INDEX IF NOT EXISTS idx_problems_revision_priority ON problems(revision_priority DESC);

CREATE INDEX IF NOT EXISTS idx_user_problems_user_id ON user_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problems_status ON user_problems(status);
CREATE INDEX IF NOT EXISTS idx_user_problems_confidence ON user_problems(confidence_level);
CREATE INDEX IF NOT EXISTS idx_user_problems_bookmarked ON user_problems(is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX IF NOT EXISTS idx_user_problems_interview_ready ON user_problems(is_interview_ready) WHERE is_interview_ready = true;
CREATE INDEX IF NOT EXISTS idx_user_problems_needs_revision ON user_problems(next_revision_date) WHERE next_revision_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_code_snippets_user_problem ON code_snippets(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);

CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date DESC);

CREATE INDEX IF NOT EXISTS idx_revision_sessions_user_date ON revision_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_revision_sessions_type ON revision_sessions(session_type);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_sessions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Problems Policies
CREATE POLICY "Anyone can read active problems" ON problems
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create problems" ON problems
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own problems" ON problems
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Problem Tags Policies
CREATE POLICY "Anyone can read problem tags" ON problem_tags
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tags" ON problem_tags
  FOR ALL TO authenticated
  USING (true);

-- User Problems Policies
CREATE POLICY "Users can manage own problem progress" ON user_problems
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Code Snippets Policies
CREATE POLICY "Users can manage own code snippets" ON code_snippets
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Daily Progress Policies
CREATE POLICY "Users can manage own daily progress" ON daily_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- User Badges Policies
CREATE POLICY "Users can read own badges" ON user_badges
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Revision Sessions Policies
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

-- Insert sample problems for testing
INSERT INTO problems (title, difficulty, topic, description, external_url, leetcode_number, company_tags, pattern_tags, frequency_score, revision_priority, xp_reward) VALUES
('Two Sum', 'Easy', 'Array', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'https://leetcode.com/problems/two-sum/', 1, ARRAY['Google', 'Amazon', 'Microsoft'], ARRAY['Hash Table', 'Two Pointers'], 95, 10, 10),
('Add Two Numbers', 'Medium', 'Linked List', 'You are given two non-empty linked lists representing two non-negative integers.', 'https://leetcode.com/problems/add-two-numbers/', 2, ARRAY['Amazon', 'Microsoft'], ARRAY['Linked List', 'Math'], 85, 8, 15),
('Longest Substring Without Repeating Characters', 'Medium', 'String', 'Given a string s, find the length of the longest substring without repeating characters.', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 3, ARRAY['Amazon', 'Google'], ARRAY['Sliding Window', 'Hash Table'], 90, 9, 15),
('Median of Two Sorted Arrays', 'Hard', 'Array', 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.', 'https://leetcode.com/problems/median-of-two-sorted-arrays/', 4, ARRAY['Google', 'Microsoft'], ARRAY['Binary Search', 'Divide and Conquer'], 70, 7, 25),
('Valid Parentheses', 'Easy', 'Stack', 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.', 'https://leetcode.com/problems/valid-parentheses/', 20, ARRAY['Amazon', 'Google', 'Facebook'], ARRAY['Stack', 'String'], 88, 9, 10),
('Merge Two Sorted Lists', 'Easy', 'Linked List', 'You are given the heads of two sorted linked lists list1 and list2.', 'https://leetcode.com/problems/merge-two-sorted-lists/', 21, ARRAY['Amazon', 'Microsoft'], ARRAY['Linked List', 'Recursion'], 82, 8, 10),
('Maximum Subarray', 'Medium', 'Dynamic Programming', 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', 'https://leetcode.com/problems/maximum-subarray/', 53, ARRAY['Amazon', 'Google'], ARRAY['Dynamic Programming', 'Divide and Conquer'], 85, 8, 15),
('Climbing Stairs', 'Easy', 'Dynamic Programming', 'You are climbing a staircase. It takes n steps to reach the top.', 'https://leetcode.com/problems/climbing-stairs/', 70, ARRAY['Amazon', 'Google'], ARRAY['Dynamic Programming', 'Math'], 80, 7, 10),
('Binary Tree Inorder Traversal', 'Easy', 'Tree', 'Given the root of a binary tree, return the inorder traversal of its nodes values.', 'https://leetcode.com/problems/binary-tree-inorder-traversal/', 94, ARRAY['Microsoft', 'Amazon'], ARRAY['Tree', 'Stack', 'DFS'], 75, 6, 10),
('Validate Binary Search Tree', 'Medium', 'Tree', 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).', 'https://leetcode.com/problems/validate-binary-search-tree/', 98, ARRAY['Amazon', 'Microsoft'], ARRAY['Tree', 'DFS', 'BST'], 78, 7, 15);

-- Insert corresponding problem tags
INSERT INTO problem_tags (problem_id, tag_name, tag_type)
SELECT p.id, unnest(p.company_tags), 'company'
FROM problems p
WHERE array_length(p.company_tags, 1) > 0;

INSERT INTO problem_tags (problem_id, tag_name, tag_type)
SELECT p.id, unnest(p.pattern_tags), 'pattern'
FROM problems p
WHERE array_length(p.pattern_tags, 1) > 0;