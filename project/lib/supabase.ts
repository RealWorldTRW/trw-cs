import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ConversationReport {
  id: string;
  conversation_id: string | null;
  category: string;
  summary: string | null;
  created_at: string | null;
}

export interface Profile {
  id: string;
  email: string | null;
  rank: 'user' | 'veteran' | 'admin';
  created_at: string | null;
}

// Auth functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  // Create profile after successful signup
  if (data.user && !error) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          rank: 'user'
        }
      ]);
    
    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Data functions
export const getConversationReports = async () => {
  const { data, error } = await supabase
    .from('conversation_reports')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getReportsByCategory = async () => {
  const { data, error } = await supabase
    .from('conversation_reports')
    .select('category')
    .order('category');
  
  if (error) return { data: null, error };
  
  const categoryCounts = data.reduce((acc: Record<string, number>, report) => {
    acc[report.category] = (acc[report.category] || 0) + 1;
    return acc;
  }, {});
  
  return { data: categoryCounts, error: null };
};

export const getReportsStats = async () => {
  const { data, error } = await supabase
    .from('conversation_reports')
    .select('*');
  
  if (error) return { data: null, error };
  
  const total = data.length;
  const today = new Date().toISOString().split('T')[0];
  const todayReports = data.filter(report => 
    report.created_at?.startsWith(today)
  ).length;
  
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const weekReports = data.filter(report => 
    new Date(report.created_at || '') >= last7Days
  ).length;
  
  return {
    data: {
      total,
      today: todayReports,
      week: weekReports,
      categories: [...new Set(data.map(r => r.category))].length
    },
    error: null
  };
};