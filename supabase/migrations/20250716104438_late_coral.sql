/*
  # Enhanced DSA Tracker Database Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `problems` - Problem definitions with CRUD support
    - `user_problems` - User-specific problem progress and solutions
    - `daily_progress` - Daily tracking and streak management
    - `code_snippets` - Code storage with syntax highlighting
    - `user_badges` - Achievement system
    - `problem_tags` - Tag management for problems

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for authenticated users
    - Ensure data isolation between users

  3. Features
    - Full CRUD operations for problems
    - Real-time progress tracking
    - Code snippet storage with syntax highlighting
    - Achievement and badge system
    - Daily progress logging with streaks
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  daily_goal integer DEFAULT 1 CHECK (daily_goal > 0 AND daily_goal <= 20),
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Problems Table (Master problem definitions)
CREATE TABLE IF NOT EXISTS problems (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic text NOT NULL,
  description text,
  external_url text,
  leetcode_number integer,
  xp_reward integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Problem Tags Table
CREATE TABLE IF NOT EXISTS problem_tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  tag_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(problem_id, tag_name)
);

-- User Problems Table (User-specific problem progress)
CREATE TABLE IF NOT EXISTS user_problems (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  status text DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Done')),
  personal_notes text,
  time_complexity text,
  space_complexity text,
  approach_notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Code Snippets Table
CREATE TABLE IF NOT EXISTS code_snippets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'javascript',
  code text NOT NULL,
  is_solution boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily Progress Table
CREATE TABLE IF NOT EXISTS daily_progress (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  problems_solved integer DEFAULT 0,
  daily_goal integer DEFAULT 1,
  goal_achieved boolean DEFAULT false,
  xp_earned integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text,
  badge_icon text,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for problems (public read, authenticated users can create)
CREATE POLICY "Anyone can read active problems"
  ON problems
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create problems"
  ON problems
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own problems"
  ON problems
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for problem_tags
CREATE POLICY "Anyone can read problem tags"
  ON problem_tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tags"
  ON problem_tags
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for user_problems
CREATE POLICY "Users can manage own problem progress"
  ON user_problems
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for code_snippets
CREATE POLICY "Users can manage own code snippets"
  ON code_snippets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_progress
CREATE POLICY "Users can manage own daily progress"
  ON daily_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can read own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_problems_user_id ON user_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problems_status ON user_problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_problem ON code_snippets(user_id, problem_id);

-- Insert default problems
INSERT INTO problems (title, difficulty, topic, description, external_url, leetcode_number, xp_reward) VALUES
-- Arrays
('Two Sum', 'Easy', 'Arrays', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'https://leetcode.com/problems/two-sum/', 1, 10),
('Best Time to Buy and Sell Stock', 'Easy', 'Arrays', 'You are given an array prices where prices[i] is the price of a given stock on the ith day.', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 121, 10),
('Contains Duplicate', 'Easy', 'Arrays', 'Given an integer array nums, return true if any value appears at least twice in the array.', 'https://leetcode.com/problems/contains-duplicate/', 217, 10),
('Product of Array Except Self', 'Medium', 'Arrays', 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].', 'https://leetcode.com/problems/product-of-array-except-self/', 238, 20),
('Maximum Subarray', 'Medium', 'Arrays', 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', 'https://leetcode.com/problems/maximum-subarray/', 53, 20),

-- Strings
('Valid Anagram', 'Easy', 'Strings', 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.', 'https://leetcode.com/problems/valid-anagram/', 242, 10),
('Valid Parentheses', 'Easy', 'Strings', 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.', 'https://leetcode.com/problems/valid-parentheses/', 20, 10),
('Longest Substring Without Repeating Characters', 'Medium', 'Strings', 'Given a string s, find the length of the longest substring without repeating characters.', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 3, 20),

-- Linked Lists
('Reverse Linked List', 'Easy', 'Linked Lists', 'Given the head of a singly linked list, reverse the list, and return the reversed list.', 'https://leetcode.com/problems/reverse-linked-list/', 206, 10),
('Merge Two Sorted Lists', 'Easy', 'Linked Lists', 'You are given the heads of two sorted linked lists list1 and list2.', 'https://leetcode.com/problems/merge-two-sorted-lists/', 21, 10),
('Linked List Cycle', 'Easy', 'Linked Lists', 'Given head, the head of a linked list, determine if the linked list has a cycle in it.', 'https://leetcode.com/problems/linked-list-cycle/', 141, 10),

-- Trees
('Maximum Depth of Binary Tree', 'Easy', 'Trees', 'Given the root of a binary tree, return its maximum depth.', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', 104, 10),
('Same Tree', 'Easy', 'Trees', 'Given the roots of two binary trees p and q, write a function to check if they are the same or not.', 'https://leetcode.com/problems/same-tree/', 100, 10),
('Binary Tree Inorder Traversal', 'Easy', 'Trees', 'Given the root of a binary tree, return the inorder traversal of its nodes values.', 'https://leetcode.com/problems/binary-tree-inorder-traversal/', 94, 10),
('Validate Binary Search Tree', 'Medium', 'Trees', 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).', 'https://leetcode.com/problems/validate-binary-search-tree/', 98, 20),

-- Dynamic Programming
('Climbing Stairs', 'Easy', 'Dynamic Programming', 'You are climbing a staircase. It takes n steps to reach the top.', 'https://leetcode.com/problems/climbing-stairs/', 70, 10),
('House Robber', 'Medium', 'Dynamic Programming', 'You are a professional robber planning to rob houses along a street.', 'https://leetcode.com/problems/house-robber/', 198, 20),
('Coin Change', 'Medium', 'Dynamic Programming', 'You are given an integer array coins representing coins of different denominations.', 'https://leetcode.com/problems/coin-change/', 322, 20),

-- Graphs
('Number of Islands', 'Medium', 'Graphs', 'Given an m x n 2D binary grid which represents a map of 1s (land) and 0s (water).', 'https://leetcode.com/problems/number-of-islands/', 200, 20),
('Clone Graph', 'Medium', 'Graphs', 'Given a reference of a node in a connected undirected graph.', 'https://leetcode.com/problems/clone-graph/', 133, 20),

-- Hard Problems
('Median of Two Sorted Arrays', 'Hard', 'Arrays', 'Given two sorted arrays nums1 and nums2 of size m and n respectively.', 'https://leetcode.com/problems/median-of-two-sorted-arrays/', 4, 30),
('Trapping Rain Water', 'Hard', 'Arrays', 'Given n non-negative integers representing an elevation map.', 'https://leetcode.com/problems/trapping-rain-water/', 42, 30),
('Serialize and Deserialize Binary Tree', 'Hard', 'Trees', 'Serialization is the process of converting a data structure into a sequence of bits.', 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', 297, 30),
('Word Ladder', 'Hard', 'Graphs', 'A transformation sequence from word beginWord to word endWord.', 'https://leetcode.com/problems/word-ladder/', 127, 30),
('Edit Distance', 'Hard', 'Dynamic Programming', 'Given two strings word1 and word2, return the minimum number of operations.', 'https://leetcode.com/problems/edit-distance/', 72, 30);

-- Insert default tags
INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Hash Table']) FROM problems p WHERE p.title = 'Two Sum';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Dynamic Programming']) FROM problems p WHERE p.title = 'Best Time to Buy and Sell Stock';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Hash Table', 'Sorting']) FROM problems p WHERE p.title = 'Contains Duplicate';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Prefix Sum']) FROM problems p WHERE p.title = 'Product of Array Except Self';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Dynamic Programming', 'Kadane Algorithm']) FROM problems p WHERE p.title = 'Maximum Subarray';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Hash Table', 'Sorting']) FROM problems p WHERE p.title = 'Valid Anagram';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Stack']) FROM problems p WHERE p.title = 'Valid Parentheses';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Sliding Window', 'Hash Table']) FROM problems p WHERE p.title = 'Longest Substring Without Repeating Characters';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Recursion', 'Iterative']) FROM problems p WHERE p.title = 'Reverse Linked List';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Recursion', 'Merge']) FROM problems p WHERE p.title = 'Merge Two Sorted Lists';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Two Pointers', 'Floyd Cycle']) FROM problems p WHERE p.title = 'Linked List Cycle';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['DFS', 'BFS', 'Recursion']) FROM problems p WHERE p.title = 'Maximum Depth of Binary Tree';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['DFS', 'Recursion']) FROM problems p WHERE p.title = 'Same Tree';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['DFS', 'Stack', 'Morris Traversal']) FROM problems p WHERE p.title = 'Binary Tree Inorder Traversal';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['DFS', 'BST', 'Recursion']) FROM problems p WHERE p.title = 'Validate Binary Search Tree';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Math', 'Fibonacci']) FROM problems p WHERE p.title = 'Climbing Stairs';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Dynamic Programming']) FROM problems p WHERE p.title = 'House Robber';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['BFS', 'Dynamic Programming']) FROM problems p WHERE p.title = 'Coin Change';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['DFS', 'BFS', 'Union Find']) FROM problems p WHERE p.title = 'Number of Islands';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['DFS', 'BFS', 'Hash Table']) FROM problems p WHERE p.title = 'Clone Graph';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Binary Search', 'Divide and Conquer']) FROM problems p WHERE p.title = 'Median of Two Sorted Arrays';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['Two Pointers', 'Stack', 'Dynamic Programming']) FROM problems p WHERE p.title = 'Trapping Rain Water';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['DFS', 'BFS', 'Design']) FROM problems p WHERE p.title = 'Serialize and Deserialize Binary Tree';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['BFS', 'Hash Table']) FROM problems p WHERE p.title = 'Word Ladder';

INSERT INTO problem_tags (problem_id, tag_name) 
SELECT p.id, unnest(ARRAY['String', 'Dynamic Programming']) FROM problems p WHERE p.title = 'Edit Distance';

-- Function to update user profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_problems_updated_at BEFORE UPDATE ON user_problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_code_snippets_updated_at BEFORE UPDATE ON code_snippets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_progress_updated_at BEFORE UPDATE ON daily_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();