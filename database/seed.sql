-- Insert some sample problems for new users (optional)
-- You can run this after setting up the schema

-- This function will add sample problems when a user profile is created
CREATE OR REPLACE FUNCTION add_sample_problems_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Add sample problems for new users
  INSERT INTO problems (user_id, title, difficulty, topic, url, tags, xp) VALUES
    (NEW.user_id, 'Two Sum', 'Easy', 'Arrays', 'https://leetcode.com/problems/two-sum/', ARRAY['Hash Table'], 10),
    (NEW.user_id, 'Best Time to Buy and Sell Stock', 'Easy', 'Arrays', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', ARRAY['Dynamic Programming'], 10),
    (NEW.user_id, 'Valid Anagram', 'Easy', 'Strings', 'https://leetcode.com/problems/valid-anagram/', ARRAY['Hash Table'], 10),
    (NEW.user_id, 'Valid Parentheses', 'Easy', 'Strings', 'https://leetcode.com/problems/valid-parentheses/', ARRAY['Stack'], 10),
    (NEW.user_id, 'Reverse Linked List', 'Easy', 'Linked Lists', 'https://leetcode.com/problems/reverse-linked-list/', ARRAY['Recursion'], 10),
    (NEW.user_id, 'Maximum Depth of Binary Tree', 'Easy', 'Trees', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', ARRAY['DFS', 'BFS'], 10),
    (NEW.user_id, 'Climbing Stairs', 'Easy', 'Dynamic Programming', 'https://leetcode.com/problems/climbing-stairs/', ARRAY['Math'], 10),
    (NEW.user_id, 'Product of Array Except Self', 'Medium', 'Arrays', 'https://leetcode.com/problems/product-of-array-except-self/', ARRAY['Prefix Sum'], 20),
    (NEW.user_id, 'Longest Substring Without Repeating Characters', 'Medium', 'Strings', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', ARRAY['Sliding Window'], 20),
    (NEW.user_id, 'Number of Islands', 'Medium', 'Graphs', 'https://leetcode.com/problems/number-of-islands/', ARRAY['DFS', 'BFS'], 20);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sample problems (optional - remove if you don't want sample data)
CREATE TRIGGER trigger_add_sample_problems 
  AFTER INSERT ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION add_sample_problems_for_user();