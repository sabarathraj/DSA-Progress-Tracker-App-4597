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

// Enhanced database helper functions for professional DSA revision hub
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

  // Enhanced Problem Operations
  async getProblems(filters = {}) {
    let query = supabase
      .from('problems')
      .select(`
        *,
        problem_tags (tag_name, tag_type)
      `)
      .eq('is_active', true);

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.topic) {
      query = query.eq('topic', filters.topic);
    }
    if (filters.company) {
      query = query.contains('company_tags', [filters.company]);
    }
    if (filters.pattern) {
      query = query.contains('pattern_tags', [filters.pattern]);
    }

    query = query.order('revision_priority', { ascending: false })
                 .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data.map(problem => ({
      ...problem,
      tags: problem.problem_tags.map(tag => tag.tag_name),
      company_tags: problem.company_tags || [],
      pattern_tags: problem.pattern_tags || []
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
    if (!problemId) throw new Error('No problem ID provided for update.');
    // Remove non-existent columns from updates
    const allowed = ['title','difficulty','topic','description','external_url','leetcode_number','company_tags','pattern_tags','xp_reward','estimated_time_minutes','hints','is_active','created_by'];
    const sanitized = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
    // Debug log
    console.log('[updateProblem] id:', problemId, 'payload:', sanitized);
    // Pre-update existence check
    const { data: exists, error: selectError } = await supabase
      .from('problems')
      .select('id')
      .eq('id', problemId)
      .maybeSingle();
    if (selectError) throw selectError;
    if (!exists) throw new Error(`Problem with id ${problemId} does not exist or is not visible (check RLS policies and is_active status).`);
    // Proceed with update
    // Remove empty string UUIDs
    for (const key of ['id', 'created_by']) {
      if (sanitized[key] === "") delete sanitized[key];
    }
    const { data, error } = await supabase
      .from('problems')
      .update(sanitized)
      .eq('id', problemId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('No problem found to update.');
    return data;
  },

  async deleteProblem(problemId) {
    const { error } = await supabase
      .from('problems')
      .update({ is_active: false })
      .eq('id', problemId);

    if (error) throw error;
  },

  // Enhanced User Problem Progress Operations
  async getUserProblems(userId, filters = {}) {
    let query = supabase
      .from('user_problems')
      .select(`
        *,
        problems (
          *,
          problem_tags (tag_name, tag_type)
        )
      `)
      .eq('user_id', userId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.bookmarked) {
      query = query.eq('is_bookmarked', true);
    }
    if (filters.interview_ready) {
      query = query.eq('is_interview_ready', true);
    }
    if (filters.needs_revision) {
      query = query.or('status.eq.Needs Revision,confidence_level.lte.3');
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(userProblem => ({
      ...userProblem.problems,
      tags: userProblem.problems.problem_tags.map(tag => tag.tag_name),
      company_tags: userProblem.problems.company_tags || [],
      pattern_tags: userProblem.problems.pattern_tags || [],
      status: userProblem.status,
      personal_notes: userProblem.personal_notes,
      time_complexity: userProblem.time_complexity,
      space_complexity: userProblem.space_complexity,
      approach_notes: userProblem.approach_notes,
      key_insights: userProblem.key_insights,
      common_mistakes: userProblem.common_mistakes,
      revision_notes: userProblem.revision_notes,
      difficulty_rating: userProblem.difficulty_rating,
      confidence_level: userProblem.confidence_level,
      last_attempted_at: userProblem.last_attempted_at,
      completed_at: userProblem.completed_at,
      last_revised_at: userProblem.last_revised_at,
      revision_count: userProblem.revision_count,
      is_bookmarked: userProblem.is_bookmarked,
      is_interview_ready: userProblem.is_interview_ready,
      user_problem_id: userProblem.id
    }));
  },

  async updateUserProblemStatus(userId, problemId, status, additionalData = {}) {
    const updateData = {
      user_id: userId,
      problem_id: problemId,
      status,
      last_attempted_at: new Date().toISOString(),
      ...additionalData
    };

    if (status === 'Done') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_problems')
      .upsert(updateData, { onConflict: ['user_id', 'problem_id'] })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markForRevision(userId, problemId, revisionNotes = '') {
    const { data, error } = await supabase
      .from('user_problems')
      .upsert({
        user_id: userId,
        problem_id: problemId,
        status: 'Needs Revision',
        revision_notes: revisionNotes,
        last_revised_at: new Date().toISOString(),
        revision_count: supabase.raw('COALESCE(revision_count, 0) + 1')
      }, { onConflict: ['user_id', 'problem_id'] })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleBookmark(userId, problemId, isBookmarked) {
    const { data, error } = await supabase
      .from('user_problems')
      .upsert({
        user_id: userId,
        problem_id: problemId,
        is_bookmarked: isBookmarked
      }, { onConflict: ['user_id', 'problem_id'] })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateConfidenceLevel(userId, problemId, confidenceLevel) {
    const { data, error } = await supabase
      .from('user_problems')
      .upsert({
        user_id: userId,
        problem_id: problemId,
        confidence_level: confidenceLevel
      }, { onConflict: ['user_id', 'problem_id'] })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Enhanced Code Snippets Operations
  async getCodeSnippets(userId, problemId) {
    const { data, error } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .order('version', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async saveCodeSnippet(userId, problemId, codeData) {
    // Get the next version number
    const { data: existingSnippets } = await supabase
      .from('code_snippets')
      .select('version')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .eq('language', codeData.language)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = existingSnippets && existingSnippets.length > 0 
      ? existingSnippets[0].version + 1 
      : 1;

    const { data, error } = await supabase
      .from('code_snippets')
      .insert({
        user_id: userId,
        problem_id: problemId,
        version: nextVersion,
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

  // Enhanced Daily Progress Operations
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
  },

  // Revision Sessions Operations
  async createRevisionSession(userId, sessionData) {
    // Remove any non-existent columns
    const { focus_topics, ...cleanSessionData } = sessionData;
    const { data, error } = await supabase
      .from('revision_sessions')
      .insert({
        user_id: userId,
        ...cleanSessionData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRevisionSessions(userId, limit = 10) {
    const { data, error } = await supabase
      .from('revision_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Analytics and Insights
  async getRevisionInsights(userId) {
    const { data, error } = await supabase
      .from('user_problems')
      .select(`
        status,
        confidence_level,
        revision_count,
        is_interview_ready,
        problems (difficulty, topic)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async getProblemsNeedingRevision(userId, limit = 20) {
    const { data, error } = await supabase
      .from('user_problems')
      .select(`
        *,
        problems (*)
      `)
      .eq('user_id', userId)
      .or('status.eq.Needs Revision,confidence_level.lte.3')
      .order('last_revised_at', { ascending: true, nullsFirst: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getInterviewReadyProblems(userId) {
    const { data, error } = await supabase
      .from('user_problems')
      .select(`
        *,
        problems (*)
      `)
      .eq('user_id', userId)
      .eq('is_interview_ready', true)
      .order('last_revised_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};