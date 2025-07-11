-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_goal INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create problems table
CREATE TABLE problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic TEXT NOT NULL,
  url TEXT,
  tags TEXT[] DEFAULT '{}',
  xp INTEGER DEFAULT 10,
  status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Done')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily progress table
CREATE TABLE daily_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  solved INTEGER DEFAULT 0,
  goal INTEGER DEFAULT 1,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create problem notes table
CREATE TABLE problem_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

-- Create user badges table
CREATE TABLE user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for problems
CREATE POLICY "Users can view own problems" ON problems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own problems" ON problems
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own problems" ON problems
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own problems" ON problems
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for daily_progress
CREATE POLICY "Users can view own progress" ON daily_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON daily_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON daily_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for problem_notes
CREATE POLICY "Users can view own notes" ON problem_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON problem_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON problem_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON problem_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges" ON user_badges
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_problems_user_id ON problems(user_id);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_daily_progress_user_id ON daily_progress(user_id);
CREATE INDEX idx_daily_progress_date ON daily_progress(date);
CREATE INDEX idx_problem_notes_user_id ON problem_notes(user_id);
CREATE INDEX idx_problem_notes_problem_id ON problem_notes(problem_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at 
  BEFORE UPDATE ON problems 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at 
  BEFORE UPDATE ON daily_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problem_notes_updated_at 
  BEFORE UPDATE ON problem_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update daily progress when problem status changes
CREATE OR REPLACE FUNCTION update_daily_progress_on_problem_change()
RETURNS TRIGGER AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  user_goal INTEGER;
  problems_solved INTEGER;
BEGIN
  -- Get user's daily goal
  SELECT daily_goal INTO user_goal 
  FROM user_profiles 
  WHERE user_id = NEW.user_id;
  
  IF user_goal IS NULL THEN
    user_goal := 1;
  END IF;

  -- Count problems solved today
  SELECT COUNT(*) INTO problems_solved
  FROM problems 
  WHERE user_id = NEW.user_id 
    AND status = 'Done' 
    AND DATE(updated_at) = today_date;

  -- Insert or update daily progress
  INSERT INTO daily_progress (user_id, date, solved, goal, achieved)
  VALUES (NEW.user_id, today_date, problems_solved, user_goal, problems_solved >= user_goal)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    solved = problems_solved,
    goal = user_goal,
    achieved = problems_solved >= user_goal,
    updated_at = NOW();

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic daily progress updates
CREATE TRIGGER trigger_update_daily_progress 
  AFTER UPDATE ON problems 
  FOR EACH ROW 
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_daily_progress_on_problem_change();

-- Insert default badge data for new users
CREATE OR REPLACE FUNCTION create_default_badges_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_badges (user_id, badge_id, unlocked) VALUES
    (NEW.user_id, 'first_problem', false),
    (NEW.user_id, 'streak_7', false),
    (NEW.user_id, 'streak_30', false),
    (NEW.user_id, 'xp_100', false),
    (NEW.user_id, 'xp_500', false),
    (NEW.user_id, 'xp_1000', false),
    (NEW.user_id, 'easy_10', false),
    (NEW.user_id, 'medium_10', false),
    (NEW.user_id, 'hard_5', false),
    (NEW.user_id, 'topic_master', false);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for default badges
CREATE TRIGGER trigger_create_default_badges 
  AFTER INSERT ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION create_default_badges_for_user();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE problems;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE problem_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE user_badges;