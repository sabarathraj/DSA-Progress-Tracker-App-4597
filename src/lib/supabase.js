import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database helper functions
export const dbHelpers = {
  // User Profile Operations
  async createUserProfile(user, additionalData = {}) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: additionalData.full_name || user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || null,
        ...additionalData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Problem Operations
  async getProblems() {
    const { data, error } = await supabase
      .from('problems')
      .select(`
        *,
        problem_tags (tag_name)
      `)
      .eq('is_active', true)
      .order('created_at');

    if (error) throw error;
    return data.map(problem => ({
      ...problem,
      tags: problem.problem_tags.map(tag => tag.tag_name)
    }));
  },

  async createProblem(problemData) {
    const { data, error } = await supabase
      .from('problems')
      .insert(problemData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProblem(problemId, updates) {
    const { data, error } = await supabase
      .from('problems')
      .update(updates)
      .eq('id', problemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProblem(problemId) {
    const { error } = await supabase
      .from('problems')
      .update({ is_active: false })
      .eq('id', problemId);

    if (error) throw error;
  },

  // User Problem Progress Operations
  async getUserProblems(userId) {
    const { data, error } = await supabase
      .from('user_problems')
      .select(`
        *,
        problems (
          *,
          problem_tags (tag_name)
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(userProblem => ({
      ...userProblem.problems,
      tags: userProblem.problems.problem_tags.map(tag => tag.tag_name),
      status: userProblem.status,
      personal_notes: userProblem.personal_notes,
      time_complexity: userProblem.time_complexity,
      space_complexity: userProblem.space_complexity,
      approach_notes: userProblem.approach_notes,
      completed_at: userProblem.completed_at,
      user_problem_id: userProblem.id
    }));
  },

  async updateUserProblemStatus(userId, problemId, status, additionalData = {}) {
    const { data, error } = await supabase
      .from('user_problems')
      .upsert({
        user_id: userId,
        problem_id: problemId,
        status,
        completed_at: status === 'Done' ? new Date().toISOString() : null,
        ...additionalData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Code Snippets Operations
  async getCodeSnippets(userId, problemId) {
    const { data, error } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async saveCodeSnippet(userId, problemId, codeData) {
    const { data, error } = await supabase
      .from('code_snippets')
      .insert({
        user_id: userId,
        problem_id: problemId,
        ...codeData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCodeSnippet(snippetId, updates) {
    const { data, error } = await supabase
      .from('code_snippets')
      .update(updates)
      .eq('id', snippetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCodeSnippet(snippetId) {
    const { error } = await supabase
      .from('code_snippets')
      .delete()
      .eq('id', snippetId);

    if (error) throw error;
  },

  // Daily Progress Operations
  async getDailyProgress(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return data;
  },

  async updateDailyProgress(userId, date, progressData) {
    const { data, error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        date,
        ...progressData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Badge Operations
  async getUserBadges(userId) {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at');

    if (error) throw error;
    return data;
  },

  async unlockBadge(userId, badgeData) {
    const { data, error } = await supabase
      .from('user_badges')
      .upsert({
        user_id: userId,
        ...badgeData
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate key errors
    return data;
  }
};