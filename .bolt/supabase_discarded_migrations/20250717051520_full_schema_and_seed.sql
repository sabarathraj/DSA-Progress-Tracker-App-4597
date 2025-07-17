-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Drop tables safely
DROP TABLE IF EXISTS revision_sessions CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS daily_progress CASCADE;
DROP TABLE IF EXISTS code_snippets CASCADE;
DROP TABLE IF EXISTS user_problems CASCADE;
DROP TABLE IF EXISTS problem_tags CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- User Profiles
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  daily_goal integer DEFAULT 1 CHECK (daily_goal > 0 AND daily_goal <= 20),
  revision_goal integer DEFAULT 0 CHECK (revision_goal >= 0 AND revision_goal <= 10),
  current_streak integer DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak integer DEFAULT 0 CHECK (longest_streak >= 0),
  total_xp integer DEFAULT 0 CHECK (total_xp >= 0),
  level integer DEFAULT 1 CHECK (level > 0),
  timezone text DEFAULT 'UTC',
  notification_preferences jsonb DEFAULT '{"daily_reminder": true, "streak_alerts": true, "achievement_notifications": true}',
  study_preferences jsonb DEFAULT '{"preferred_difficulty": "Medium", "focus_areas": [], "interview_mode": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Problems
CREATE TABLE problems (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic text NOT NULL,
  description text,
  external_url text,
  leetcode_number integer,
  company_tags text[] DEFAULT '{}',
  pattern_tags text[] DEFAULT '{}',
  frequency_score integer DEFAULT 50 CHECK (frequency_score >= 0 AND frequency_score <= 100),
  acceptance_rate decimal(5,2) CHECK (acceptance_rate >= 0 AND acceptance_rate <= 100),
  xp_reward integer DEFAULT 10 CHECK (xp_reward > 0),
  is_active boolean DEFAULT true,
  revision_priority integer DEFAULT 3 CHECK (revision_priority >= 1 AND revision_priority <= 5),
  estimated_time_minutes integer DEFAULT 30 CHECK (estimated_time_minutes > 0),
  hints text[],
  similar_problems uuid[],
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Problem Tags
CREATE TABLE problem_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  tag_name text NOT NULL,
  tag_type text DEFAULT 'general' CHECK (tag_type IN ('general', 'company', 'pattern', 'difficulty')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(problem_id, tag_name)
);

-- User Problems
CREATE TABLE user_problems (
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
  times_attempted integer DEFAULT 0 CHECK (times_attempted >= 0),
  time_spent_minutes integer DEFAULT 0 CHECK (time_spent_minutes >= 0),
  last_attempted_at timestamptz,
  completed_at timestamptz,
  last_revised_at timestamptz,
  next_revision_date timestamptz,
  revision_count integer DEFAULT 0 CHECK (revision_count >= 0),
  performance_score decimal(3,2) CHECK (performance_score >= 0 AND performance_score <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Code Snippets
CREATE TABLE code_snippets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  language text DEFAULT 'javascript' NOT NULL,
  code text NOT NULL,
  version integer DEFAULT 1 CHECK (version > 0),
  is_solution boolean DEFAULT true,
  performance_notes text,
  optimization_notes text,
  runtime_complexity text,
  space_complexity text,
  notes text,
  is_optimized boolean DEFAULT false,
  benchmark_results jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily Progress
CREATE TABLE daily_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  problems_solved integer DEFAULT 0 CHECK (problems_solved >= 0),
  problems_revised integer DEFAULT 0 CHECK (problems_revised >= 0),
  daily_goal integer DEFAULT 1 CHECK (daily_goal > 0),
  revision_goal integer DEFAULT 0 CHECK (revision_goal >= 0),
  goal_achieved boolean DEFAULT false,
  revision_goal_achieved boolean DEFAULT false,
  xp_earned integer DEFAULT 0 CHECK (xp_earned >= 0),
  study_time_minutes integer DEFAULT 0 CHECK (study_time_minutes >= 0),
  streak_count integer DEFAULT 0 CHECK (streak_count >= 0),
  focus_areas text[] DEFAULT '{}',
  productivity_score decimal(3,2) CHECK (productivity_score >= 0 AND productivity_score <= 5),
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- User Badges
CREATE TABLE user_badges (
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

-- Revision Sessions
CREATE TABLE revision_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text DEFAULT 'general' CHECK (session_type IN ('general', 'interview_prep', 'topic_focus', 'company_prep', 'weakness_focus')),
  session_date timestamptz DEFAULT now(),
  duration_minutes integer DEFAULT 0 CHECK (duration_minutes >= 0),
  problems_revised uuid[] DEFAULT '{}',
  topics_covered text[] DEFAULT '{}',
  companies_focused text[] DEFAULT '{}',
  confidence_before decimal(3,2) CHECK (confidence_before >= 1 AND confidence_before <= 5),
  confidence_after decimal(3,2) CHECK (confidence_after >= 1 AND confidence_after <= 5),
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  notes text,
  goals_achieved text[],
  areas_for_improvement text[],
  next_session_plan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_problems_updated_at BEFORE UPDATE ON user_problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_code_snippets_updated_at BEFORE UPDATE ON code_snippets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_progress_updated_at BEFORE UPDATE ON daily_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revision_sessions_updated_at BEFORE UPDATE ON revision_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE POLICY "Read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Problems Policies
CREATE POLICY "Read active problems" ON problems FOR SELECT USING (is_active = true);
CREATE POLICY "Insert problems by creator" ON problems FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Update own problems" ON problems FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Delete own problems" ON problems FOR DELETE USING (auth.uid() = created_by);

-- Problem Tags Policies
CREATE POLICY "Read tags" ON problem_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage tags" ON problem_tags FOR ALL TO authenticated USING (true);

-- User Problems Policies
CREATE POLICY "Manage own progress" ON user_problems FOR ALL USING (auth.uid() = user_id);

-- Code Snippets Policies
CREATE POLICY "Manage own code" ON code_snippets FOR ALL USING (auth.uid() = user_id);

-- Daily Progress Policies
CREATE POLICY "Manage own progress" ON daily_progress FOR ALL USING (auth.uid() = user_id);

-- User Badges Policies
CREATE POLICY "Read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Revision Sessions Policies
CREATE POLICY "Manage own revision sessions" ON revision_sessions FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_problems_company_tags ON problems USING GIN(company_tags);
CREATE INDEX idx_problems_pattern_tags ON problems USING GIN(pattern_tags);
CREATE INDEX idx_problems_frequency ON problems(frequency_score DESC);
CREATE INDEX idx_problems_active ON problems(is_active) WHERE is_active = true;
CREATE INDEX idx_user_problems_user_id ON user_problems(user_id);
CREATE INDEX idx_user_problems_status ON user_problems(status);
CREATE INDEX idx_user_problems_confidence ON user_problems(confidence_level);
CREATE INDEX idx_user_problems_bookmarked ON user_problems(is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX idx_user_problems_interview_ready ON user_problems(is_interview_ready) WHERE is_interview_ready = true;
CREATE INDEX idx_user_problems_next_revision ON user_problems(next_revision_date) WHERE next_revision_date IS NOT NULL;
CREATE INDEX idx_code_snippets_user_problem ON code_snippets(user_id, problem_id);
CREATE INDEX idx_code_snippets_language ON code_snippets(language);
CREATE INDEX idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX idx_daily_progress_date ON daily_progress(date DESC);
CREATE INDEX idx_revision_sessions_user_date ON revision_sessions(user_id, session_date DESC);
CREATE INDEX idx_revision_sessions_type ON revision_sessions(session_type);

-- Insert sample problems for testing
INSERT INTO problems (title, difficulty, topic, description, external_url, leetcode_number, company_tags, pattern_tags, frequency_score, xp_reward) VALUES
('Two Sum', 'Easy', 'Array', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'https://leetcode.com/problems/two-sum/', 1, ARRAY['Google', 'Amazon', 'Microsoft'], ARRAY['Hash Table', 'Array'], 95, 10),
('Add Two Numbers', 'Medium', 'Linked List', 'You are given two non-empty linked lists representing two non-negative integers.', 'https://leetcode.com/problems/add-two-numbers/', 2, ARRAY['Amazon', 'Microsoft'], ARRAY['Linked List', 'Math'], 85, 15),
('Longest Substring Without Repeating Characters', 'Medium', 'String', 'Given a string s, find the length of the longest substring without repeating characters.', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 3, ARRAY['Google', 'Facebook'], ARRAY['Hash Table', 'String', 'Sliding Window'], 90, 15),
('Median of Two Sorted Arrays', 'Hard', 'Array', 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.', 'https://leetcode.com/problems/median-of-two-sorted-arrays/', 4, ARRAY['Google', 'Apple'], ARRAY['Array', 'Binary Search', 'Divide and Conquer'], 75, 25),
('Longest Palindromic Substring', 'Medium', 'String', 'Given a string s, return the longest palindromic substring in s.', 'https://leetcode.com/problems/longest-palindromic-substring/', 5, ARRAY['Amazon', 'Microsoft'], ARRAY['String', 'Dynamic Programming'], 80, 15),
('Valid Parentheses', 'Easy', 'Stack', 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.', 'https://leetcode.com/problems/valid-parentheses/', 20, ARRAY['Google', 'Facebook', 'Amazon'], ARRAY['String', 'Stack'], 92, 10),
('Merge Two Sorted Lists', 'Easy', 'Linked List', 'You are given the heads of two sorted linked lists list1 and list2.', 'https://leetcode.com/problems/merge-two-sorted-lists/', 21, ARRAY['Amazon', 'Microsoft'], ARRAY['Linked List', 'Recursion'], 88, 10),
('Maximum Subarray', 'Medium', 'Array', 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', 'https://leetcode.com/problems/maximum-subarray/', 53, ARRAY['Amazon', 'Google'], ARRAY['Array', 'Dynamic Programming', 'Divide and Conquer'], 85, 15),
('Climbing Stairs', 'Easy', 'Dynamic Programming', 'You are climbing a staircase. It takes n steps to reach the top.', 'https://leetcode.com/problems/climbing-stairs/', 70, ARRAY['Amazon', 'Google'], ARRAY['Math', 'Dynamic Programming', 'Memoization'], 90, 10),
('Binary Tree Inorder Traversal', 'Easy', 'Tree', 'Given the root of a binary tree, return the inorder traversal of its nodes values.', 'https://leetcode.com/problems/binary-tree-inorder-traversal/', 94, ARRAY['Microsoft', 'Amazon'], ARRAY['Stack', 'Tree', 'Depth-First Search'], 85, 10); 