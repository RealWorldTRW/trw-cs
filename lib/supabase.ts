import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface ConversationReport {
  id: string;
  conversation_id: string | null;
  category: string;
  summary: string | null;
  created_at: string | null;
  resolution_status: string | null;
  leaky_bucket_reason: string | null;
  sentiment: string | null;
  tags: any | null;
  quick_insight: string | null;
  conversation_history: any | null;
  conversation_created_at: string | null;
  conversation_updated_at: string | null;
  admin_assignee_id: string | null;
  team_assignee_id: string | null;
  is_open: boolean | null;
  conversation_state: string | null;
  priority: string | null;
  waiting_since: string | null;
  snoozed_until: string | null;
  source_url: string | null;
  source_author_id: string | null;
  source_author_type: string | null;
  contact_id: string | null;
  contact_external_id: string | null;
  language: string | null;
  ai_title: string | null;
  ai_agent_participated: boolean | null;
  time_to_assignment: number | null;
  time_to_admin_reply: number | null;
  median_time_to_reply: number | null;
  count_reopens: number | null;
  count_assignments: number | null;
  count_conversation_parts: number | null;
  first_contact_reply_at: string | null;
  first_admin_reply_at: string | null;
  last_contact_reply_at: string | null;
  last_admin_reply_at: string | null;
  conversation_rating: any | null;
  agent_name: string | null;
}

export interface Profile {
  id: string;
  email: string | null;
  rank: 'user' | 'veteran' | 'admin';
  created_at: string | null;
}

// Auth functions
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return { data, error };
  }

  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: data.user.id,
      email: data.user.email,
      rank: 'user',
    },
  ]);

  if (profileError) {
    console.error('Error creating profile:', profileError);
  }

  return { data, error };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Profile>
) => {
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
};

// Data functions
export const getConversationReports = async () => {
  return await supabase
    .from('conversation_reports')
    .select('*')
    .order('created_at', { ascending: false });
};

export const getConversationReportsByDate = async (startDate: string, endDate?: string) => {
  let query = supabase
    .from('conversation_reports')
    .select('*')
    .gte('conversation_created_at', startDate);

  if (endDate) {
    // Add 23:59:59 to include the whole end day
    query = query.lte('conversation_created_at', endDate + 'T23:59:59.999Z');
  }

  return await query.order('conversation_created_at', { ascending: false });
};

export const getReportsByCategory = async () => {
  const { data, error } = await supabase
    .from('conversation_reports')
    .select('category')
    .order('category');

  if (error || !data) {
    return { data: null, error };
  }

  const categoryCounts = data.reduce((acc: Record<string, number>, report: { category: string }) => {
    acc[report.category] = (acc[report.category] || 0) + 1;
    return acc;
  }, {});

  return { data: categoryCounts, error: null };
};

export const getReportsStats = async () => {
  const { data, error } = await supabase
    .from('conversation_reports')
    .select('conversation_created_at, count_conversation_parts, resolution_status')
    .gte('conversation_created_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

  if (error || !data) {
    return { data: null, error };
  }

  const total = data.length;

  let totalEffort = 0;
  let escalatedTotal = 0;

  data.forEach((r: any) => {
    totalEffort += (r.count_conversation_parts || 0);
    if (r.resolution_status === 'escalated_to_support') {
      escalatedTotal++;
    }
  });

  const escalationRate = total > 0 ? Math.round((escalatedTotal / total) * 100) : 0;

  return {
    data: {
      total,                  // Total Conversations (30d)
      effort: totalEffort,    // Human Support Effort
      escalations: escalationRate, // Escalation Rate %
    },
    error: null,
  };
};