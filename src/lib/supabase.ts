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
  async createUserProfile(user: { id: string; email: string; user_metadata?: { full_name?: string; avatar_url?: string } }, additionalData: { [key: string]: any } = {}): Promise<any> {
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

  async getUserProfile(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: { [key: string]: any }): Promise<any> {
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
  async getProblems(filters: { [key: string]: any } = {}): Promise<any[]> {
    let query = supabase
      .from('problems')
      .select(`
        *,
        problem_tags (tag_name, tag_type)
      `)
      .eq('is_active', true);

    if (filters.onlyExamples) {
      query = query.is('created_by', null).limit(10);
    } else if (filters.userId) {
      query = query.eq('created_by', filters.userId);
    }

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

    return data.map((problem: any) => ({
      ...problem,
      tags: problem.problem_tags.map((tag: { tag_name: string }) => tag.tag_name),
      company_tags: problem.company_tags || [],
      pattern_tags: problem.pattern_tags || []
    }));
  },

  async createProblem(problemData: { [key: string]: any }): Promise<any> {
    const { data, error } = await supabase
      .from('problems')
      .insert(problemData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProblem(problemId: string, updates: { [key: string]: any }): Promise<any> {
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

  /**
   * Archive (soft-delete) a problem by setting is_active to false.
   * Only the owner (created_by) can perform this action.
   * Returns the updated problem row.
   * @param {string} problemId - The ID of the problem to archive.
   * @param {string} userId - The ID of the user performing the action.
   */
  async deleteProblem(problemId: string, userId: string): Promise<any> {
    if (!problemId) throw new Error('No problem ID provided for archive.');
    if (!userId) throw new Error('No user ID provided for archive.');
    // Only allow updating is_active
    const payload = { is_active: false };
    // Pre-update existence check (optional, for consistency)
    const { data: exists, error: selectError } = await supabase
      .from('problems')
      .select('id')
      .eq('id', problemId)
      .eq('created_by', userId)
      .maybeSingle();
    if (selectError) throw selectError;
    if (!exists) throw new Error(`Problem with id ${problemId} does not exist or you do not have permission.`);
    // Proceed with archive
    const { data, error } = await supabase
      .from('problems')
      .update(payload)
      .eq('id', problemId)
      .eq('created_by', userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('No problem found to archive.');
    return data;
  },

  // Enhanced User Problem Progress Operations
  async getUserProblems(userId: string, filters: { [key: string]: any } = {}): Promise<any[]> {
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

    return data.map((userProblem: any) => ({
      ...userProblem.problems,
      tags: userProblem.problems.problem_tags.map((tag: { tag_name: string }) => tag.tag_name),
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

  async updateUserProblemStatus(userId: string, problemId: string, status: string, additionalData: { [key: string]: any } = {}): Promise<any> {
    const updateData = {
      user_id: userId,
      problem_id: problemId,
      status,
      last_attempted_at: new Date().toISOString(),
      ...additionalData
    };

    if (status === 'Done') {
      if ('completed_at' in updateData) { updateData.completed_at = new Date().toISOString(); }
    }

    const { data, error } = await supabase
      .from('user_problems')
      .upsert([updateData], { onConflict: 'user_id,problem_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markForRevision(userId: string, problemId: string, revisionNotes: string = ''): Promise<any> {
    // Fetch current revision_count
    const { data: currentRevisionCount } = await supabase
      .from('user_problems')
      .select('revision_count')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .single();

    const nextRevisionCount = (currentRevisionCount?.revision_count || 0) + 1;

    const { data, error } = await supabase
      .from('user_problems')
      .upsert([{
        user_id: userId,
        problem_id: problemId,
        status: 'Needs Revision',
        revision_notes: revisionNotes,
        last_revised_at: new Date().toISOString(),
        revision_count: nextRevisionCount
      }], { onConflict: 'user_id,problem_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleBookmark(userId: string, problemId: string, isBookmarked: boolean): Promise<any> {
    const { data, error } = await supabase
      .from('user_problems')
      .upsert([{
        user_id: userId,
        problem_id: problemId,
        is_bookmarked: isBookmarked
      }], { onConflict: 'user_id,problem_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateConfidenceLevel(userId: string, problemId: string, confidenceLevel: number): Promise<any> {
    const { data, error } = await supabase
      .from('user_problems')
      .upsert([{
        user_id: userId,
        problem_id: problemId,
        confidence_level: confidenceLevel
      }], { onConflict: 'user_id,problem_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Enhanced Code Snippets Operations
  async getCodeSnippets(userId: string, problemId: string): Promise<any[]> {
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

  async saveCodeSnippet(userId: string, problemId: string, codeData: { [key: string]: any }): Promise<any> {
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

  async updateCodeSnippet(snippetId: string, updates: { [key: string]: any }): Promise<any> {
    const { data, error } = await supabase
      .from('code_snippets')
      .update(updates)
      .eq('id', snippetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCodeSnippet(snippetId: string): Promise<void> {
    const { error } = await supabase
      .from('code_snippets')
      .delete()
      .eq('id', snippetId);

    if (error) throw error;
  },

  // Enhanced Daily Progress Operations
  async getDailyProgress(userId: string, startDate: string, endDate: string): Promise<any[]> {
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

  async updateDailyProgress(userId: string, date: string, progressData: { [key: string]: any }): Promise<any> {
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
  async getUserBadges(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at');

    if (error) throw error;
    return data;
  },

  async unlockBadge(userId: string, badgeData: { [key: string]: any }): Promise<any> {
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
  async createRevisionSession(userId: string, sessionData: { [key: string]: any }): Promise<any> {
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

  async getRevisionSessions(userId: string, limit: number = 10): Promise<any[]> {
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
  async getRevisionInsights(userId: string): Promise<any[]> {
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

  async getProblemsNeedingRevision(userId: string, limit: number = 20): Promise<any[]> {
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

  async getInterviewReadyProblems(userId: string): Promise<any[]> {
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
  },

  /**
   * Reset all user data for a full account reset.
   * Deletes user-specific data from all relevant tables and resets user profile stats.
   * @param {string} userId - The ID of the user to reset.
   */
  async resetUserData(userId: string): Promise<any> {
    if (!userId) throw new Error('No user ID provided for reset.');
    // Delete user-specific data from all relevant tables
    const tables = [
      'user_problems',
      'code_snippets',
      'daily_progress',
      'user_badges',
      'revision_sessions'
    ];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    }
    // Reset user profile stats (but keep the profile row)
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        total_xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        daily_goal: 1
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};