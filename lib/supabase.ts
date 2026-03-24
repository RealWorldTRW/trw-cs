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
    .select('category, created_at');

  if (error || !data) {
    return { data: null, error };
  }

  const total = data.length;
  const today = new Date().toISOString().split('T')[0];

  const todayReports = data.filter((report: { created_at: string | null }) =>
    report.created_at?.startsWith(today)
  ).length;

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const weekReports = data.filter((report: { created_at: string | null }) => {
    if (!report.created_at) return false;
    return new Date(report.created_at) >= last7Days;
  }).length;

  return {
    data: {
      total,
      today: todayReports,
      week: weekReports,
      categories: Array.from(new Set(data.map((r: { category: string }) => r.category))).length,
    },
    error: null,
  };
};